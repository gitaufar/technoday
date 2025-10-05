# Company Info Feature

## Overview
Menambahkan menu "Company Info" di dropdown profil untuk semua user (owner dan non-owner) agar bisa melihat informasi company dan team members.

## Implementasi

### 1. **Menu Dropdown Update**
Menambahkan menu "Company Info" di semua layout:
- **Management Layout** (`src/routes/management/Layout.tsx`)
- **Legal Layout** (`src/routes/legal/Layout.tsx`)
- **Procurement Layout** (`src/routes/procurement/Layout.tsx`)

Menu muncul untuk **semua user** (bukan hanya owner), terletak sebelum menu "Logout" dengan separator line.

### 2. **Company Info Page**
File: `src/routes/common/CompanyInfo.tsx`

#### Features:
- **Company Details Card**
  - Company Name
  - Company ID
  - Created At
  - User's Role (Owner/Procurement/Legal/Management)

- **Team Members List**
  - Avatar dengan initial
  - Full name dan email
  - Role badge dengan color coding:
    - 🟣 Purple: Owner
    - 🔵 Blue: Procurement
    - 🟢 Green: Legal
    - 🟠 Orange: Management
    - ⚪ Gray: Other roles

#### Data Fetching:
```typescript
// Fetch company information
const { data: companyData } = await supabase
  .from('companies')
  .select('*')
  .eq('id', profile.company_id)
  .single()

// Fetch team members
const { data: membersData } = await supabase
  .from('company_members')
  .select(`
    id,
    user_id,
    role,
    profiles:user_id (
      full_name,
      email
    )
  `)
  .eq('company_id', profile.company_id)
```

### 3. **Routing**
File: `src/main.tsx`

Menambahkan route baru:
```tsx
{
  path: '/settings/company',
  element: (
    <ProtectedRoute allow={['procurement', 'legal', 'management']}>
      <CompanyInfo />
    </ProtectedRoute>
  ),
}
```

Route ini accessible dari semua role (procurement, legal, management).

## UI/UX

### Dropdown Menu Structure (Owner)
```
┌────────────────────────────────┐
│ SWITCH DASHBOARD               │
├────────────────────────────────┤
│ 📊 Procurement                 │
│ 📈 Legal                       │
│ 📊 Management                  │
├────────────────────────────────┤
│ 👥 Company Info               │
├────────────────────────────────┤
│ 🚪 Logout                     │
└────────────────────────────────┘
```

### Dropdown Menu Structure (Non-Owner)
```
┌────────────────────────────────┐
│ 👥 Company Info               │
├────────────────────────────────┤
│ 🚪 Logout                     │
└────────────────────────────────┘
```

### Company Info Page Layout
```
┌─────────────────────────────────────────┐
│ Company Information                     │
│ View your company details and team      │
├─────────────────────────────────────────┤
│                                         │
│ Company Details                         │
│ ┌─────────────────────────────────────┐ │
│ │ Company Name:  Acme Corp            │ │
│ │ Company ID:    abc-123-def          │ │
│ │ Created At:    January 1, 2025      │ │
│ │ Your Role:     [Owner Badge]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Team Members                            │
│ ┌─────────────────────────────────────┐ │
│ │ [A] Alice Johnson                   │ │
│ │     alice@company.com    [Owner]    │ │
│ ├─────────────────────────────────────┤ │
│ │ [B] Bob Smith                       │ │
│ │     bob@company.com   [Procurement] │ │
│ ├─────────────────────────────────────┤ │
│ │ [C] Carol White                     │ │
│ │     carol@company.com      [Legal]  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Icons & Colors

### Company Info Icon
```svg
<svg viewBox="0 0 24 24">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
</svg>
```

### Role Badge Colors
- **Owner**: Purple (`bg-purple-100 text-purple-800`)
- **Procurement**: Blue (`bg-blue-100 text-blue-800`)
- **Legal**: Green (`bg-green-100 text-green-800`)
- **Management**: Orange (`bg-orange-100 text-orange-800`)
- **Other**: Gray (`bg-slate-100 text-slate-800`)

## Database Tables Used

### `companies` table
```sql
- id (uuid)
- name (text)
- created_at (timestamp)
- owner_id (uuid)
```

### `company_members` table
```sql
- id (uuid)
- company_id (uuid, FK to companies)
- user_id (uuid, FK to profiles)
- role (text)
```

### `profiles` table (via JOIN)
```sql
- id (uuid)
- full_name (text)
- email (text)
- company_id (uuid)
```

## State Management

### Loading States
1. **Loading**: Shows "Loading..." spinner
2. **No Company**: Shows message "You are not associated with any company yet"
3. **Success**: Shows company details and team members list

### Error Handling
- Console error logging for debugging
- Graceful fallback to empty states

## Access Control
- ✅ All authenticated users can access
- ✅ Protected by `ProtectedRoute` with roles: procurement, legal, management
- ✅ Owner flag from AuthProvider determines role badge display

## Benefits
1. **Transparency**: Users can see who's in their company
2. **Organization**: Clear view of team structure and roles
3. **Self-Service**: Users can check company info without admin help
4. **Unified Access**: Available from all dashboards (Procurement, Legal, Management)

## Files Modified
- ✅ `src/routes/management/Layout.tsx` - Added Company Info menu
- ✅ `src/routes/legal/Layout.tsx` - Added Company Info menu
- ✅ `src/routes/procurement/Layout.tsx` - Added Company Info menu
- ✅ `src/routes/common/CompanyInfo.tsx` - New page (created)
- ✅ `src/main.tsx` - Added /settings/company route

## Testing Checklist
- [ ] Login as owner → Click Company Info → View company details
- [ ] Verify owner badge shows correctly
- [ ] Verify all team members listed with correct roles
- [ ] Login as procurement user → Click Company Info
- [ ] Login as legal user → Click Company Info
- [ ] Login as management user → Click Company Info
- [ ] Verify non-owner users see their role badge correctly
- [ ] Test with user without company (should show "No Company" message)
- [ ] Verify menu closes after clicking Company Info
- [ ] Check responsive design on mobile/tablet
