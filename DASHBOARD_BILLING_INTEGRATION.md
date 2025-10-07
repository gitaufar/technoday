# Dashboard Owner Billing Integration

## Overview
Integrated subscription upgrade functionality directly into the main Dashboard Owner page, allowing users to upgrade their plan without navigating to the dedicated billing page.

## Integration Details

### Features Added
1. **"Upgrade Plan" Button**: 
   - Located in the billing overview card
   - Shows loading state during upgrade process
   - Disabled for Enterprise users (already at highest tier)
   - Opens subscription modal on click

2. **Subscription Modal**:
   - Reuses the same `SubscriptionModal` component from BillingOwner
   - Dynamically shows next plan tier (Professional for basic users, Enterprise for premium users)
   - Handles complete payment flow with form validation

3. **Automatic Invoice Generation**:
   - Creates invoice record after successful payment
   - Uses `processSubscription()` service function
   - Updates subscription_plan in companies table
   - Generates unique invoice number (INV-YYYYMM-XXXX format)

4. **Dashboard Refresh**:
   - Automatically reloads dashboard data after successful upgrade
   - Updates plan badge, statistics, and limits
   - Shows success alert with confirmation message

### Technical Implementation

#### State Management
```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [upgradingPlan, setUpgradingPlan] = useState(false)
```

#### Plan Configuration
```typescript
const PLAN_PRICES = {
  basic: 0,
  premium: 250000,    // IDR
  enterprise: 470000  // IDR
}

const PLAN_FEATURES = {
  basic: ["Up to 10 contracts", "Up to 5 team members", "Basic reports", "Email support"],
  premium: ["Up to 50 contracts", "Up to 25 team members", "Advanced reports & analytics", "Priority email support", "Risk assessment tools"],
  enterprise: ["Unlimited contracts", "Unlimited team members", "Custom reports & dashboards", "24/7 priority support", "Advanced risk analysis", "API access", "Dedicated account manager"]
}
```

#### Key Functions

**1. loadDashboardData()**
- `useCallback` hook for reusable data fetching
- Loads company info and statistics from Supabase
- Called on mount and after successful upgrades
- Dependencies: `companyId`

**2. handleUpgradeClick()**
- Triggered by "Upgrade Plan" button
- Checks current plan tier
- Shows alert for Enterprise users
- Opens modal for basic/premium users

**3. handlePaymentSuccess(paymentData)**
- Receives payment form data from modal
- Detects card type (Visa/Mastercard) from card number
- Generates unique transaction ID
- Calls `processSubscription()` to update database
- Refreshes dashboard data
- Shows success/error alerts

### User Flow
1. User clicks "Upgrade Plan" button in billing card
2. Modal opens with next plan tier details
3. User fills payment form (card info, billing info)
4. User submits payment
5. System processes:
   - Updates `subscription_plan` in `companies` table
   - Creates new record in `billing_invoices` table
   - Generates invoice number and billing dates
6. Dashboard refreshes automatically
7. User sees updated plan badge and limits
8. Success alert confirms upgrade

### Database Impact
- **companies table**: `subscription_plan` field updated to new plan
- **billing_invoices table**: New invoice record created with:
  - Unique invoice number (INV-YYYYMM-XXXX)
  - Plan name and amount
  - Payment method and transaction ID
  - Billing period (30 days from issue date)
  - Status set to "paid"
  - Period start/end dates

### Edge Cases Handled
1. **Enterprise Users**: Button shows "Current Plan" and is disabled
2. **Loading State**: Button shows spinner during upgrade process
3. **Error Handling**: Try-catch blocks with user-friendly error messages
4. **No Company**: Gracefully handles missing company ID
5. **Database Errors**: Proper error logging and user notification

### Testing Checklist
- [ ] Navigate to `/owner` (Dashboard Owner page)
- [ ] Verify "Upgrade Plan" button is visible
- [ ] Click button and verify modal opens
- [ ] Check modal shows correct next plan (Professional for basic, Enterprise for premium)
- [ ] Fill payment form with test data
- [ ] Submit and verify loading state (spinner on button)
- [ ] Verify success alert appears
- [ ] Check plan badge updates to new plan
- [ ] Verify dashboard statistics refresh
- [ ] Check Supabase:
  - [ ] `companies.subscription_plan` updated
  - [ ] New invoice created in `billing_invoices`
- [ ] Test with Enterprise user - verify button is disabled

### Related Files
- **Component**: `src/components/SubscriptionModal.tsx`
- **Service**: `src/services/billingService.ts`
- **Page**: `src/routes/owner/DashboardOwner.tsx`
- **Schema**: `supabase/billing_schema.sql`

### Future Enhancements
1. Add downgrade functionality (with prorated refunds)
2. Add payment method management (save cards)
3. Add subscription cancellation flow
4. Add usage-based billing alerts
5. Add automatic renewal reminders
6. Add multi-currency support
7. Add discount code functionality

## Consistent Pattern
This integration follows the same pattern as BillingOwner:
- Modal state management
- Handler functions for click events
- Payment success callback
- Data refresh after updates
- Service layer for database operations
- Proper error handling and user feedback

This ensures a consistent upgrade experience across different pages of the application.
