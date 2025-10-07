# Billing Integration Documentation

## Overview
BillingOwner component telah terintegrasi penuh dengan Supabase untuk mengelola subscription plans dan invoice history.

## Database Schema

### Table: `billing_invoices`
Table ini menyimpan semua invoice untuk setiap company.

**Columns:**
- `id` (uuid, primary key): Unique identifier untuk invoice
- `company_id` (uuid, foreign key): Reference ke table companies
- `plan_name` (text): Nama plan (Starter, Professional, Enterprise)
- `amount` (numeric): Jumlah invoice dalam IDR
- `status` (text): Status pembayaran (paid, due, failed, pending, refunded)
- `invoice_url` (text): URL untuk download invoice PDF
- `invoice_number` (text, unique): Nomor invoice unik (e.g., INV-2025-0001)
- `issued_at` (timestamp): Tanggal invoice diterbitkan
- `billing_date` (timestamp): Tanggal periode billing
- `due_date` (timestamp): Tanggal jatuh tempo
- `paid_at` (timestamp): Tanggal pembayaran aktual
- `period_start` (timestamp): Awal periode subscription
- `period_end` (timestamp): Akhir periode subscription
- `payment_method` (text): Metode pembayaran
- `transaction_id` (text): ID transaksi dari payment gateway
- `notes` (text): Catatan tambahan
- `created_at` (timestamp): Timestamp pembuatan record
- `updated_at` (timestamp): Timestamp update terakhir

### Table: `companies` (Updated)
Column `subscription_plan` sudah ada di table companies untuk menyimpan plan saat ini.

**Subscription Plans:**
- `basic` / `starter`: Free plan dengan fitur terbatas
- `premium` / `professional`: Rp 220,000/bulan dengan AI features
- `enterprise`: Rp 470,000/bulan dengan unlimited features

## Setup Instructions

### 1. Run Database Migration
Jalankan SQL scripts berikut secara berurutan di Supabase SQL Editor:

```sql
-- 1. Create billing_invoices table and policies
-- File: supabase/billing_schema.sql
\i supabase/billing_schema.sql

-- 2. Insert sample data (optional, for testing)
-- File: supabase/billing_seed.sql
-- IMPORTANT: Replace 'YOUR-COMPANY-UUID-HERE' dengan company ID aktual
\i supabase/billing_seed.sql
```

### 2. Get Your Company ID
Untuk mendapatkan company_id, jalankan query berikut:

```sql
SELECT id, name, code FROM public.companies;
```

Copy UUID dari kolom `id` dan replace semua instance `YOUR-COMPANY-UUID-HERE` di file `billing_seed.sql`.

### 3. Insert Sample Data
Setelah replace company_id, jalankan `billing_seed.sql` untuk insert sample invoices.

## Features Implemented

### 1. View Current Subscription Plan
- Menampilkan plan saat ini dengan visual indicator "Current"
- Data fetched dari `companies.subscription_plan`

### 2. Subscription Modal Payment Flow ✨ NEW
- User klik button "Choose Plan" → Opens subscription modal
- Form payment information: Card number, expiration, CVV
- Form billing information: Name, country, address
- Submit payment → Process subscription
- Function: `processSubscription(companyId, planName, amount, paymentMethod, transactionId)`
- **Automatically creates invoice** setelah payment success
- **Auto-refresh** invoice list untuk show invoice baru
- Loading state dengan spinner saat proses

### 3. View Invoice History
- Menampilkan semua invoice dalam bentuk tabel
- Sorted by `issued_at` DESC (terbaru di atas)
- Menampilkan: Date, Plan, Amount, Status, Invoice download link
- Function: `getCompanyInvoices(companyId)`
- **Auto-refresh** after new subscription

### 4. Download All Invoices
- Export semua invoice data ke CSV file
- Format: `invoices_{companyId}_{date}.csv`
- Function: `downloadAllInvoices(companyId)`
- Loading state dengan spinner

### 5. Invoice Status Badges
- Color-coded badges untuk setiap status:
  - **Paid**: Green (emerald)
  - **Due**: Amber/Yellow
  - **Failed**: Red (rose)
  - **Pending**: Gray (slate)
  - **Refunded**: Blue

### 6. Auto Invoice Generation ✨ NEW
- Invoice otomatis dibuat setelah payment success
- Invoice number format: `INV-YYYYMM-XXXX`
- Status: `paid` (karena payment sudah berhasil)
- Period: Current date to next month (30 days)
- Payment method: Detected from card number (Visa/Mastercard)
- Transaction ID: Auto-generated unique ID

### 6. Date & Currency Formatting
- Date: `formatDate()` - Format: "January 1, 2025"
- Currency: `formatCurrency()` - Format: "Rp 220,000"

## Payment Flow with Modal Integration ✨

### Complete Payment Flow:

1. **User clicks "Choose Plan"**
   - Opens `SubscriptionModal` component
   - Shows payment form and billing form

2. **User fills payment information**
   - Card number (auto-formatted: 1234 5678 9012 3456)
   - Expiration date (auto-formatted: MM/YY)
   - CVV (3 digits)
   - Billing information (name, address, country)

3. **User submits payment**
   - Click "Confirm & Subscribe" button
   - Form validation checks
   - Shows loading spinner

4. **Process subscription** (Backend simulation)
   - Calls `processSubscription()` function
   - Updates `subscription_plan` in companies table
   - Creates new invoice in `billing_invoices` table

