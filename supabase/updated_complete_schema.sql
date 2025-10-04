-- Updated Complete Database Schema for ILCS Contract Management System
-- File: supabase/updated_complete_schema.sql
-- Date: October 3, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('procurement', 'legal', 'manager');
    END IF;
END $$;

-- Create risk level enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE public.risk_level AS ENUM ('Low', 'Medium', 'High');
    END IF;
END $$;

-- Create contract status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE public.contract_status AS ENUM ('Draft', 'Submitted', 'Reviewed', 'Approved', 'Revision Requested', 'Active', 'Expired', 'Rejected');
    END IF;
END $$;

-- 1. PROFILES TABLE - User Management
CREATE TABLE public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  role public.user_role not null default 'procurement'::user_role,
  created_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email) TABLESPACE pg_default;

-- 2. CONTRACTS TABLE - Master Contract Data
CREATE TABLE public.contracts (
  id uuid not null default gen_random_uuid (),
  name text not null,
  first_party text null,
  second_party text null,
  value_rp numeric(18, 2) null,
  duration_months integer null,
  start_date date null,
  end_date date null,
  risk public.risk_level null,
  status public.contract_status null default 'Draft'::contract_status,
  file_url text null,
  created_by text null,
  created_at timestamp with time zone null default now(),
  constraint contracts_pkey primary key (id)
) TABLESPACE pg_default;

