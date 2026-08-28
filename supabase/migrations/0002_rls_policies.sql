-- LSA RAS Booking System — RLS policies + security-definer RPCs
--
-- Mutation strategy: `bookings`, `missed_sessions` status changes, and slot-status
-- transitions all happen through SECURITY DEFINER functions (book_slot,
-- cancel_booking, mark_booking_complete, log_missed_session), never through raw
-- client UPDATE/INSERT on those tables. This keeps multi-table invariants
-- (double-booking prevention, eligibility, makeup-notice gating, slot status sync)
-- atomic and in one place, instead of split across RLS WITH CHECK clauses that
-- can't see OLD row state. Client-facing RLS on those tables is SELECT-only
-- (plus a couple of narrow admin/coach exceptions noted inline).

-- ============ HELPER FUNCTIONS (role resolution) ============
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_family_id() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from profiles where id = auth.uid();
$$;

create or replace function auth_coach_id() returns uuid
language sql stable security definer set search_path = public as $$
  select coach_id from profiles where id = auth.uid();
$$;

grant execute on function auth_role() to authenticated;
grant execute on function auth_family_id() to authenticated;
grant execute on function auth_coach_id() to authenticated;

-- ============ ENABLE RLS ============
alter table coaches enable row level security;
alter table families enable row level security;
alter table students enable row level security;
alter table profiles enable row level security;
alter table admin_allowlist enable row level security;
alter table availability_templates enable row level security;
alter table availability_template_students enable row level security;
alter table slot_instances enable row level security;
alter table slot_instance_students enable row level security;
alter table bookings enable row level security;
alter table missed_sessions enable row level security;
alter table email_log enable row level security;

-- ============ profiles ============
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or auth_role() = 'admin');
-- No client-side insert/update/delete: rows are created only by ensure_profile().

-- ============ admin_allowlist ============
-- No policies granted to authenticated/anon -> RLS default-denies all client access.
-- Only SECURITY DEFINER functions (which run as the function owner, bypassing RLS) can read it.

-- ============ coaches ============
create policy coaches_select_all_authenticated on coaches
  for select using (auth.role() = 'authenticated');
create policy coaches_admin_write on coaches
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- ============ families ============
create policy families_admin_all on families
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy families_select_own on families
  for select using (id = auth_family_id());

-- ============ students ============
create policy students_admin_all on students
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy students_coach_select on students
  for select using (auth_role() = 'coach');
create policy students_parent_select_own on students
  for select using (family_id = auth_family_id());

-- ============ availability_templates ============
create policy templates_admin_all on availability_templates
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy templates_coach_own on availability_templates
  for all using (auth_role() = 'coach' and coach_id = auth_coach_id())
  with check (auth_role() = 'coach' and coach_id = auth_coach_id());

-- ============ availability_template_students ============
create policy template_students_admin_all on availability_template_students
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy template_students_coach_own on availability_template_students
  for all using (
    exists (select 1 from availability_templates t
            where t.id = template_id and t.coach_id = auth_coach_id())
  )
  with check (
    exists (select 1 from availability_templates t
            where t.id = template_id and t.coach_id = auth_coach_id())
  );

-- ============ slot_instances ============
create policy slots_admin_all on slot_instances
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy slots_coach_own on slot_instances
  for all using (auth_role() = 'coach' and coach_id = auth_coach_id())
  with check (auth_role() = 'coach' and coach_id = auth_coach_id());

-- Parents may only ever SELECT open, future slots that at least one of their
-- active students is eligible for. This is the structural guarantee that a
-- general student can never see an HP-locked slot (and vice versa).
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
            and exists (
              select 1 from slot_instance_students sis
              where sis.slot_instance_id = slot_instances.id and sis.student_id = s.id
            )
          )
        )
    )
  );

-- ============ slot_instance_students ============
create policy slot_instance_students_admin_all on slot_instance_students
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy slot_instance_students_coach_own on slot_instance_students
  for all using (
    exists (select 1 from slot_instances si
            where si.id = slot_instance_id and si.coach_id = auth_coach_id())
  )
  with check (
    exists (select 1 from slot_instances si
            where si.id = slot_instance_id and si.coach_id = auth_coach_id())
  );
-- Parents need read access so the named_only EXISTS check above can actually
-- evaluate rows for their own students (RLS applies inside that subquery too).
create policy slot_instance_students_parent_select on slot_instance_students
  for select using (
    exists (select 1 from students s
            where s.id = student_id and s.family_id = auth_family_id())
  );

-- ============ bookings ============
-- SELECT only for parents/coaches; all writes go through SECURITY DEFINER RPCs.
create policy bookings_admin_all on bookings
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy bookings_coach_select on bookings
  for select using (
    exists (select 1 from slot_instances si
            where si.id = slot_instance_id and si.coach_id = auth_coach_id())
  );
create policy bookings_parent_select on bookings
  for select using (
    exists (select 1 from students s
            where s.id = student_id and s.family_id = auth_family_id())
  );

