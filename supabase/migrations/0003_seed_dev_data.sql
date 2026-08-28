-- Dev/local-only seed data. Do NOT run this against production — production
-- admin allowlist entries and org data should be entered through the admin UI
-- (or a one-off manual insert) once real coach/family emails are known.

insert into admin_allowlist (email) values
  ('rezadashlsa@gmail.com')
  -- ('caroline@example.com')  -- add Caroline's real sign-in email before applying
on conflict do nothing;

insert into coaches (name, email) values
  ('Test Coach', 'test.coach@example.com')
on conflict do nothing;

insert into families (primary_parent_name, primary_parent_email) values
  ('Test Parent', 'test.parent@example.com')
on conflict do nothing;

insert into students (family_id, name, type, grade)
select f.id, 'Test HP Student', 'hp', '10'
from families f where f.primary_parent_email = 'test.parent@example.com'
on conflict do nothing;

insert into students (family_id, name, type, grade)
select f.id, 'Test General Student', 'general', '8'
from families f where f.primary_parent_email = 'test.parent@example.com'
on conflict do nothing;
