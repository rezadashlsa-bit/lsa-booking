-- LSA RAS Booking System — initial schema
-- Operating hours: Monday(1)-Saturday(6), 06:00-20:00 Asia/Jakarta wall-clock time.
-- day_of_week follows Postgres EXTRACT(DOW): 0=Sunday .. 6=Saturday.

-- ============ ENUMS ============
create type user_role as enum ('admin', 'coach', 'parent');
create type student_type as enum ('hp', 'general');
create type eligibility_type as enum ('open_all', 'hp_only', 'general_only', 'named_only');
create type booking_type as enum ('makeup', 'additional', 'open_hour');
create type booking_status as enum ('booked', 'completed', 'missed', 'cancelled');
create type slot_status as enum ('open', 'booked', 'cancelled', 'blocked');

-- ============ CORE ORG DATA ============
create table coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table families (
  id uuid primary key default gen_random_uuid(),
  primary_parent_name text not null,
  primary_parent_email text not null unique,
  secondary_parent_name text,
  secondary_parent_email text unique,
  phone text,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete restrict,
  name text not null,
  type student_type not null,
  grade text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_students_family on students(family_id);

-- ============ AUTH / ROLE MAPPING ============
-- One row per Supabase auth user, created on first login (matched by email).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null,
  coach_id uuid references coaches(id),
  family_id uuid references families(id),
  full_name text,
  created_at timestamptz not null default now(),
  constraint profile_role_link_check check (
    (role = 'coach' and coach_id is not null and family_id is null) or
    (role = 'parent' and family_id is not null and coach_id is null) or
    (role = 'admin' and coach_id is null and family_id is null)
  )
);

-- Admin allow-list, checked against email at first-login to auto-assign the admin role.
create table admin_allowlist (
  email text primary key
);

-- ============ AVAILABILITY: TEMPLATE (recurring weekly pattern) ============
create table availability_templates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  day_of_week smallint not null,
  start_time_local time not null,
  end_time_local time not null,
  eligibility_type eligibility_type not null default 'open_all',
  active boolean not null default true,
  effective_from date not null default current_date,
  effective_until date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint template_time_order check (end_time_local > start_time_local),
  constraint template_operating_hours check (
    start_time_local >= time '06:00' and end_time_local <= time '20:00'
  ),
  constraint template_mon_sat check (day_of_week between 1 and 6)
);
create index idx_availability_templates_coach on availability_templates(coach_id);

-- Named-student eligibility for a template (used when eligibility_type = 'named_only').
create table availability_template_students (
  template_id uuid not null references availability_templates(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (template_id, student_id)
);

-- ============ AVAILABILITY: MATERIALIZED CONCRETE INSTANCES (what parents book) ============
create table slot_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references availability_templates(id) on delete set null,
  coach_id uuid not null references coaches(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  eligibility_type eligibility_type not null,
  status slot_status not null default 'open',
  is_override boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  constraint slot_time_order check (ends_at > starts_at),
  constraint uq_coach_start unique (coach_id, starts_at)
);
create index idx_slot_instances_coach_time on slot_instances(coach_id, starts_at);
create index idx_slot_instances_status_time on slot_instances(status, starts_at);
create index idx_slot_instances_eligibility on slot_instances(eligibility_type, status, starts_at);

-- Named-student lock per concrete instance (overrides/extends the template-level named list).
create table slot_instance_students (
  slot_instance_id uuid not null references slot_instances(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (slot_instance_id, student_id)
);

-- ============ BOOKINGS ============
create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_instance_id uuid not null references slot_instances(id) on delete restrict,
  student_id uuid not null references students(id) on delete restrict,
  type booking_type not null,
  status booking_status not null default 'booked',
  makeup_for_missed_session_id uuid,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancelled_by uuid references profiles(id),
  cancellation_reason text
);
create index idx_bookings_student on bookings(student_id, created_at desc);
create index idx_bookings_slot on bookings(slot_instance_id);
-- Only one *active* (booked) booking may occupy a given slot at a time; a cancelled
-- booking frees the slot for a fresh booking without violating this constraint.
create unique index uq_active_booking_per_slot on bookings(slot_instance_id) where status = 'booked';

-- ============ MISSED SESSIONS ============
create table missed_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete restrict,
  original_booking_id uuid not null references bookings(id) on delete restrict,
  original_slot_instance_id uuid not null references slot_instances(id),
  logged_by uuid not null references profiles(id),
  occurred_at timestamptz not null,
  reason text,
  notice_given boolean not null,
  makeup_booking_id uuid references bookings(id),
  created_at timestamptz not null default now()
);
create index idx_missed_sessions_student on missed_sessions(student_id);
create unique index uq_missed_session_per_booking on missed_sessions(original_booking_id);

alter table bookings
  add constraint fk_bookings_makeup_for_missed_session
  foreign key (makeup_for_missed_session_id) references missed_sessions(id);

-- ============ EMAIL LOG (audit trail for Resend sends) ============
create table email_log (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email text not null,
  related_booking_id uuid references bookings(id),
  related_missed_session_id uuid references missed_sessions(id),
  resend_message_id text,
  status text not null default 'sent',
  error text,
  sent_at timestamptz not null default now()
);