-- 3. AI RISK ANALYSIS TABLE - AI Risk Analysis Results
CREATE TABLE public.ai_risk_analysis (
  id bigint generated always as identity not null,
  contract_id uuid null,
  analysis_result jsonb not null,
  risk_level public.risk_level null,
  confidence numeric(4, 3) null,
  model_used text null,
  processing_time numeric(10, 6) null,
  analyzed_at timestamp with time zone null default now(),
  constraint ai_risk_analysis_pkey primary key (id),
  constraint ai_risk_analysis_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_risk_analysis_contract_id ON public.ai_risk_analysis USING btree (contract_id) TABLESPACE pg_default;

-- 4. APPROVALS TABLE - Contract Approval Tracking
CREATE TABLE public.approvals (
  id bigint generated always as identity not null,
  contract_id uuid null,
  action text not null,
  actor text null default 'legal'::text,
  created_at timestamp with time zone null default now(),
  constraint approvals_pkey primary key (id),
  constraint approvals_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

-- 5. CONTRACT DOCUMENTS TABLE - Document Management
CREATE TABLE public.contract_documents (
  id bigint generated always as identity not null,
  contract_id uuid null,
  file_name text not null,
  file_size bigint null,
  file_type text null,
  file_url text not null,
  page_count integer null,
  version integer null default 1,
  is_active boolean null default true,
  uploaded_by uuid null,
  uploaded_at timestamp with time zone null default now(),
  constraint contract_documents_pkey primary key (id),
  constraint contract_documents_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE,
  constraint contract_documents_uploaded_by_fkey foreign KEY (uploaded_by) references profiles (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON public.contract_documents USING btree (contract_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contract_documents_active ON public.contract_documents USING btree (contract_id, is_active) TABLESPACE pg_default;

-- 6. CONTRACT ENTITIES TABLE - Contract Entity Details
CREATE TABLE public.contract_entities (
  id bigint generated always as identity not null,
  contract_id uuid null,
  first_party text null,
  second_party text null,
  value_rp numeric(18, 2) null,
  duration_months integer null,
  penalty text null,
  initial_risk public.risk_level null,
  analyzed_at timestamp with time zone null default now(),
  constraint contract_entities_pkey primary key (id),
  constraint contract_entities_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

-- 7. CONTRACT LIFECYCLE TABLE - Lifecycle Tracking
CREATE TABLE public.contract_lifecycle (
  id bigint generated always as identity not null,
  contract_id uuid null,
  stage text not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone null,
  duration_days integer null,
  notes text null,
  created_by uuid null,
  constraint contract_lifecycle_pkey primary key (id),
  constraint contract_lifecycle_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE,
  constraint contract_lifecycle_created_by_fkey foreign KEY (created_by) references profiles (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_contract_id ON public.contract_lifecycle USING btree (contract_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_stage ON public.contract_lifecycle USING btree (stage) TABLESPACE pg_default;

-- 8. CONTRACT PERFORMANCE TABLE - Performance Metrics
CREATE TABLE public.contract_performance (
  id bigint generated always as identity not null,
  contract_id uuid null,
  metric_type text not null,
  value numeric(10, 2) not null,
  division_average numeric(10, 2) null,
  measured_at timestamp with time zone null default now(),
  constraint contract_performance_pkey primary key (id),
  constraint contract_performance_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contract_performance_contract_id ON public.contract_performance USING btree (contract_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contract_performance_metric_type ON public.contract_performance USING btree (metric_type) TABLESPACE pg_default;

-- 9. CONTRACT SNAPSHOTS TABLE - Daily Contract Snapshots
CREATE TABLE public.contract_snapshots (
  id bigint generated always as identity not null,
  snapshot_date date not null default CURRENT_DATE,
  total_contracts integer null default 0,
  active_contracts integer null default 0,
  pending_contracts integer null default 0,
  expired_contracts integer null default 0,
  high_risk_contracts integer null default 0,
  medium_risk_contracts integer null default 0,
  low_risk_contracts integer null default 0,
  total_value numeric(20, 2) null default 0,
  average_processing_time numeric(10, 2) null,
  created_at timestamp with time zone null default now(),
  constraint contract_snapshots_pkey primary key (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contract_snapshots_date ON public.contract_snapshots USING btree (snapshot_date) TABLESPACE pg_default;

-- 10. KPI METRICS TABLE - KPI Tracking
CREATE TABLE public.kpi_metrics (
  id bigint generated always as identity not null,
  metric_name text not null,
  metric_value numeric(15, 2) not null,
  metric_type text not null,
  period_start date not null,
  period_end date not null,
  division text null default 'All'::text,
  created_at timestamp with time zone null default now(),
  constraint kpi_metrics_pkey primary key (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_kpi_metrics_period ON public.kpi_metrics USING btree (period_start, period_end) TABLESPACE pg_default;

-- 11. LEGAL NOTES TABLE - Legal Team Notes
CREATE TABLE public.legal_notes (
  id bigint generated always as identity not null,
  contract_id uuid null,
  author text null default 'legal@ilcs'::text,
  note text not null,
  created_at timestamp with time zone null default now(),
  constraint legal_notes_pkey primary key (id),
  constraint legal_notes_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

-- 12. RISK FINDINGS TABLE - Manual Risk Assessment
CREATE TABLE public.risk_findings (
  id bigint generated always as identity not null,
  contract_id uuid null,
  section text null,
  level public.risk_level not null,
  title text null,
  created_at timestamp with time zone null default now(),
  constraint risk_findings_pkey primary key (id),
  constraint risk_findings_contract_id_fkey foreign KEY (contract_id) references contracts (id) on delete CASCADE
) TABLESPACE pg_default;

-- CONTRACT LIFECYCLE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_contract_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    -- Update duration_days for completed stages
    IF NEW.status <> OLD.status THEN
        UPDATE contract_lifecycle 
        SET 
            completed_at = NOW(),
            duration_days = EXTRACT(DAY FROM NOW() - started_at)::integer
        WHERE contract_id = NEW.id AND completed_at IS NULL;
        
        -- Insert new lifecycle stage
        INSERT INTO contract_lifecycle (contract_id, stage, started_at)
        VALUES (NEW.id, NEW.status, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER
CREATE TRIGGER contract_lifecycle_trigger
AFTER UPDATE OF status ON contracts FOR EACH ROW
EXECUTE FUNCTION update_contract_lifecycle();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contracts
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.contracts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON public.contracts
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Apply similar policies to other tables
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.legal_notes
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.legal_notes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.risk_findings
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_lifecycle
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_entities
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.ai_risk_analysis
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.ai_risk_analysis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.approvals
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.approvals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_documents
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.contract_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_performance
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.contract_performance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_snapshots
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.kpi_metrics
    FOR SELECT USING (true);

-- GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;