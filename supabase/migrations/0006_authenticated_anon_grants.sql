-- Root-cause fix: this project never received Supabase's standard baseline
-- grants for the `anon` and `authenticated` roles (only `service_role` was
-- fixed in 0005). Without a GRANT, a role is blocked from a table entirely,
-- regardless of RLS policies — GRANTs and RLS are two separate layers.
-- RLS policies (0002) remain the real fine-grained access control; this just
-- removes the blanket "permission denied for table X" wall in front of them.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
