# Migration Plan: Multi-Tenant SaaS Model

## Overview
Mengubah aplikasi dari single-tenant (per-role based) menjadi multi-tenant SaaS seperti Supabase, di mana:
- User membuat akun personal
- User dapat create/join multiple companies
- Setiap company memiliki team members dengan roles

---

## ✅ Completed Changes

### 1. **Auth Flow Simplification**
- ✅ `Login.tsx` - Removed role-based routing, redirect ke `/dashboard`
- ✅ `Signup.tsx` - Removed role selection, signup tanpa role
- ✅ Redirect destination: `/dashboard` (universal landing page)

---

## 🔄 Required Changes

### 2. **Database Schema Changes**

#### A. New Tables

```sql
-- Companies/Organizations table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Company members (User-Company relationship with roles)
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'procurement', 'legal', 'management')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  UNIQUE(company_id, user_id)
);

-- Invitations table
CREATE TABLE company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('procurement', 'legal', 'management')),
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### B. Update Existing Tables

```sql
-- Update profiles table - remove role column
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Add RLS policies for multi-tenancy
ALTER TABLE contracts ADD COLUMN company_id UUID REFERENCES companies(id);
ALTER TABLE contract_extractions ADD COLUMN company_id UUID REFERENCES companies(id);
-- Repeat for all business tables...
```

---

### 3. **Application Routes Structure**

```
/                          → Landing page (public)
/auth/login               → Login page
/auth/signup              → Signup page
/auth/callback            → OAuth callback

/dashboard                → User dashboard (list of companies)
/dashboard/companies/new  → Create new company

/company/:companyId/      → Company dashboard
├── /contracts            → Contracts (role-based access)
├── /procurement          → Procurement features
├── /legal                → Legal features
├── /management           → Management features
├── /settings             → Company settings
└── /team                 → Team management (invite/remove members)
```

---

### 4. **Required Components**

#### `/dashboard` page
- List of companies user is member of
- "Create New Company" button
- Company switcher
- Personal settings

#### `/dashboard/companies/new` page
- Company name input
- Company slug (auto-generated from name)
- Submit → Create company → Redirect to `/company/:id`

#### `/company/:companyId/team` page
- List of team members with roles
- Invite new member (email + role selection)
- Remove member
- Change member role (owner only)

#### `CompanySwitcher` component
- Dropdown in navbar
- Shows current company
- Switch between companies

---

### 5. **Context Updates**

#### Update `AuthProvider.tsx`
```typescript
// Before
const { session, role } = useAuth()

// After
const { session, user, companies } = useAuth()
```

#### New `CompanyProvider.tsx`
```typescript
const { 
  currentCompany, 
  switchCompany, 
  userRole, // role in current company
  companies 
} = useCompany()
```

---

### 6. **API Services to Create**

```typescript
// src/services/companyService.ts
export const companyService = {
  createCompany(name: string, slug: string)
  getMyCompanies()
  getCompanyById(id: string)
  updateCompany(id: string, data: any)
  deleteCompany(id: string)
}

// src/services/teamService.ts
export const teamService = {
  getMembers(companyId: string)
  inviteMember(companyId: string, email: string, role: string)
  removeMember(companyId: string, userId: string)
  updateMemberRole(companyId: string, userId: string, role: string)
  acceptInvitation(token: string)
}
```

---

### 7. **RLS (Row Level Security) Policies**

```sql
-- Companies: User can see companies they're member of
CREATE POLICY "Users can view their companies"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Contracts: User can see contracts of their companies
CREATE POLICY "Users can view company contracts"
  ON contracts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add similar policies for all tables...
```

---

### 8. **Migration Steps**

1. ✅ **Phase 1: Auth Simplification** (DONE)
   - Remove role from signup/login
   - Redirect to universal `/dashboard`

2. **Phase 2: Database Migration**
   - Create new tables (companies, company_members, invitations)
   - Add company_id to existing tables
   - Migrate existing data (create default company for each user)

3. **Phase 3: Dashboard & Company Creation**
   - Create `/dashboard` page
   - Create company creation flow
   - Create company switcher

4. **Phase 4: Team Management**
   - Create team invitation system
   - Create team management UI
   - Implement role-based permissions per company

5. **Phase 5: Update Business Logic**
   - Update all queries to filter by company_id
   - Update RLS policies
   - Test multi-tenancy thoroughly

---

### 9. **Example User Flow**

1. **Signup**
   - User signs up → Gets personal account
   - Redirected to `/dashboard` (empty state)

2. **Create Company**
   - Click "Create New Company"
   - Enter company name → Auto-generate slug
   - User becomes owner of company
   - Redirected to `/company/:id`

3. **Invite Team**
   - Owner goes to `/company/:id/team`
   - Click "Invite Member"
   - Enter email + select role (procurement/legal/management)
   - Invitee receives email with link
   - Invitee accepts → Joins company

4. **Work in Company**
   - User can switch between companies
   - Each company has isolated data
   - Permissions based on user's role in current company

---

### 10. **Next Immediate Steps**

1. Create database migration SQL file
2. Create `/dashboard` page skeleton
3. Create company creation flow
4. Update `AuthProvider` to not rely on role
5. Create `CompanyProvider` context
6. Update routing to support company-based URLs

---

## Notes

- Existing `SelectRole.tsx` dapat dihapus (tidak dibutuhkan lagi)
- Landing page tetap bisa diakses tanpa login
- Semua business logic harus filter by `company_id`
- User bisa menjadi owner di satu company, tapi member biasa di company lain
