-- TicketPilot minimal schema (Supabase / Postgres)
-- Apply in Supabase SQL editor.

create extension if not exists pgcrypto;

-- Businesses / workspaces
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- A user belongs to orgs (simple MVP membership)
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agent',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Tickets ingested from email/helpdesk
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  external_id text, -- e.g. IMAP UID or helpdesk ticket id
  channel text not null default 'email', -- email | zendesk | intercom | ...
  subject text,
  customer_email text,
  status text not null default 'open', -- open | pending | solved
  risk_level text not null default 'unknown', -- low | medium | high | unknown
  confidence numeric, -- 0..1 from classifier
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_org_created_idx
  on public.tickets (organization_id, created_at desc);

-- Ticket messages (thread)
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  direction text not null, -- inbound | outbound | internal
  author_type text not null, -- customer | agent | ai | system
  author_email text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_created_idx
  on public.ticket_messages (ticket_id, created_at asc);

-- AI suggestions for a ticket
create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  model text,
  suggested_reply text not null,
  citations jsonb,
  confidence numeric,
  risk_level text,
  created_at timestamptz not null default now()
);

create index if not exists ai_suggestions_ticket_created_idx
  on public.ai_suggestions (ticket_id, created_at desc);

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ai_suggestions enable row level security;

-- Membership helper (security definer)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- Policies: members can read/write their org data
drop policy if exists "org_select_member" on public.organizations;
create policy "org_select_member"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

drop policy if exists "members_select_self" on public.organization_members;
create policy "members_select_self"
on public.organization_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "tickets_rw_member" on public.tickets;
create policy "tickets_rw_member"
on public.tickets
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists "messages_rw_member" on public.ticket_messages;
create policy "messages_rw_member"
on public.ticket_messages
for all
to authenticated
using (exists (
  select 1 from public.tickets t
  where t.id = ticket_id and public.is_org_member(t.organization_id)
))
with check (exists (
  select 1 from public.tickets t
  where t.id = ticket_id and public.is_org_member(t.organization_id)
));

drop policy if exists "suggestions_rw_member" on public.ai_suggestions;
create policy "suggestions_rw_member"
on public.ai_suggestions
for all
to authenticated
using (exists (
  select 1 from public.tickets t
  where t.id = ticket_id and public.is_org_member(t.organization_id)
))
with check (exists (
  select 1 from public.tickets t
  where t.id = ticket_id and public.is_org_member(t.organization_id)
));

