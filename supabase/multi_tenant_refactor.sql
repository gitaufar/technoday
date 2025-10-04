-- Multi-Tenant Database Refactor for ILCS Contract Management System
-- File: supabase/multi_tenant_refactor.sql
-- Date: October 3, 2025
-- Purpose: Add company/organization support with data isolation

-- ===================================
-- STEP 1: CREATE COMPANIES TABLE
-- ===================================

CREATE TABLE public.companies (
  id uuid not null default gen_random_uuid(),
  name text not null,
  code text not null, -- Short code for company (e.g., "ILCS", "ABC")
  description text null,
  industry text null,
  address text null,
  phone text null,
  email text null,
  website text null,
  logo_url text null,
  subscription_plan text null default 'basic', -- basic, premium, enterprise
  subscription_status text null default 'active', -- active, suspended, trial
  subscription_expires_at timestamp with time zone null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint companies_pkey primary key (id),
  constraint companies_code_unique unique (code),
  constraint companies_name_unique unique (name)
) TABLESPACE pg_default;

-- Add indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_code ON public.companies USING btree (code) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies USING btree (is_active) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_companies_subscription ON public.companies USING btree (subscription_status) TABLESPACE pg_default;

-- ===================================
-- STEP 2: ADD COMPANY_ID TO PROFILES
-- ===================================

-- Add company_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_company_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for profiles company_id
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles USING btree (company_id) TABLESPACE pg_default;

-- ===================================
-- STEP 3: ADD COMPANY_ID TO ALL EXISTING TABLES
-- ===================================

-- Add company_id to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contracts_company_id_fkey' 
        AND table_name = 'contracts'
    ) THEN
        ALTER TABLE public.contracts 
        ADD CONSTRAINT contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON public.contracts USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to ai_risk_analysis table
ALTER TABLE public.ai_risk_analysis 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ai_risk_analysis_company_id_fkey' 
        AND table_name = 'ai_risk_analysis'
    ) THEN
        ALTER TABLE public.ai_risk_analysis 
        ADD CONSTRAINT ai_risk_analysis_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_risk_analysis_company_id ON public.ai_risk_analysis USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to approvals table
ALTER TABLE public.approvals 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'approvals_company_id_fkey' 
        AND table_name = 'approvals'
    ) THEN
        ALTER TABLE public.approvals 
        ADD CONSTRAINT approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_approvals_company_id ON public.approvals USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to contract_documents table
ALTER TABLE public.contract_documents 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contract_documents_company_id_fkey' 
        AND table_name = 'contract_documents'
    ) THEN
        ALTER TABLE public.contract_documents 
        ADD CONSTRAINT contract_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contract_documents_company_id ON public.contract_documents USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to contract_entities table
ALTER TABLE public.contract_entities 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contract_entities_company_id_fkey' 
        AND table_name = 'contract_entities'
    ) THEN
        ALTER TABLE public.contract_entities 
        ADD CONSTRAINT contract_entities_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contract_entities_company_id ON public.contract_entities USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to contract_lifecycle table
ALTER TABLE public.contract_lifecycle 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contract_lifecycle_company_id_fkey' 
        AND table_name = 'contract_lifecycle'
    ) THEN
        ALTER TABLE public.contract_lifecycle 
        ADD CONSTRAINT contract_lifecycle_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_company_id ON public.contract_lifecycle USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to contract_performance table
ALTER TABLE public.contract_performance 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contract_performance_company_id_fkey' 
        AND table_name = 'contract_performance'
    ) THEN
        ALTER TABLE public.contract_performance 
        ADD CONSTRAINT contract_performance_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contract_performance_company_id ON public.contract_performance USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to contract_snapshots table
ALTER TABLE public.contract_snapshots 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contract_snapshots_company_id_fkey' 
        AND table_name = 'contract_snapshots'
    ) THEN
        ALTER TABLE public.contract_snapshots 
        ADD CONSTRAINT contract_snapshots_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contract_snapshots_company_id ON public.contract_snapshots USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to kpi_metrics table
ALTER TABLE public.kpi_metrics 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'kpi_metrics_company_id_fkey' 
        AND table_name = 'kpi_metrics'
    ) THEN
        ALTER TABLE public.kpi_metrics 
        ADD CONSTRAINT kpi_metrics_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kpi_metrics_company_id ON public.kpi_metrics USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to legal_notes table
ALTER TABLE public.legal_notes 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'legal_notes_company_id_fkey' 
        AND table_name = 'legal_notes'
    ) THEN
        ALTER TABLE public.legal_notes 
        ADD CONSTRAINT legal_notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_legal_notes_company_id ON public.legal_notes USING btree (company_id) TABLESPACE pg_default;

-- Add company_id to risk_findings table
ALTER TABLE public.risk_findings 
ADD COLUMN IF NOT EXISTS company_id uuid null;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'risk_findings_company_id_fkey' 
        AND table_name = 'risk_findings'
    ) THEN
        ALTER TABLE public.risk_findings 
        ADD CONSTRAINT risk_findings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_risk_findings_company_id ON public.risk_findings USING btree (company_id) TABLESPACE pg_default;

-- ===================================
-- STEP 4: CREATE COMPANY USERS JUNCTION TABLE
-- ===================================

