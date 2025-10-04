-- Extensions
create extension if not exists "pgcrypto";

-- ENUMS
do $$ begin
  create type risk_level as enum ('Low','Medium','High');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contract_status as enum ('Draft','Pending Review','Reviewed','Approved','Revision Requested','Rejected','Active','Expired');
exception when duplicate_object then null; end $$;

-- MAIN TABLES
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  first_party text,
  second_party text,
  value_rp numeric(18,2),
  duration_months integer,
  start_date date,
  end_date date,
  risk risk_level,
  status contract_status default 'Draft',
  file_url text,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists public.contract_entities (
  id bigint generated always as identity primary key,
  contract_id uuid references public.contracts(id) on delete cascade,
  first_party text,
  second_party text,
  value_rp numeric(18,2),
  duration_months integer,
  penalty text,
  initial_risk risk_level,
  analyzed_at timestamptz default now()
);

create table if not exists public.risk_findings (
  id bigint generated always as identity primary key,
  contract_id uuid references public.contracts(id) on delete cascade,
  section text,
  level risk_level not null,
  title text,
  created_at timestamptz default now()
);

create table if not exists public.legal_notes (
  id bigint generated always as identity primary key,
  contract_id uuid references public.contracts(id) on delete cascade,
  author text default 'legal@ilcs',
  note text not null,
  created_at timestamptz default now()
);

create table if not exists public.approvals (
  id bigint generated always as identity primary key,
  contract_id uuid references public.contracts(id) on delete cascade,
  action text not null,
  actor text default 'legal',
  created_at timestamptz default now()
);

-- RLS enable
alter table public.contracts enable row level security;
alter table public.contract_entities enable row level security;
alter table public.risk_findings enable row level security;
alter table public.legal_notes enable row level security;
alter table public.approvals enable row level security;

-- Dev-open policies
do $$ begin
  create policy "dev_select_contracts" on public.contracts for select to anon using (true);
  create policy "dev_insert_contracts" on public.contracts for insert to anon with check (true);
  create policy "dev_update_contracts" on public.contracts for update to anon using (true);
  create policy "dev_delete_contracts" on public.contracts for delete to anon using (true);

  create policy "dev_select_entities" on public.contract_entities for select to anon using (true);
  create policy "dev_insert_entities" on public.contract_entities for insert to anon with check (true);
  create policy "dev_delete_entities" on public.contract_entities for delete to anon using (true);

  create policy "dev_select_findings" on public.risk_findings for select to anon using (true);
  create policy "dev_insert_findings" on public.risk_findings for insert to anon with check (true);
  create policy "dev_delete_findings" on public.risk_findings for delete to anon using (true);

  create policy "dev_select_notes" on public.legal_notes for select to anon using (true);
  create policy "dev_insert_notes" on public.legal_notes for insert to anon with check (true);
  create policy "dev_delete_notes" on public.legal_notes for delete to anon using (true);

  create policy "dev_select_approvals" on public.approvals for select to anon using (true);
  create policy "dev_insert_approvals" on public.approvals for insert to anon with check (true);
exception when duplicate_object then null; end $$;

-- KPI view
create or replace view public.legal_kpi as
with weekly as (
  select count(*) as contracts_this_week
  from public.contracts
  where created_at >= date_trunc('week', now())
),
hi as (
  select count(*) as high_risk from public.contracts where risk = 'High'
),
pending_ai as (
  select count(*) as pending_ai from public.contracts where risk is null
)
select weekly.contracts_this_week, hi.high_risk, pending_ai.pending_ai
from weekly, hi, pending_ai;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
