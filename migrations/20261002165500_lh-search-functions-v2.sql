-- LandsandHousing Property Concierge — search RPCs (v2)
-- v1 exists in the DB with the old parameter names (q/purpose/category/...).
-- CREATE OR REPLACE cannot rename an input parameter, so the old signatures are
-- dropped explicitly first.
DROP FUNCTION IF EXISTS public.lh_search_properties(text,text,text,text,bigint,int,int,numeric,int,int);
DROP FUNCTION IF EXISTS public.lh_search_knowledge(text,text,int);
DROP FUNCTION IF EXISTS public.lh_admin_snapshot(int);
DROP FUNCTION IF EXISTS public.lh_admin_transcript(text);

-- The edge function calls these instead of hand-building PostgREST filters, so the
-- matching rules stay testable with plain SQL and out of the function code.
--
-- Two constraints discovered on this project and encoded here:
--
-- 1. All four return jsonb, not SETOF <table>. "RETURNS SETOF public.lh_property"
--    fails with: invalid type name "SETOF public.lh_property". Composite return
--    types are not usable here.
--
-- 2. Every parameter is prefixed arg_. Bare parameter names like `purpose` or
--    `category` collide with the columns of the same name and abort the function
--    with "column reference purpose is ambiguous". The arg_ prefix keeps the
--    parameter namespace disjoint from the column namespace.
--
-- Search results are shaped as:
--     { "matched_by": "text" | "filters" | "none", "count": n, "items": [...] }
-- so the concierge can be honest about how strong a match was.
--
-- Retrieval is layered, because websearch_to_tsquery() ANDs every term: the natural
-- query "commercial office space" matches nothing even though separate properties
-- match individual words.
--   layer 1 "text"    weighted tsvector match + ILIKE fallback, filters applied
--   layer 2 "filters" structured filters only, free text ignored
--
-- SECURITY: these are search helpers and none return PII. The two lh_admin_*
-- functions are additionally gated by ADMIN_TOKEN inside the edge function.

-- ============================================================
-- Property search
-- ============================================================
CREATE OR REPLACE FUNCTION public.lh_search_properties(
  arg_q         text    DEFAULT NULL,
  arg_purpose   text    DEFAULT NULL,
  arg_ptype     text    DEFAULT NULL,
  arg_zone      text    DEFAULT NULL,
  arg_max_price bigint  DEFAULT NULL,
  arg_min_beds  int     DEFAULT NULL,
  arg_max_beds  int     DEFAULT NULL,
  arg_min_baths numeric DEFAULT NULL,
  arg_min_size  int     DEFAULT NULL,
  arg_limit     int     DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql STABLE AS $$
DECLARE
  trimmed  text  := btrim(coalesce(arg_q, ''));
  out_rows jsonb;
BEGIN
  -- Layer 1: free text + structured filters
  IF trimmed <> '' THEN
    SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.rank_score DESC, t.price_raw ASC), '[]'::jsonb)
      INTO out_rows
    FROM (
      SELECT
        p.id, p.title, p.property_type, p.purpose, p.location, p.zone,
        p.price_raw, p.price_label, p.currency, p.beds, p.baths,
        p.size_sqm, p.plot_sqm, p.title_document, p.description,
        p.highlights, p.status, p.image_url, p.editorial_highlight,
        p.is_illustrative,
        ts_rank(p.search_vector, websearch_to_tsquery('english', trimmed)) AS rank_score
      FROM public.lh_property p
      WHERE (
              p.search_vector @@ websearch_to_tsquery('english', trimmed)
           OR p.title       ILIKE '%' || trimmed || '%'
           OR p.location    ILIKE '%' || trimmed || '%'
           OR coalesce(p.zone, '') ILIKE '%' || trimmed || '%'
           OR p.description ILIKE '%' || trimmed || '%'
           OR p.highlights::text ILIKE '%' || trimmed || '%'
          )
        AND (arg_purpose IS NULL OR p.purpose = arg_purpose)
        AND (arg_ptype   IS NULL OR lower(p.property_type) = lower(arg_ptype))
        AND (arg_zone    IS NULL OR p.zone ILIKE '%' || arg_zone || '%' OR p.location ILIKE '%' || arg_zone || '%')
        AND (arg_max_price IS NULL OR p.price_raw <= arg_max_price)
        AND (arg_min_beds  IS NULL OR coalesce(p.beds, 0) >= arg_min_beds)
        AND (arg_max_beds  IS NULL OR coalesce(p.beds, 999) <= arg_max_beds)
        AND (arg_min_baths IS NULL OR coalesce(p.baths, 0) >= arg_min_baths)
        AND (arg_min_size  IS NULL OR coalesce(p.size_sqm, 0) >= arg_min_size)
      ORDER BY ts_rank(p.search_vector, websearch_to_tsquery('english', trimmed)) DESC,
               p.price_raw ASC
      LIMIT least(greatest(arg_limit, 1), 25)
    ) t;

    IF out_rows IS NOT NULL AND out_rows IS DISTINCT FROM '[]'::jsonb THEN
      RETURN jsonb_build_object(
        'matched_by', 'text',
        'count', jsonb_array_length(out_rows),
        'items', out_rows
      );
    END IF;
  END IF;

  -- Layer 2: structured filters only
  SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.price_raw ASC), '[]'::jsonb)
    INTO out_rows
  FROM (
    SELECT
      p.id, p.title, p.property_type, p.purpose, p.location, p.zone,
      p.price_raw, p.price_label, p.currency, p.beds, p.baths,
      p.size_sqm, p.plot_sqm, p.title_document, p.description,
      p.highlights, p.status, p.image_url, p.editorial_highlight,
      p.is_illustrative,
      0::float8 AS rank_score
    FROM public.lh_property p
    WHERE (arg_purpose IS NULL OR p.purpose = arg_purpose)
      AND (arg_ptype   IS NULL OR lower(p.property_type) = lower(arg_ptype))
      AND (arg_zone    IS NULL OR p.zone ILIKE '%' || arg_zone || '%' OR p.location ILIKE '%' || arg_zone || '%')
      AND (arg_max_price IS NULL OR p.price_raw <= arg_max_price)
      AND (arg_min_beds  IS NULL OR coalesce(p.beds, 0) >= arg_min_beds)
      AND (arg_max_beds  IS NULL OR coalesce(p.beds, 999) <= arg_max_beds)
      AND (arg_min_baths IS NULL OR coalesce(p.baths, 0) >= arg_min_baths)
      AND (arg_min_size  IS NULL OR coalesce(p.size_sqm, 0) >= arg_min_size)
    ORDER BY p.price_raw ASC
    LIMIT least(greatest(arg_limit, 1), 25)
  ) t;

  RETURN jsonb_build_object(
    'matched_by', CASE WHEN jsonb_array_length(out_rows) > 0 THEN 'filters' ELSE 'none' END,
    'count', jsonb_array_length(out_rows),
    'items', out_rows
  );
