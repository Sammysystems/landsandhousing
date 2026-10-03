-- Diagnostic: report the identity a request actually runs as, so RLS denials can be
-- attributed to the right role. Safe to keep: it exposes no data beyond role names.
DROP FUNCTION IF EXISTS public.lh_whoami();

CREATE FUNCTION public.lh_whoami()
RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'current_user', current_user,
    'session_user', session_user,
    'row_security_setting', current_setting('row_security', true),
    'bypassrls', (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user),
    'is_superuser', (SELECT rolsuper FROM pg_roles WHERE rolname = current_user),
    'has_insert_lead', has_table_privilege(current_user, 'public.lh_lead', 'INSERT'),
    'has_select_lead', has_table_privilege(current_user, 'public.lh_lead', 'SELECT')
  );
$$;

GRANT EXECUTE ON FUNCTION public.lh_whoami() TO anon, authenticated;