-- Table for managing user-company relationships (in case user can belong to multiple companies)
CREATE TABLE public.company_users (
  id bigint generated always as identity not null,
  company_id uuid not null,
  user_id uuid not null,
  role public.user_role not null default 'procurement',
  is_admin boolean not null default false,
  is_primary boolean not null default true, -- Primary company for user
  joined_at timestamp with time zone not null default now(),
  status text not null default 'active', -- active, inactive, pending
  
  constraint company_users_pkey primary key (id),
  constraint company_users_company_id_fkey foreign key (company_id) references companies(id) on delete cascade,
  constraint company_users_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade,
  constraint company_users_unique unique (company_id, user_id)
) TABLESPACE pg_default;

-- Indexes for company_users
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users USING btree (company_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_company_users_primary ON public.company_users USING btree (user_id, is_primary) TABLESPACE pg_default;

-- ===================================
-- STEP 5: UPDATE ROW LEVEL SECURITY POLICIES
-- ===================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contracts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.contracts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.contracts;

-- Create new company-based RLS policies for contracts
CREATE POLICY "Users can only see contracts from their company" ON public.contracts
  FOR SELECT USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Users can only insert contracts for their company" ON public.contracts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Users can only update contracts from their company" ON public.contracts
  FOR UPDATE USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

-- Apply similar policies to other tables
CREATE POLICY "Company isolation for ai_risk_analysis" ON public.ai_risk_analysis
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for approvals" ON public.approvals
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for contract_documents" ON public.contract_documents
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for contract_entities" ON public.contract_entities
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for contract_lifecycle" ON public.contract_lifecycle
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for contract_performance" ON public.contract_performance
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for contract_snapshots" ON public.contract_snapshots
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for kpi_metrics" ON public.kpi_metrics
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for legal_notes" ON public.legal_notes
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

CREATE POLICY "Company isolation for risk_findings" ON public.risk_findings
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

-- Policy for profiles - users can see other users in same company
CREATE POLICY "Users can see profiles from same company" ON public.profiles
  FOR SELECT USING (
    company_id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    ) OR id = auth.uid()
  );

-- ===================================
-- STEP 6: ENABLE RLS ON NEW TABLES
-- ===================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- RLS for companies - users can only see companies they belong to
CREATE POLICY "Users can see their companies" ON public.companies
  FOR SELECT USING (
    id IN (
      SELECT cu.company_id 
      FROM company_users cu 
      WHERE cu.user_id = auth.uid() AND cu.status = 'active'
    )
  );

-- RLS for company_users - users can see their own company relationships
CREATE POLICY "Users can see their company relationships" ON public.company_users
  FOR SELECT USING (user_id = auth.uid());

-- ===================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ===================================

-- Function to get user's primary company
CREATE OR REPLACE FUNCTION get_user_primary_company(user_uuid uuid)
RETURNS uuid AS $$
DECLARE
    company_uuid uuid;
BEGIN
    SELECT company_id INTO company_uuid
    FROM company_users
    WHERE user_id = user_uuid AND is_primary = true AND status = 'active'
    LIMIT 1;
    
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's companies
CREATE OR REPLACE FUNCTION get_user_companies(user_uuid uuid)
RETURNS TABLE(company_id uuid, company_name text, role user_role, is_admin boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT cu.company_id, c.name, cu.role, cu.is_admin
    FROM company_users cu
    JOIN companies c ON cu.company_id = c.id
    WHERE cu.user_id = user_uuid AND cu.status = 'active' AND c.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to company
CREATE OR REPLACE FUNCTION user_has_company_access(user_uuid uuid, company_uuid uuid)
RETURNS boolean AS $$
DECLARE
    has_access boolean := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM company_users 
        WHERE user_id = user_uuid 
        AND company_id = company_uuid 
        AND status = 'active'
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- STEP 8: UPDATE TRIGGER FUNCTIONS
-- ===================================

-- Update contract lifecycle trigger to include company_id
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
        
        -- Insert new lifecycle stage with company_id
        INSERT INTO contract_lifecycle (contract_id, company_id, stage, started_at)
        VALUES (NEW.id, NEW.company_id, NEW.status, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- STEP 9: SAMPLE DATA FOR TESTING
-- ===================================

-- Insert sample companies
INSERT INTO public.companies (id, name, code, description, industry, subscription_plan, subscription_status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'PT. ILCS Teknologi', 'ILCS', 'PT Industri Layanan Cerdas Solusi', 'Technology', 'enterprise', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'PT. ABC Corporation', 'ABC', 'ABC Business Solutions', 'Consulting', 'premium', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'PT. XYZ Industries', 'XYZ', 'XYZ Manufacturing', 'Manufacturing', 'basic', 'trial')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===================================
-- MIGRATION NOTES
-- ===================================

/*
MIGRATION STEPS:

1. Run this SQL to create new tables and add company_id columns
2. Update application code to:
   - Include company_id in all database operations
   - Add company selection in user interface
   - Update authentication to include company context
3. Migrate existing data:
   - Create default company for existing data
   - Update all existing records with company_id
   - Create company_users relationships for existing users
4. Update API endpoints to filter by company_id
5. Update frontend to show company context

BREAKING CHANGES:
- All database queries now need company_id filtering
- User authentication now requires company context
- RLS policies will restrict data access by company

BACKWARD COMPATIBILITY:
- Existing data will still work but needs company_id assignment
- New company_id columns are nullable during migration
*/