-- Sample Billing Data for Testing
-- File: supabase/billing_seed.sql
-- Date: October 7, 2025
-- Purpose: Insert sample invoice data for testing

-- ===================================
-- IMPORTANT: Replace company_id with actual UUID from your database
-- ===================================

-- To get your company_id, run this query first:
-- SELECT id, name, code FROM public.companies;

-- Then replace 'YOUR-COMPANY-UUID-HERE' below with the actual company ID

-- ===================================
-- SAMPLE INVOICES
-- ===================================

-- Insert sample invoices for the last 6 months
-- Note: Make sure to replace the company_id with your actual company UUID

-- Invoice 1: Paid - January 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE', -- Replace with actual company ID
  'Professional',
  220000,
  'paid',
  'INV-2025-0001',
  'https://example.com/invoices/INV-2025-0001.pdf',
  '2025-01-01 00:00:00+00',
  '2025-01-01 00:00:00+00',
  '2025-01-15 00:00:00+00',
  '2025-01-10 10:30:00+00',
  '2025-01-01 00:00:00+00',
  '2025-02-01 00:00:00+00',
  'credit_card',
  'TXN-2025-CC-001'
);

-- Invoice 2: Paid - February 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0002',
  'https://example.com/invoices/INV-2025-0002.pdf',
  '2025-02-01 00:00:00+00',
  '2025-02-01 00:00:00+00',
  '2025-02-15 00:00:00+00',
  '2025-02-08 14:20:00+00',
  '2025-02-01 00:00:00+00',
  '2025-03-01 00:00:00+00',
  'bank_transfer',
  'TXN-2025-BT-002'
);

-- Invoice 3: Paid - March 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0003',
  'https://example.com/invoices/INV-2025-0003.pdf',
  '2025-03-01 00:00:00+00',
  '2025-03-01 00:00:00+00',
  '2025-03-15 00:00:00+00',
  '2025-03-12 09:15:00+00',
  '2025-03-01 00:00:00+00',
  '2025-04-01 00:00:00+00',
  'credit_card',
  'TXN-2025-CC-003'
);

-- Invoice 4: Paid - April 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0004',
  'https://example.com/invoices/INV-2025-0004.pdf',
  '2025-04-01 00:00:00+00',
  '2025-04-01 00:00:00+00',
  '2025-04-15 00:00:00+00',
  '2025-04-09 16:45:00+00',
  '2025-04-01 00:00:00+00',
  '2025-05-01 00:00:00+00',
  'ewallet',
  'TXN-2025-EW-004'
);

-- Invoice 5: Paid - May 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0005',
  'https://example.com/invoices/INV-2025-0005.pdf',
  '2025-05-01 00:00:00+00',
  '2025-05-01 00:00:00+00',
  '2025-05-15 00:00:00+00',
  '2025-05-07 11:20:00+00',
  '2025-05-01 00:00:00+00',
  '2025-06-01 00:00:00+00',
  'credit_card',
  'TXN-2025-CC-005'
);

-- Invoice 6: Paid - June 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0006',
  'https://example.com/invoices/INV-2025-0006.pdf',
  '2025-06-01 00:00:00+00',
  '2025-06-01 00:00:00+00',
  '2025-06-15 00:00:00+00',
  '2025-06-11 13:30:00+00',
  '2025-06-01 00:00:00+00',
  '2025-07-01 00:00:00+00',
  'bank_transfer',
  'TXN-2025-BT-006'
);

-- Invoice 7: Paid - July 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0007',
  'https://example.com/invoices/INV-2025-0007.pdf',
  '2025-07-01 00:00:00+00',
  '2025-07-01 00:00:00+00',
  '2025-07-15 00:00:00+00',
  '2025-07-10 15:45:00+00',
  '2025-07-01 00:00:00+00',
  '2025-08-01 00:00:00+00',
  'credit_card',
  'TXN-2025-CC-007'
);

-- Invoice 8: Paid - August 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0008',
  'https://example.com/invoices/INV-2025-0008.pdf',
  '2025-08-01 00:00:00+00',
  '2025-08-01 00:00:00+00',
  '2025-08-15 00:00:00+00',
  '2025-08-09 10:20:00+00',
  '2025-08-01 00:00:00+00',
  '2025-09-01 00:00:00+00',
  'ewallet',
  'TXN-2025-EW-008'
);

-- Invoice 9: Paid - September 2025
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  paid_at,
  period_start,
  period_end,
  payment_method,
  transaction_id
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'paid',
  'INV-2025-0009',
  'https://example.com/invoices/INV-2025-0009.pdf',
  '2025-09-01 00:00:00+00',
  '2025-09-01 00:00:00+00',
  '2025-09-15 00:00:00+00',
  '2025-09-08 14:15:00+00',
  '2025-09-01 00:00:00+00',
  '2025-10-01 00:00:00+00',
  'credit_card',
  'TXN-2025-CC-009'
);

-- Invoice 10: Due - October 2025 (Current month - not paid yet)
INSERT INTO public.billing_invoices (
  company_id,
  plan_name,
  amount,
  status,
  invoice_number,
  invoice_url,
  issued_at,
  billing_date,
  due_date,
  period_start,
  period_end,
  payment_method
) VALUES (
  'YOUR-COMPANY-UUID-HERE',
  'Professional',
  220000,
  'due',
  'INV-2025-0010',
  'https://example.com/invoices/INV-2025-0010.pdf',
  '2025-10-01 00:00:00+00',
  '2025-10-01 00:00:00+00',
  '2025-10-15 00:00:00+00',
  '2025-10-01 00:00:00+00',
  '2025-11-01 00:00:00+00',
  'credit_card'
);

-- ===================================
-- VERIFICATION QUERY
-- ===================================

-- Run this query to verify the data was inserted correctly:
-- SELECT 
--   invoice_number,
--   plan_name,
--   amount,
--   status,
--   issued_at,
--   paid_at
-- FROM public.billing_invoices
-- WHERE company_id = 'YOUR-COMPANY-UUID-HERE'
-- ORDER BY issued_at DESC;