5. **Invoice auto-generated**
   - Invoice number: `INV-202510-XXXX`
   - Status: `paid`
   - Amount: Plan price (e.g., Rp 250,000)
   - Payment method: Detected from card (Visa/Mastercard)
   - Transaction ID: Auto-generated
   - Period: 30 days (current to next month)

6. **UI updates**
   - Modal closes
   - Current plan badge updates
   - Invoice list auto-refreshes
   - New invoice appears at top of table
   - Success alert message

### Flow Diagram:
```
User clicks plan
      ↓
Modal opens
      ↓
Fill payment form
      ↓
Submit payment
      ↓
processSubscription()
      ↓
┌─────────────────┬──────────────────┐
│                 │                  │
Update Plan    Create Invoice     Generate
(companies)  (billing_invoices)  Transaction ID
      │                 │              │
      └─────────────────┴──────────────┘
                    ↓
              Refresh Data
                    ↓
            Show Success Message
```

## Service Layer (billingService.ts)

### Functions:

#### `getCompanyInvoices(companyId: string): Promise<InvoiceRecord[]>`
Fetch semua invoice untuk company, sorted by issued_at DESC.

#### `getCurrentPlan(companyId: string): Promise<string | null>`
Get subscription plan saat ini dari table companies.

#### `createInvoice(companyId, planName, amount, paymentMethod, transactionId): Promise<InvoiceRecord | null>` ✨ NEW
Create new invoice record setelah payment berhasil. Auto-generates invoice number, sets status to "paid", calculates billing period.

#### `processSubscription(companyId, planName, amount, paymentMethod, transactionId): Promise<{success, invoice?, error?}>` ✨ NEW
Complete subscription process:
1. Update subscription plan
2. Create invoice
3. Return result with invoice data

Returns object:
```typescript
{
  success: boolean
  invoice?: InvoiceRecord  // If successful
  error?: string           // If failed
}
```

#### `downloadAllInvoices(companyId: string): Promise<void>`
Export semua invoice data ke CSV file.

## Row Level Security (RLS)

RLS policies sudah dikonfigurasi di `billing_invoices` table:

1. **SELECT Policy**: Users hanya bisa view invoices dari company mereka sendiri
2. **INSERT Policy**: Hanya system/admin yang bisa insert invoices
3. **UPDATE Policy**: Hanya system/admin yang bisa update invoices
4. **DELETE Policy**: Hanya system/admin yang bisa delete invoices

Policy menggunakan:
```sql
company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
)
```

## Testing

### Test Scenarios:

1. **View Billing Page**
   - Login sebagai owner
   - Navigate ke `/owner/billing`
   - Verify current plan ditampilkan dengan benar
   - Verify invoice history muncul

2. **Change Plan**
   - Klik button "Choose Plan" pada plan yang berbeda
   - Verify loading spinner muncul
   - Verify success alert
   - Verify "Current" badge berpindah ke plan baru

3. **Download Invoice**
   - Klik "Download" link pada invoice row
   - Verify invoice PDF terbuka di tab baru

4. **Download All Invoices**
   - Klik button "Download All"
   - Verify loading spinner muncul
   - Verify CSV file terdownload
   - Verify format CSV correct

5. **Empty State**
   - Test dengan company yang tidak punya invoices
   - Verify "No invoices found" message muncul

## Future Enhancements

### Possible Improvements:
1. **Payment Gateway Integration**: Integrate dengan payment gateway (Midtrans, Xendit, dll)
2. **Auto-generate Invoices**: Cron job untuk auto-generate monthly invoices
3. **Invoice PDF Generation**: Generate PDF invoices on-the-fly
4. **Payment History**: Tambah detail payment history dengan refund tracking
5. **Usage Metrics**: Tampilkan usage metrics untuk setiap plan
6. **Billing Alerts**: Email notifications untuk upcoming due dates
7. **Proration**: Calculate proration ketika upgrade/downgrade mid-cycle
8. **Multi-currency**: Support multiple currencies (USD, IDR, etc)

## Troubleshooting

### Issue: "Failed to load invoices"
**Solution**: 
- Check RLS policies di Supabase
- Verify user memiliki `company_id` di profiles table
- Check Supabase logs untuk error details

### Issue: "Failed to change plan"
**Solution**:
- Verify user adalah owner (check companies.owner_id)
- Check UPDATE permissions di RLS policies
- Verify plan name valid (basic, premium, enterprise)

### Issue: CSV download tidak jalan
**Solution**:
- Check browser popup blocker
- Verify ada invoices untuk company tersebut
- Check console untuk JavaScript errors

## API Reference

### Types:

```typescript
type PlanKey = "basic" | "premium" | "enterprise"

type InvoiceStatus = "paid" | "due" | "failed" | "pending" | "refunded"

type InvoiceRecord = {
  id: string
  company_id: string | null
  plan_name: string | null
  amount: number | null
  status: string | null
  invoice_url: string | null
  issued_at: string | null
  billing_date?: string | null
  created_at?: string | null
  period_start?: string | null
  period_end?: string | null
}
```

## Security Considerations

1. **RLS Policies**: Semua queries menggunakan RLS untuk data isolation
2. **Owner-only Access**: Billing page hanya accessible untuk owners
3. **Secure Updates**: Plan changes hanya bisa dilakukan via authenticated API
4. **Input Validation**: Validate plan names sebelum update
5. **Rate Limiting**: Consider adding rate limiting untuk prevent abuse

## Notes

- Default plan adalah "basic" untuk new companies
- Subscription plan changes langsung efek (no grace period implemented)
- Invoice PDF URLs bersifat placeholder, perlu integrate dengan actual storage
- Transaction IDs untuk tracking payment gateway transactions
