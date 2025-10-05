# NULL Role on Signup - Implementation Guide

## Overview
Users sekarang mendaftar **tanpa role**. Role akan diberikan ketika:
1. User membuat company (menjadi owner)
2. User diundang ke company (diberikan role oleh owner)

---

## Changes Made

### 1. Database Migration
**File:** `supabase/migration_allow_null_role.sql`

**Changes:**
```sql
-- Allow NULL role in profiles table
ALTER TABLE public.profiles 
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN role DROP DEFAULT;

-- Update trigger to NOT set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- role will be NULL if not provided
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULLIF((NEW.raw_user_meta_data->>'role')::user_role, NULL)
  );
  RETURN NEW;
END;
$$;
```

**To Apply:**
```bash
# Run in Supabase SQL Editor
psql -d your_database < supabase/migration_allow_null_role.sql
```

### 2. Frontend - AuthProvider Update
**File:** `src/auth/AuthProvider.tsx`

**Before:**
```typescript
type Profile = { 
  role: Role;  // Always has value
}
```

**After:**
```typescript
type Profile = { 
  role: Role | null;  // Can be NULL for new users
}
```

### 3. Frontend - Signup Flow
**File:** `src/routes/auth/Signup.tsx`

**Code:**
```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },  // NO role data
  },
});
```

**Result:** User dibuat dengan `role = NULL` di database

---

## User Journey

### Scenario 1: New User Signs Up
```
1. User goes to /auth/signup
2. Fills in: Name, Email, Password
3. Clicks "Sign Up"
   ↓
4. Account created with role = NULL
5. Redirected to /auth/login
6. After login → Redirected to /dashboard
7. Dashboard shows: "Create your first company"
```

### Scenario 2: User Creates Company
```
1. User clicks "Create Company"
2. Enters company name
3. Company created with user as owner_id
   ↓
4. User automatically becomes:
   - isOwner = true
   - Can access ALL routes (/legal, /procurement, /management)
   - role can still be NULL (doesn't matter, owner has full access)
```

### Scenario 3: User Invited to Company
```
1. Owner invites user@example.com with role='legal'
2. Invitation sent via email
3. User accepts invitation
   ↓
4. User's profile updated:
   - role = 'legal'
   - company_id = invited_company_id
5. User can now access /legal routes
```

---

## Role States

### NULL Role (New User)
```typescript
{
  role: null,
  isOwner: false,
  company_id: null
}
```
**Access:**
- ❌ Cannot access /legal, /procurement, /management
- ✅ Can access /dashboard
- ✅ Can create company (becomes owner)
- ✅ Can accept invitation (gets role)

### Owner (Company Creator)
```typescript
{
  role: null,  // or any role, doesn't matter
  isOwner: true,
  company_id: 'xxx'
}
```
**Access:**
- ✅ Full access to /legal, /procurement, /management
- ✅ Can invite team members
- ✅ Can manage company settings

### Team Member (Invited User)
```typescript
{
  role: 'legal',  // or 'procurement' or 'management'
  isOwner: false,
  company_id: 'xxx'
}
```
**Access:**
- ✅ Access to their role route only
- ❌ Cannot access other role routes
- ✅ Can view company data

---

## ProtectedRoute Behavior

### Code Logic
```typescript
export default function ProtectedRoute({ children, allow }: Props) {
  const { session, role, isOwner } = useAuth()

  // 1. Not logged in → login page
  if (!session) return <Navigate to="/auth/login" />

  // 2. Owner → bypass all checks
  if (isOwner) return children

  // 3. Check role
  if (allow && role && !allow.includes(role)) {
    // User has role but not allowed
    return <Navigate to={redirect} />
  }

  // 4. No role and route requires role → dashboard
  if (allow && !role) {
    return <Navigate to="/dashboard" />
  }

  return children
}
```

### Examples

**Case 1: New user (role=NULL) tries /legal**
```
role: null
isOwner: false
allow: ['legal']
→ Redirect to /dashboard (no role yet)
```

**Case 2: Legal user tries /legal**
```
role: 'legal'
isOwner: false
allow: ['legal']
→ ✅ Allowed (role matches)
```

