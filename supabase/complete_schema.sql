-- Complete database setup for contract management system
-- File: supabase/complete_schema.sql

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

-- Profiles table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL,
    email TEXT NULL,
    full_name TEXT NULL,
    role public.user_role NOT NULL DEFAULT 'procurement'::user_role,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email) TABLESPACE pg_default;

-- Contracts table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    first_party TEXT NULL,
    second_party TEXT NULL,
    value_rp NUMERIC(18, 2) NULL,
    duration_months INTEGER NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    risk public.risk_level NULL,
    status public.contract_status NULL DEFAULT 'Draft'::contract_status,
    file_url TEXT NULL,
    created_by TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT contracts_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Risk findings table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.risk_findings (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    contract_id UUID NULL,
    section TEXT NULL,
    level public.risk_level NOT NULL,
    title TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT risk_findings_pkey PRIMARY KEY (id),
    CONSTRAINT risk_findings_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Legal notes table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.legal_notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    contract_id UUID NULL,
    author TEXT NULL DEFAULT 'legal@ilcs'::text,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT legal_notes_pkey PRIMARY KEY (id),
    CONSTRAINT legal_notes_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Contract lifecycle table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.contract_lifecycle (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    contract_id UUID NULL,
    stage TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    duration_days INTEGER NULL,
    notes TEXT NULL,
    created_by UUID NULL,
    CONSTRAINT contract_lifecycle_pkey PRIMARY KEY (id),
    CONSTRAINT contract_lifecycle_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT contract_lifecycle_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_contract_id ON public.contract_lifecycle USING btree (contract_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_contract_lifecycle_stage ON public.contract_lifecycle USING btree (stage) TABLESPACE pg_default;

-- Contract entities table (already exists in schema provided)
CREATE TABLE IF NOT EXISTS public.contract_entities (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    contract_id UUID NULL,
    first_party TEXT NULL,
    second_party TEXT NULL,
    value_rp NUMERIC(18, 2) NULL,
    duration_months INTEGER NULL,
    penalty TEXT NULL,
    initial_risk public.risk_level NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT contract_entities_pkey PRIMARY KEY (id),
    CONSTRAINT contract_entities_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Contract extractions table (for storing contract details from API)
CREATE TABLE IF NOT EXISTS public.contract_extractions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    extraction_result JSONB NOT NULL,
    confidence_score NUMERIC(4,3) NULL,
    analysis_method TEXT NULL,
    processing_time NUMERIC(10,4) NULL,
    extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT contract_extractions_pkey PRIMARY KEY (id),
    CONSTRAINT contract_extractions_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    CONSTRAINT contract_extractions_contract_id_unique UNIQUE (contract_id)
) TABLESPACE pg_default;

-- AI risk analysis table (for storing risk analysis results)
CREATE TABLE IF NOT EXISTS public.ai_risk_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    analysis_result JSONB NOT NULL,
    risk_level TEXT NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    model_used TEXT NOT NULL,
    processing_time NUMERIC(10,4) NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT ai_risk_analysis_pkey PRIMARY KEY (id),
    CONSTRAINT ai_risk_analysis_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_extractions_contract_id ON public.contract_extractions(contract_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_analysis_contract_id ON public.ai_risk_analysis(contract_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_analysis_analyzed_at ON public.ai_risk_analysis(analyzed_at);

-- Contract lifecycle trigger function
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

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS contract_lifecycle_trigger ON public.contracts;
CREATE TRIGGER contract_lifecycle_trigger
    AFTER UPDATE OF status ON public.contracts 
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_lifecycle();

-- Enable RLS on all tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contracts
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.contracts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON public.contracts
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for legal notes
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.legal_notes
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.legal_notes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for other tables (similar pattern)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.risk_findings
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_lifecycle
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_entities
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contract_extractions
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.ai_risk_analysis
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.contract_extractions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON public.ai_risk_analysis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;