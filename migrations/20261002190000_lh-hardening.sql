-- Hardening pass after the concierge build.
--
-- Three classes of leftover diagnostic surface are removed here:
--   1. lh_whoami()                 — published role / BYPASSRLS info to any caller.
--   2. lh_admin_* RPCs             — return lead PII and full transcripts, and were
--                                    EXECUTE-granted to anon. They are SECURITY
--                                    INVOKER so RLS shields them today, but they
--                                    carry no admin auth of their own, so a single
--                                    future permissive SELECT policy would turn them
--                                    into an anonymous PII dump.
--   3. anon INSERT/UPDATE policies — every write now goes through the SECURITY
--                                    DEFINER RPCs lh_conv_touch / lh_commit_lead /
--                                    lh_commit_booking. The direct policies only
--                                    allowed unvalidated rows (spam leads, orphan
--                                    bookings) to be written blind.
--
-- All three objects are owned by project_admin, which retains access regardless of
-- the PUBLIC/anon/authenticated revokes below.

-- 1. Diagnostic RPC. Never called by the concierge.
drop function if exists public.lh_whoami();

-- 2. Admin read RPCs. Deliberately not re-granted: a future admin surface should
--    add its own grant explicitly rather than inherit an anonymous one.
revoke execute on function public.lh_admin_snapshot(integer) from public, anon, authenticated;
revoke execute on function public.lh_admin_transcript(text) from public, anon, authenticated;

-- 3. Redundant anonymous write policies on the concierge tables.
drop policy if exists lh_lead_anon_insert         on public.lh_lead;
drop policy if exists lh_booking_anon_insert      on public.lh_booking;
drop policy if exists lh_message_anon_insert      on public.lh_message;
drop policy if exists lh_conversation_anon_insert on public.lh_conversation;
drop policy if exists lh_conversation_anon_update on public.lh_conversation;

-- Sanity: RLS stays on everywhere, and the public catalogue stays publicly readable.
alter table public.lh_lead         enable row level security;
alter table public.lh_booking      enable row level security;
alter table public.lh_conversation enable row level security;
alter table public.lh_message      enable row level security;
alter table public.lh_property     enable row level security;
alter table public.lh_knowledge    enable row level security;