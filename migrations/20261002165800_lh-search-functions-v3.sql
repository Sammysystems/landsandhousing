-- LandsandHousing Property Concierge — search RPCs (v3)
--
-- Fixes v2's worst defect. v2's layer-2 fallback ran whenever layer 1 missed, and
-- with no structured filters supplied it degenerated into "return the whole
-- catalogue". So "commercial office space" AND "zzzz nonexistent" both returned
-- matched_by=filters, count=6 — a nonsense query looked like a 6-property match.
--
-- The rule is now: if the caller gave free text and no text layer matched, we do
-- NOT silently widen. We only fall through to filters when the caller actually
-- supplied a structured filter, and otherwise report "none" so the concierge can
-- say it has no matching listing instead of inventing one by dumping the catalogue.
--
-- Same signatures as v2, so CREATE OR REPLACE applies cleanly.

DROP FUNCTION IF EXISTS public.lh_search_properties(text,text,text,text,bigint,int,int,numeric,int,int);
DROP FUNCTION IF EXISTS public.lh_search_knowledge(text,text,int);

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
  has_filter boolean :=
       arg_purpose IS NOT NULL OR arg_ptype IS NOT NULL OR arg_zone IS NOT NULL
    OR arg_max_price IS NOT NULL OR arg_min_beds IS NOT NULL OR arg_max_beds IS NOT NULL
    OR arg_min_baths IS NOT NULL OR arg_min_size IS NOT NULL;
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

    -- Free text missed and no structured filter to fall back on.
    -- Report honestly instead of returning the entire catalogue.
    IF NOT has_filter THEN
      RETURN jsonb_build_object('matched_by', 'none', 'count', 0, 'items', '[]'::jsonb);
    END IF;
  END IF;

  -- Layer 2: structured filters only (free text ignored)
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

    -- Same honesty rule: free text that matched nothing returns none.
    IF arg_category IS NULL THEN
      RETURN jsonb_build_object('matched_by', 'none', 'count', 0, 'items', '[]'::jsonb);
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

GRANT EXECUTE ON FUNCTION public.lh_search_properties(text,text,text,text,bigint,int,int,numeric,int,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_search_knowledge(text,text,int) TO anon, authenticated;