-- ============ missed_sessions ============
create policy missed_sessions_admin_all on missed_sessions
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy missed_sessions_coach_select on missed_sessions
  for select using (
    exists (select 1 from slot_instances si
            where si.id = original_slot_instance_id and si.coach_id = auth_coach_id())
  );
create policy missed_sessions_parent_select on missed_sessions
  for select using (
    exists (select 1 from students s
            where s.id = student_id and s.family_id = auth_family_id())
  );

-- ============ email_log ============
create policy email_log_admin_all on email_log
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- ============ RPC: ensure_profile ============
-- Called right after OAuth sign-in. Matches the signed-in email against the
-- admin allowlist, then coaches, then families, and creates the profiles row.
-- Returns null if the email isn't recognized (caller routes to /pending-approval).
create or replace function ensure_profile() returns profiles
language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  v_profile profiles;
  v_family_id uuid;
  v_coach_id uuid;
begin
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null then
    raise exception 'not authenticated';
  end if;

  select * into v_profile from profiles where id = auth.uid();
  if found then
    return v_profile;
  end if;

  if exists (select 1 from admin_allowlist a where lower(a.email) = lower(v_email)) then
    insert into profiles (id, email, role)
      values (auth.uid(), v_email, 'admin')
      returning * into v_profile;
    return v_profile;
  end if;

  select id into v_coach_id from coaches where lower(email) = lower(v_email) and active limit 1;
  if v_coach_id is not null then
    insert into profiles (id, email, role, coach_id)
      values (auth.uid(), v_email, 'coach', v_coach_id)
      returning * into v_profile;
    return v_profile;
  end if;

  select id into v_family_id from families
    where lower(primary_parent_email) = lower(v_email) or lower(secondary_parent_email) = lower(v_email)
    limit 1;
  if v_family_id is not null then
    insert into profiles (id, email, role, family_id)
      values (auth.uid(), v_email, 'parent', v_family_id)
      returning * into v_profile;
    return v_profile;
  end if;

  return null;
end;
$$;
grant execute on function ensure_profile() to authenticated;

