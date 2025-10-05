-- Migration: Allow NULL role for new users (no default role assignment)
-- Date: 2025-10-05
-- Purpose: Users sign up without role, will be assigned role when joining/creating company

-- Step 1: Alter profiles table to allow NULL role
ALTER TABLE public.profiles 
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN role DROP DEFAULT;

-- Step 2: Update the handle_new_user trigger to NOT set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Only set role if explicitly provided in metadata, otherwise NULL
    NULLIF((NEW.raw_user_meta_data->>'role')::user_role, NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 3: Add comment for clarity
COMMENT ON COLUMN public.profiles.role IS 'User role in their company context. NULL means no company membership yet.';

-- Step 4: Update existing users without company to have NULL role (optional, for cleanup)
-- Uncomment if you want to reset existing solo users
-- UPDATE public.profiles 
-- SET role = NULL 
-- WHERE company_id IS NULL AND role = 'procurement';

-- Note: This migration allows users to sign up without a role
-- Role will be assigned when:
-- 1. User creates a company (becomes owner)
-- 2. User is invited to a company (assigned role by inviter)
