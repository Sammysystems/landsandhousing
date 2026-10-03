-- Pre-qualified lead capture.
--
-- Why SECURITY DEFINER: the browser must never hold an InsForge key, and RLS
-- correctly denies anonymous writes. Rather than loosening those policies (which
-- would let anyone insert junk leads), we expose three narrow functions that run
-- as project_admin -- which has BYPASSRLS -- and validate their own inputs.
-- Tables stay locked; only these three entry points are callable.

-- ---------------------------------------------------------------- schema bits
ALTER TABLE public.lh_conversation
  ADD COLUMN IF NOT EXISTS qualification jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.lh_lead
  ADD COLUMN IF NOT EXISTS summary       text,
  ADD COLUMN IF NOT EXISTS qualification jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes         text,
  ADD COLUMN IF NOT EXISTS qualified     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.lh_booking
  ADD COLUMN IF NOT EXISTS property_title text,
  ADD COLUMN IF NOT EXISTS source         text NOT NULL DEFAULT 'concierge';

-- Upsert on session_id needs a unique key.
CREATE UNIQUE INDEX IF NOT EXISTS lh_conversation_session_id_key
  ON public.lh_conversation (session_id);

-- ------------------------------------------------------- 1. conversation state
-- Records the conversation, merges the qualification draft, appends one turn.
DROP FUNCTION IF EXISTS public.lh_conv_touch(text, jsonb, jsonb, text);
CREATE FUNCTION public.lh_conv_touch(
  arg_session_id   text,
  arg_qualification jsonb DEFAULT NULL,
  arg_entry        jsonb    DEFAULT NULL,
  arg_summary      text     DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_qual jsonb;
BEGIN
  IF arg_session_id IS NULL OR length(btrim(arg_session_id)) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid session');
  END IF;

  INSERT INTO public.lh_conversation (id, session_id, qualification, transcript)
  VALUES (gen_random_uuid(), left(btrim(arg_session_id), 120), '{}'::jsonb, '[]'::jsonb)
  ON CONFLICT (session_id) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;

  UPDATE public.lh_conversation
  SET qualification = qualification || coalesce(arg_qualification, '{}'::jsonb),
      transcript    = CASE WHEN arg_entry IS NULL OR jsonb_typeof(arg_entry) IS NULL
                           THEN transcript
                           ELSE transcript || jsonb_build_array(arg_entry) END,
      summary       = coalesce(arg_summary, summary),
      updated_at    = now()
  WHERE id = v_id
  RETURNING qualification INTO v_qual;

  RETURN jsonb_build_object(
    'ok', true, 'conversationId', v_id, 'qualification', v_qual);
END;
$$;

-- ---------------------------------------------------------- 2. commit the lead
-- Promotes a qualified conversation into a lead row, with the summary the agent
-- will read. Re-running updates the existing lead instead of duplicating it.
DROP FUNCTION IF EXISTS public.lh_commit_lead(text, text, text, text, text, jsonb);
CREATE FUNCTION public.lh_commit_lead(
  arg_session_id   text,
  arg_name         text,
  arg_phone        text,
  arg_email        text,
  arg_summary      text DEFAULT NULL,
  arg_qualification jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv  public.lh_conversation%ROWTYPE;
  v_lead  bigint;
  v_qual  jsonb;
  v_phone text;
BEGIN
  SELECT * INTO v_conv FROM public.lh_conversation
   WHERE session_id = left(btrim(arg_session_id), 120);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no conversation');
  END IF;

  IF arg_name IS NULL OR length(btrim(arg_name)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'name required');
  END IF;

  v_phone := regexp_replace(coalesce(arg_phone, ''), '[^0-9]', '', 'g');
  IF length(v_phone) < 7 OR length(v_phone) > 15 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'phone required');
  END IF;

  v_qual := coalesce(arg_qualification, v_conv.qualification, '{}'::jsonb);

  IF v_conv.lead_id IS NOT NULL THEN
    UPDATE public.lh_lead
       SET name = btrim(arg_name),
           phone = v_phone,
           email = nullif(btrim(coalesce(arg_email, '')), ''),
           summary = coalesce(arg_summary, summary),
           qualification = v_qual,
           qualified = true,
           updated_at = now()
     WHERE id = v_conv.lead_id
    RETURNING id INTO v_lead;
  ELSE
    INSERT INTO public.lh_lead
      (name, phone, email, source, intent, status, summary, qualification, qualified)
    VALUES (
      btrim(arg_name),
      v_phone,
      nullif(btrim(coalesce(arg_email, '')), ''),
      'concierge',
      coalesce(v_qual ->> 'purpose', 'general'),
      'qualified',
      arg_summary,
      v_qual,
      true
    )
    RETURNING id INTO v_lead;

    UPDATE public.lh_conversation SET lead_id = v_lead, updated_at = now()
     WHERE id = v_conv.id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'leadId', v_lead, 'summary', coalesce(arg_summary, v_conv.summary));
END;
$$;

-- ------------------------------------------------------- 3. commit the booking
-- Only reachable once a lead exists for the session, so an inspection can never
-- be attached to nobody.
DROP FUNCTION IF EXISTS public.lh_commit_booking(text, text, text, date, text, text);
CREATE FUNCTION public.lh_commit_booking(
  arg_session_id     text,
  arg_property_id    text,
  arg_property_title text,
  arg_date           date,
  arg_window         text,
  arg_notes          text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv public.lh_conversation%ROWTYPE;
  v_book bigint;
BEGIN
  SELECT * INTO v_conv FROM public.lh_conversation
   WHERE session_id = left(btrim(arg_session_id), 120);

  IF NOT FOUND OR v_conv.lead_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'qualification required');
  END IF;

  IF arg_date IS NULL OR arg_date < current_date THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid date');
  END IF;

  INSERT INTO public.lh_booking
    (conversation_id, lead_id, property_id, property_title,
     preferred_date, preferred_window, notes, status, source)
  VALUES (
    v_conv.id, v_conv.lead_id,
    nullif(left(btrim(coalesce(arg_property_id, '')), 120), ''),
    nullif(left(btrim(coalesce(arg_property_title, '')), 240), ''),
    arg_date,
    left(lower(btrim(coalesce(arg_window, 'flexible'))), 20),
    left(btrim(coalesce(arg_notes, '')), 1000),
    'pending',
    'concierge'
  )
  RETURNING id INTO v_book;

  RETURN jsonb_build_object('ok', true, 'bookingId', v_book, 'leadId', v_conv.lead_id);
END;
$$;

-- ------------------------------------------------------------------- hardening
REVOKE ALL ON FUNCTION public.lh_conv_touch(text, jsonb, jsonb, text)       FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lh_commit_lead(text, text, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lh_commit_booking(text, text, text, date, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.lh_conv_touch(text, jsonb, jsonb, text)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_commit_lead(text, text, text, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lh_commit_booking(text, text, text, date, text, text) TO anon, authenticated;