-- ============ RPC: book_slot ============
-- Atomic, row-locked booking. Re-validates eligibility, ownership (for parents),
-- makeup-notice gating, and double-booking regardless of what the client claims.
create or replace function book_slot(
  p_slot_instance_id uuid,
  p_student_id uuid,
  p_booking_type booking_type,
  p_missed_session_id uuid default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_slot slot_instances%rowtype;
  v_student students%rowtype;
  v_booking bookings%rowtype;
  v_profile profiles%rowtype;
begin
  select * into v_profile from profiles where id = auth.uid();
  if v_profile is null then
    raise exception 'not authorized';
  end if;

  select * into v_slot from slot_instances where id = p_slot_instance_id for update;
  if not found then
    raise exception 'slot not found';
  end if;
  if v_slot.status <> 'open' then
    raise exception 'slot no longer available';
  end if;
  if v_slot.starts_at <= now() then
    raise exception 'slot is in the past';
  end if;

  select * into v_student from students where id = p_student_id;
  if not found or not v_student.active then
    raise exception 'invalid student';
  end if;

  if v_profile.role = 'parent' and v_student.family_id <> v_profile.family_id then
    raise exception 'not your student';
  end if;
  if v_profile.role not in ('parent', 'coach', 'admin') then
    raise exception 'not authorized to book';
  end if;

  if not (
    v_slot.eligibility_type = 'open_all'
    or (v_slot.eligibility_type = 'hp_only' and v_student.type = 'hp')
    or (v_slot.eligibility_type = 'general_only' and v_student.type = 'general')
    or (
      v_slot.eligibility_type = 'named_only'
      and exists (
        select 1 from slot_instance_students sis
        where sis.slot_instance_id = v_slot.id and sis.student_id = v_student.id
      )
    )
  ) then
    raise exception 'student not eligible for this slot';
  end if;

  if p_booking_type = 'makeup' then
    if v_student.type <> 'hp' then
      raise exception 'only HP students can book makeup sessions';
    end if;
    if p_missed_session_id is null then
      raise exception 'missed_session_id required for makeup booking';
    end if;
    perform 1 from missed_sessions ms
      where ms.id = p_missed_session_id
        and ms.student_id = p_student_id
        and ms.notice_given = true
        and ms.makeup_booking_id is null;
    if not found then
      raise exception 'missed session not eligible for makeup';
    end if;
  elsif p_booking_type = 'additional' then
    if v_student.type <> 'hp' then
      raise exception 'only HP students can book additional sessions';
    end if;
  elsif p_booking_type = 'open_hour' then
    if v_student.type <> 'general' then
      raise exception 'only general students use open-hour booking';
    end if;
  end if;

  insert into bookings (slot_instance_id, student_id, type, status, created_by, makeup_for_missed_session_id)
  values (
    p_slot_instance_id, p_student_id, p_booking_type, 'booked', auth.uid(),
    case when p_booking_type = 'makeup' then p_missed_session_id else null end
  )
  returning * into v_booking;

  update slot_instances set status = 'booked' where id = v_slot.id;

  if p_booking_type = 'makeup' then
    update missed_sessions set makeup_booking_id = v_booking.id where id = p_missed_session_id;
  end if;

  return v_booking;
end;
$$;
grant execute on function book_slot(uuid, uuid, booking_type, uuid) to authenticated;

-- ============ RPC: cancel_booking ============
-- Parents may cancel their own family's bookings; coaches may cancel bookings on
-- their own slots; admins may cancel anything.
create or replace function cancel_booking(
  p_booking_id uuid,
  p_reason text default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_booking bookings%rowtype;
  v_slot slot_instances%rowtype;
  v_student students%rowtype;
begin
  select * into v_profile from profiles where id = auth.uid();
  if v_profile is null then
    raise exception 'not authorized';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking not found';
  end if;
  if v_booking.status <> 'booked' then
    raise exception 'booking is not active';
  end if;

  select * into v_slot from slot_instances where id = v_booking.slot_instance_id;
  select * into v_student from students where id = v_booking.student_id;

  if v_profile.role = 'parent' and v_student.family_id <> v_profile.family_id then
    raise exception 'not your booking';
  elsif v_profile.role = 'coach' and v_slot.coach_id <> v_profile.coach_id then
    raise exception 'not your booking';
  elsif v_profile.role not in ('parent', 'coach', 'admin') then
    raise exception 'not authorized';
  end if;

  update bookings
    set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancellation_reason = p_reason
    where id = p_booking_id
    returning * into v_booking;

  update slot_instances set status = 'open' where id = v_booking.slot_instance_id;

  return v_booking;
end;
$$;
grant execute on function cancel_booking(uuid, text) to authenticated;

-- ============ RPC: mark_booking_complete ============
-- Coach (or admin) marks a past booked session as completed.
create or replace function mark_booking_complete(p_booking_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_booking bookings%rowtype;
  v_slot slot_instances%rowtype;
begin
  select * into v_profile from profiles where id = auth.uid();
  if v_profile is null or v_profile.role not in ('coach', 'admin') then
    raise exception 'not authorized';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or v_booking.status <> 'booked' then
    raise exception 'booking not eligible to complete';
  end if;

  select * into v_slot from slot_instances where id = v_booking.slot_instance_id;
  if v_profile.role = 'coach' and v_slot.coach_id <> v_profile.coach_id then
    raise exception 'not your booking';
  end if;

  update bookings set status = 'completed' where id = p_booking_id returning * into v_booking;
  return v_booking;
end;
$$;
grant execute on function mark_booking_complete(uuid) to authenticated;

-- ============ RPC: log_missed_session ============
-- Coach (or admin) logs a booked session as missed. `notice_given=true` (excused,
-- advance notice) makes it eligible for the makeup flow; `false` (no-show) never
-- generates a makeup opportunity, per policy.
create or replace function log_missed_session(
  p_booking_id uuid,
  p_notice_given boolean,
  p_reason text default null
) returns missed_sessions
language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_booking bookings%rowtype;
  v_slot slot_instances%rowtype;
  v_missed missed_sessions%rowtype;
begin
  select * into v_profile from profiles where id = auth.uid();
  if v_profile is null or v_profile.role not in ('coach', 'admin') then
    raise exception 'not authorized';
  end if;

  select * into v_booking from bookings where id = p_booking_id for update;
  if not found or v_booking.status <> 'booked' then
    raise exception 'booking not eligible to be logged as missed';
  end if;

  select * into v_slot from slot_instances where id = v_booking.slot_instance_id;
  if v_profile.role = 'coach' and v_slot.coach_id <> v_profile.coach_id then
    raise exception 'not your booking';
  end if;

  update bookings set status = 'missed' where id = p_booking_id;

  insert into missed_sessions (
    student_id, original_booking_id, original_slot_instance_id,
    logged_by, occurred_at, reason, notice_given
  ) values (
    v_booking.student_id, v_booking.id, v_booking.slot_instance_id,
    auth.uid(), v_slot.starts_at, p_reason, p_notice_given
  )
  returning * into v_missed;

  return v_missed;
end;
$$;
grant execute on function log_missed_session(uuid, boolean, text) to authenticated;

-- ============ TRIGGER: keep slot status in sync as a safety net ============
-- (book_slot/cancel_booking already keep this in sync directly; this trigger is
-- a defense-in-depth backstop in case a booking row is ever updated by another path.)
create or replace function sync_slot_status_on_booking_cancel() returns trigger
language plpgsql as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update slot_instances set status = 'open' where id = new.slot_instance_id and status <> 'open';
  end if;
  return new;
end;
$$;
create trigger trg_booking_cancelled
  after update of status on bookings
  for each row execute function sync_slot_status_on_booking_cancel();
