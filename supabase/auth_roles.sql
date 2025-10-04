-- ENUM for app roles
do $$ begin
  create type user_role as enum ('procurement','legal','management');
exception when duplicate_object then null; end $$;

-- Public profile linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role user_role not null default 'procurement',
  created_at timestamptz not null default now()
);

-- On signup, copy raw_user_meta_data.role into profiles.role (fallback: procurement)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'procurement')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

do $$ begin
  create policy "profiles_self_read" on public.profiles for select
    to authenticated using (id = auth.uid());
  create policy "profiles_self_update" on public.profiles for update
    to authenticated using (id = auth.uid()) with check (id = auth.uid());
exception when duplicate_object then null; end $$;

-- Contracts policies

do $$ begin
  create policy "contracts_read_any" on public.contracts for select
    to authenticated using (true);
exception when duplicate_object then null; end $$;


do $$ begin
  create policy "contracts_insert_by_procurement" on public.contracts for insert
    to authenticated
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'procurement'));
exception when duplicate_object then null; end $$;


do $$ begin
  create policy "contracts_update_by_legal" on public.contracts for update
    to authenticated
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'legal'));

  create policy "contracts_update_own_drafts" on public.contracts for update
    to authenticated
    using (
      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'procurement'))
      and (created_by = auth.uid()::text or created_by is null)
      and status in ('Draft','Pending Review','Revision Requested')
    );
exception when duplicate_object then null; end $$;

-- Risk findings / notes policies

do $$ begin
  create policy "risk_findings_insert_legal" on public.risk_findings for insert
    to authenticated
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'legal'));
  create policy "risk_findings_read_any" on public.risk_findings for select to authenticated using (true);

  create policy "legal_notes_insert_legal" on public.legal_notes for insert
    to authenticated
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'legal'));
  create policy "legal_notes_read_any" on public.legal_notes for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Approvals policies

do $$ begin
  create policy "approvals_insert_mgmt" on public.approvals for insert
    to authenticated
    with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'management'));
  create policy "approvals_read_any" on public.approvals for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- NOTIFY PostgREST cache reload
NOTIFY pgrst, 'reload schema';
