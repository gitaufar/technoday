-- Billing and Invoices Schema for ILCS Contract Management System
-- File: supabase/billing_schema.sql
-- Date: October 7, 2025
-- Purpose: Add billing and invoice tracking support

-- ===================================
-- BILLING INVOICES TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id uuid not null default gen_random_uuid(),
  company_id uuid not null,
  plan_name text not null, -- 'Starter', 'Professional', 'Enterprise', or custom
  amount numeric(10, 2) not null, -- Invoice amount in IDR
  status text not null default 'pending', -- 'paid', 'due', 'failed', 'pending', 'refunded'
  invoice_url text null, -- URL to download invoice PDF
  invoice_number text null, -- Unique invoice number (e.g., INV-2025-001)
  issued_at timestamp with time zone not null default now(), -- Invoice issue date
  billing_date timestamp with time zone null, -- Billing period date
  due_date timestamp with time zone null, -- Payment due date
  paid_at timestamp with time zone null, -- Actual payment date
  period_start timestamp with time zone null, -- Subscription period start
  period_end timestamp with time zone null, -- Subscription period end
  payment_method text null, -- 'credit_card', 'bank_transfer', 'ewallet', etc.
  transaction_id text null, -- External payment gateway transaction ID
  notes text null, -- Additional notes or remarks
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint billing_invoices_pkey primary key (id),
  constraint billing_invoices_company_id_fkey foreign key (company_id) references companies(id) on delete cascade,
  constraint billing_invoices_invoice_number_unique unique (invoice_number)
) tablespace pg_default;

-- Add indexes for billing_invoices
create index if not exists idx_billing_invoices_company_id on public.billing_invoices using btree (company_id) tablespace pg_default;
create index if not exists idx_billing_invoices_status on public.billing_invoices using btree (status) tablespace pg_default;
create index if not exists idx_billing_invoices_issued_at on public.billing_invoices using btree (issued_at desc) tablespace pg_default;
create index if not exists idx_billing_invoices_invoice_number on public.billing_invoices using btree (invoice_number) tablespace pg_default;

-- Add updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_billing_invoices_updated_at
  before update on public.billing_invoices
  for each row
  execute function public.handle_updated_at();

-- ===================================
-- SAMPLE DATA FOR TESTING
-- ===================================

-- Insert sample invoices (only if companies exist)
-- Note: Replace company IDs with actual IDs from your database
-- This is just for demonstration purposes

-- Example:
-- INSERT INTO public.billing_invoices (
--   company_id,
--   plan_name,
--   amount,
--   status,
--   invoice_number,
--   issued_at,
--   billing_date,
--   due_date,
--   paid_at,
--   period_start,
--   period_end,
--   payment_method
-- ) VALUES
-- (
--   'your-company-uuid-here',
--   'Professional',
--   220000,
--   'paid',
--   'INV-2025-001',
--   '2025-01-01 00:00:00+00',
--   '2025-01-01 00:00:00+00',
--   '2025-01-15 00:00:00+00',
--   '2025-01-10 00:00:00+00',
--   '2025-01-01 00:00:00+00',
--   '2025-02-01 00:00:00+00',
--   'credit_card'
-- );

-- ===================================
-- RLS POLICIES
-- ===================================

-- Enable RLS
alter table public.billing_invoices enable row level security;

-- Policy: Users can only view invoices from their own company
create policy "Users can view their company's invoices"
  on public.billing_invoices
  for select
  using (
    company_id in (
      select company_id from public.profiles where id = auth.uid()
    )
  );

-- Policy: Only system admins or owners can insert invoices
-- This should typically be done via backend/admin panel
create policy "System can insert invoices"
  on public.billing_invoices
  for insert
  with check (true); -- Adjust based on your admin role logic

-- Policy: Only system admins can update invoices
create policy "System can update invoices"
  on public.billing_invoices
  for update
  using (true); -- Adjust based on your admin role logic

-- Policy: Only system admins can delete invoices
create policy "System can delete invoices"
  on public.billing_invoices
  for delete
  using (true); -- Adjust based on your admin role logic

-- ===================================
-- HELPER FUNCTIONS
-- ===================================

-- Function to generate invoice number
create or replace function public.generate_invoice_number()
returns text as $$
declare
  year_part text;
  sequence_part text;
  next_sequence int;
begin
  year_part := to_char(now(), 'YYYY');
  
  -- Get next sequence number for this year
  select coalesce(max(substring(invoice_number from 'INV-\d{4}-(\d+)')::int), 0) + 1
  into next_sequence
  from public.billing_invoices
  where invoice_number like 'INV-' || year_part || '-%';
  
  sequence_part := lpad(next_sequence::text, 4, '0');
  
  return 'INV-' || year_part || '-' || sequence_part;
end;
$$ language plpgsql;

-- ===================================
-- COMMENTS
-- ===================================

comment on table public.billing_invoices is 'Stores billing invoices for companies';
comment on column public.billing_invoices.company_id is 'Reference to the company this invoice belongs to';
comment on column public.billing_invoices.plan_name is 'Name of the subscription plan (Starter, Professional, Enterprise)';
comment on column public.billing_invoices.amount is 'Invoice amount in IDR';
comment on column public.billing_invoices.status is 'Invoice payment status (paid, due, failed, pending, refunded)';
comment on column public.billing_invoices.invoice_url is 'URL to download invoice PDF from storage';
comment on column public.billing_invoices.invoice_number is 'Unique invoice identifier (e.g., INV-2025-0001)';
