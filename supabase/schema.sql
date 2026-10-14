-- Blissify · Supabase schema for leads, registrations and analytics.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to run again (IF NOT EXISTS everywhere).
--
-- The site only talks to these tables from the server with the service_role
-- key (src/lib/supabase.ts). Row Level Security is enabled with NO policies,
-- so the public anon key can neither read nor write: visitors' names and email
-- addresses stay private.

create extension if not exists "pgcrypto";

-- "Vraag informatie aan" and the contact form (payload_course_id = 'general-inquiry').
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text,
  payload_course_id text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists leads_course_idx on public.leads (payload_course_id, created_at desc);

-- In-platform course registrations (bookable brand courses).
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  payload_course_id text not null,
  name text not null,
  email text not null,
  phone text,
  participant_count integer,
  created_at timestamptz not null default now()
);
create index if not exists registrations_course_idx on public.registrations (payload_course_id, created_at desc);

-- Dashboard analytics: profile_view, course_view, website_click, social_click, register_click.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload_course_id text,
  payload_trainer_id text,
  payload_brand_id text,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_type_course_idx on public.analytics_events (event_type, payload_course_id, created_at);
create index if not exists analytics_events_type_trainer_idx on public.analytics_events (event_type, payload_trainer_id, created_at);
create index if not exists analytics_events_type_brand_idx on public.analytics_events (event_type, payload_brand_id, created_at);

alter table public.leads enable row level security;
alter table public.registrations enable row level security;
alter table public.analytics_events enable row level security;
