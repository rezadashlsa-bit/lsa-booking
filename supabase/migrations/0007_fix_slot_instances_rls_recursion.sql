-- Fix: `slot_instances`' parent-eligibility policy queries `slot_instance_students`
-- directly, and `slot_instance_students`'s own coach policy queries back into
-- `slot_instances` — Postgres detects this as infinite recursion (42P17) and
-- refuses to run ANY query against slot_instances at all, for any role.
-- Fix: read slot_instance_students through a SECURITY DEFINER function, which
-- bypasses RLS on that inner lookup entirely and breaks the cycle.
create or replace function is_student_named_on_slot(p_slot_instance_id uuid, p_student_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from slot_instance_students sis
    where sis.slot_instance_id = p_slot_instance_id and sis.student_id = p_student_id
  );
$$;
grant execute on function is_student_named_on_slot(uuid, uuid) to authenticated;

drop policy if exists slots_parent_select_eligible on slot_instances;
create policy slots_parent_select_eligible on slot_instances
  for select using (
    auth_role() = 'parent'
    and status = 'open'
    and starts_at > now()
    and exists (
      select 1 from students s
      where s.family_id = auth_family_id()
        and s.active
        and (
          slot_instances.eligibility_type = 'open_all'
          or (slot_instances.eligibility_type = 'hp_only' and s.type = 'hp')
          or (slot_instances.eligibility_type = 'general_only' and s.type = 'general')
          or (
            slot_instances.eligibility_type = 'named_only'
            and is_student_named_on_slot(slot_instances.id, s.id)
          )
        )
    )
  );
