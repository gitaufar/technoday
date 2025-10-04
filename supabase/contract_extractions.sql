-- Create contract_extractions table to store detailed extraction results
-- File: supabase/contract_extractions.sql

CREATE TABLE IF NOT EXISTS public.contract_extractions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    extraction_result JSONB NOT NULL, -- Full API response
    confidence_score NUMERIC(4,3) NULL,
    analysis_method TEXT NULL,
    processing_time NUMERIC(10,4) NULL,
    extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT contract_extractions_pkey PRIMARY KEY (id),
    CONSTRAINT contract_extractions_contract_id_unique UNIQUE (contract_id)
) TABLESPACE pg_default;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contract_extractions_contract_id ON public.contract_extractions(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_extractions_extracted_at ON public.contract_extractions(extracted_at);

-- Enable RLS
ALTER TABLE public.contract_extractions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON public.contract_extractions
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.contract_extractions
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.contract_extractions
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.contract_extractions TO authenticated;
GRANT SELECT ON public.contract_extractions TO anon;