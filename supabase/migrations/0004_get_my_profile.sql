-- Fixes a mismatch where auth.getUser() correctly identifies the caller but a
-- plain RLS-gated `select * from profiles where id = ...` intermittently
-- returns no row for that same identity. Reading the profile through a
-- SECURITY DEFINER function (the same pattern ensure_profile/book_slot already
-- use successfully) sidesteps the ambiguity entirely.
create or replace function get_my_profile() returns profiles
language sql stable security definer set search_path = public as $$
  select * from profiles where id = auth.uid();
$$;
grant execute on function get_my_profile() to authenticated;
