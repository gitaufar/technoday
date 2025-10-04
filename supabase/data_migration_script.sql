-- Data Migration Script for Multi-Tenant Refactor
-- File: supabase/data_migration_script.sql
-- Date: October 3, 2025
-- Purpose: Migrate existing data to multi-tenant structure

-- ===================================
-- STEP 1: CREATE DEFAULT COMPANY FOR EXISTING DATA
-- ===================================

-- Insert default company for existing ILCS data
INSERT INTO public.companies (
  id, 
  name, 
  code, 
  description, 
  industry, 
  subscription_plan, 
  subscription_status,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'PT. ILCS Teknologi', 
  'ILCS',
  'Default company for existing ILCS data',
  'Technology',
  'enterprise',
  'active',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===================================
-- STEP 2: UPDATE EXISTING DATA WITH COMPANY_ID
-- ===================================

-- Set default company_id for existing profiles
UPDATE public.profiles 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contracts
UPDATE public.contracts 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing ai_risk_analysis
UPDATE public.ai_risk_analysis 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing approvals
UPDATE public.approvals 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contract_documents
UPDATE public.contract_documents 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contract_entities
UPDATE public.contract_entities 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contract_lifecycle
UPDATE public.contract_lifecycle 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contract_performance
UPDATE public.contract_performance 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing contract_snapshots
UPDATE public.contract_snapshots 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing kpi_metrics
UPDATE public.kpi_metrics 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing legal_notes
UPDATE public.legal_notes 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- Set default company_id for existing risk_findings
UPDATE public.risk_findings 
SET company_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE company_id IS NULL;

-- ===================================
-- STEP 3: CREATE COMPANY_USERS RELATIONSHIPS
-- ===================================

-- Create company_users relationships for all existing users
INSERT INTO public.company_users (company_id, user_id, role, is_admin, is_primary, status)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000' as company_id,
  p.id as user_id,
  p.role,
  CASE WHEN p.role = 'manager' THEN true ELSE false END as is_admin,
  true as is_primary,
  'active' as status
FROM public.profiles p
WHERE p.company_id = '550e8400-e29b-41d4-a716-446655440000'
ON CONFLICT (company_id, user_id) DO NOTHING;

-- ===================================
-- STEP 4: MAKE COMPANY_ID NOT NULL (OPTIONAL)
-- ===================================

-- After migration, you might want to make company_id NOT NULL
-- Uncomment these lines after ensuring all data has company_id

/*
ALTER TABLE public.profiles ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contracts ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.ai_risk_analysis ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.approvals ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contract_documents ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contract_entities ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contract_lifecycle ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contract_performance ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contract_snapshots ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.kpi_metrics ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.legal_notes ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.risk_findings ALTER COLUMN company_id SET NOT NULL;
*/

-- ===================================
-- STEP 5: VERIFICATION QUERIES
-- ===================================

-- Check migration results
SELECT 'profiles' as table_name, 
       COUNT(*) as total_records, 
       COUNT(company_id) as with_company_id,
       COUNT(*) - COUNT(company_id) as missing_company_id
FROM public.profiles

UNION ALL

SELECT 'contracts', 
       COUNT(*), 
       COUNT(company_id),
       COUNT(*) - COUNT(company_id)
FROM public.contracts

UNION ALL

SELECT 'ai_risk_analysis', 
       COUNT(*), 
       COUNT(company_id),
       COUNT(*) - COUNT(company_id)
FROM public.ai_risk_analysis

UNION ALL

SELECT 'company_users', 
       COUNT(*), 
       COUNT(*),
       0
FROM public.company_users;

-- Check companies
SELECT c.*, 
       (SELECT COUNT(*) FROM company_users cu WHERE cu.company_id = c.id) as user_count,
       (SELECT COUNT(*) FROM contracts co WHERE co.company_id = c.id) as contract_count
FROM companies c;

-- Check company_users relationships
SELECT cu.*, 
       c.name as company_name, 
       p.full_name as user_name, 
       p.email as user_email
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN profiles p ON cu.user_id = p.id
ORDER BY c.name, p.full_name;