**Case 3: Legal user tries /procurement**
```
role: 'legal'
isOwner: false
allow: ['procurement']
→ ❌ Redirect to /legal (wrong role)
```

**Case 4: Owner (with NULL role) tries /legal**
```
role: null
isOwner: true
allow: ['legal']
→ ✅ Allowed (owner bypass)
```

**Case 5: Owner (with role='procurement') tries /legal**
```
role: 'procurement'
isOwner: true
allow: ['legal']
→ ✅ Allowed (owner bypass)
```

---

## Dashboard Route (New)

**Purpose:** Landing page for authenticated users

**Access Control:**
- ✅ Any authenticated user
- ✅ Users with or without role
- ✅ Users with or without company

**UI States:**

### State 1: No Company (role=NULL)
```tsx
<EmptyState>
  <h2>Welcome to OptiMind</h2>
  <p>Get started by creating your first company</p>
  <Button onClick={createCompany}>Create Company</Button>
</EmptyState>
```

### State 2: Has Company (owner)
```tsx
<CompanyList>
  <CompanyCard company={myCompany} isOwner={true} />
  <Button>Create Another Company</Button>
</CompanyList>
```

### State 3: Team Member
```tsx
<CompanyList>
  <CompanyCard company={companyA} role="legal" />
  <CompanyCard company={companyB} role="procurement" />
</CompanyList>
```

---

## Migration Steps for Existing Users

### Option A: Keep Existing Roles (Recommended)
```sql
-- Do nothing
-- Existing users keep their roles
-- Only new signups will have NULL role
```

### Option B: Reset All to NULL
```sql
-- Reset users without company
UPDATE public.profiles 
SET role = NULL 
WHERE company_id IS NULL;
```

### Option C: Migrate to Multi-Tenant
```sql
-- Create default company for each user
INSERT INTO companies (name, owner_id)
SELECT 
  'Default Company - ' || full_name,
  id
FROM profiles
WHERE company_id IS NULL;

-- Link users to their companies
UPDATE profiles p
SET company_id = c.id
FROM companies c
WHERE c.owner_id = p.id AND p.company_id IS NULL;
```

---

## Testing Checklist

### Signup Flow
- [ ] New user signs up
- [ ] User created with role = NULL in database
- [ ] User redirected to login
- [ ] After login, redirected to /dashboard

### Dashboard Access
- [ ] User with NULL role can access /dashboard
- [ ] User with NULL role sees "Create Company" empty state
- [ ] User with NULL role CANNOT access /legal, /procurement, /management

### Company Creation
- [ ] User creates company
- [ ] User becomes owner (isOwner = true)
- [ ] Owner can access all routes

### Team Invitation
- [ ] Owner invites new user with role='legal'
- [ ] Invited user accepts
- [ ] User's role updated to 'legal'
- [ ] User can access /legal only

### Owner Permissions
- [ ] Owner with NULL role can access all routes
- [ ] Owner with role='procurement' can access /legal, /management

---

## Security Considerations

### Database (RLS Policies)
```sql
-- Only allow access if user has role OR is owner
CREATE POLICY "legal_access"
  ON legal_documents FOR SELECT
  USING (
    -- Has legal role
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'legal'
    )
    OR
    -- Is company owner
    auth.uid() IN (
      SELECT owner_id FROM companies 
      WHERE id = company_id
    )
  );
```

### API Validation
```typescript
// Example: Check permission before mutation
async function updateContract(contractId: string) {
  const { role, isOwner } = await getUserPermissions()
  
  if (!isOwner && role !== 'legal') {
    throw new Error('Unauthorized')
  }
  
  // Proceed with update...
}
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Signup** | User picks role | No role selection |
| **Default Role** | 'procurement' | NULL |
| **Database** | role NOT NULL | role NULL allowed |
| **AuthProvider** | role: Role | role: Role \| null |
| **Access Control** | Role-based only | Role OR Owner-based |
| **First Login** | Redirect to role route | Redirect to /dashboard |

✅ **Users sign up without role**
✅ **Role assigned on company join/create**
✅ **Owner has super access**
✅ **Backward compatible with existing users**