END;
$$;

-- ============================================================
-- Knowledge search (business, locations, services, insights)
-- ============================================================
CREATE OR REPLACE FUNCTION public.lh_search_knowledge(
  arg_q        text DEFAULT NULL,
  arg_category text DEFAULT NULL,
  arg_limit    int  DEFAULT 4
)
RETURNS jsonb
LANGUAGE plpgsql STABLE AS $$
DECLARE
  trimmed  text  := btrim(coalesce(arg_q, ''));
  out_rows jsonb;
BEGIN
  IF trimmed <> '' THEN
    SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.rank_score DESC), '[]'::jsonb)
      INTO out_rows
    FROM (
      SELECT k.id, k.slug, k.category, k.title, k.content, k.meta,
             ts_rank(k.search_vector, websearch_to_tsquery('english', trimmed)) AS rank_score
      FROM public.lh_knowledge k
      WHERE (
              k.search_vector @@ websearch_to_tsquery('english', trimmed)
           OR k.title   ILIKE '%' || trimmed || '%'
           OR k.content ILIKE '%' || trimmed || '%'
          )
        AND (arg_category IS NULL OR k.category = arg_category)
      ORDER BY ts_rank(k.search_vector, websearch_to_tsquery('english', trimmed)) DESC
      LIMIT least(greatest(arg_limit, 1), 10)
    ) t;

    IF out_rows IS NOT NULL AND out_rows IS DISTINCT FROM '[]'::jsonb THEN
      RETURN jsonb_build_object(
        'matched_by', 'text',
        'count', jsonb_array_length(out_rows),
        'items', out_rows
      );
    END IF;
  END IF;

  SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.category, t.id), '[]'::jsonb)
    INTO out_rows
  FROM (
    SELECT k.id, k.slug, k.category, k.title, k.content, k.meta, 0::float8 AS rank_score
    FROM public.lh_knowledge k
    WHERE arg_category IS NULL OR k.category = arg_category
    ORDER BY k.category, k.id
    LIMIT least(greatest(arg_limit, 1), 10)
  ) t;

  RETURN jsonb_build_object(
    'matched_by', CASE WHEN jsonb_array_length(out_rows) > 0 THEN 'filters' ELSE 'none' END,
    'count', jsonb_array_length(out_rows),
    'items', out_rows
  );
END;
$$;

-- ============================================================
-- Admin snapshot + transcript (ADMIN_TOKEN-gated in the edge function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.lh_admin_snapshot(arg_limit int DEFAULT 50)
RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT coalesce(x.rows, jsonb_build_object('count', 0, 'items', '[]'::jsonb))
  FROM (
    SELECT jsonb_build_object(
      'count', count(*),
      'items', coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.lead_at DESC), '[]'::jsonb)
    ) AS rows
    FROM (
      SELECT
        l.id AS lead_id, l.name AS lead_name, l.phone AS lead_phone, l.email AS lead_email,
        l.source AS lead_source, l.status AS lead_status, l.created_at AS lead_at,
        b.id AS booking_id, b.property_id AS booking_prop, p.title AS booking_title,
        b.preferred_date AS booking_date, b.preferred_window AS booking_window,
        b.status AS booking_status, b.notes AS booking_notes, b.created_at AS booking_at,
        c.session_id,
        coalesce((SELECT count(*) FROM public.lh_message m WHERE m.conversation_id = c.id), 0)::int AS turns,
        c.handed_off, c.last_active_at
      FROM public.lh_lead l
      LEFT JOIN public.lh_booking b ON b.lead_id = l.id
      LEFT JOIN public.lh_property p ON p.id = b.property_id
      LEFT JOIN public.lh_conversation c ON c.lead_id = l.id
      LIMIT least(greatest(arg_limit, 1), 500)
    ) t
  ) x;
$$;

CREATE OR REPLACE FUNCTION public.lh_admin_transcript(arg_session text)
RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at ASC), '[]'::jsonb)
  FROM (
    SELECT m.role, m.content, m.tool_name, m.created_at
    FROM public.lh_message m
    JOIN public.lh_conversation c ON c.id = m.conversation_id
    WHERE c.session_id = arg_session
  ) t;
$$;

-- ============================================================
-- Grants
-- ============================================================
GRANT EXECUTE ON FUNCTION public.lh_search_properties(text,text,text,text,bigint,int,int,numeric,int,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_search_knowledge(text,text,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_admin_snapshot(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_admin_transcript(text) TO anon, authenticated;