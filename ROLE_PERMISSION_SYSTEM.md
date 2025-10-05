# Role & Permission System

## Overview
Sistem permission yang mengizinkan akses berbasis role dengan privilege khusus untuk **owner**.

---

## Role Types

### 1. **Owner** (Super Access)
- User yang membuat company
- **Dapat akses SEMUA route** (`/legal`, `/procurement`, `/management`)
- Tidak dibatasi oleh role apapun
- Flag: `isOwner = true` di AuthProvider

### 2. **Legal**
- Hanya dapat akses `/legal/*` routes
- Tidak dapat akses `/procurement` atau `/management`
- Jika owner: dapat akses semua

### 3. **Procurement**
- Hanya dapat akses `/procurement/*` routes
- Tidak dapat akses `/legal` atau `/management`
- Jika owner: dapat akses semua

### 4. **Management**
- Hanya dapat akses `/management/*` routes
- Tidak dapat akses `/legal` atau `/procurement`
- Jika owner: dapat akses semua

---

## Permission Matrix

| Role | Can Access `/legal` | Can Access `/procurement` | Can Access `/management` |
|------|---------------------|---------------------------|--------------------------|
| **Owner** | ✅ YES | ✅ YES | ✅ YES |
| **Legal** | ✅ YES | ❌ NO | ❌ NO |
| **Procurement** | ❌ NO | ✅ YES | ❌ NO |
| **Management** | ❌ NO | ❌ NO | ✅ YES |

---

## How It Works

### ProtectedRoute Component
```tsx
<ProtectedRoute allow={['legal']}>
  <LegalLayout />
</ProtectedRoute>
```

**Logic Flow:**
1. Check if user is authenticated → if not, redirect to `/auth/login`
2. Check if user is **owner** → if yes, **allow access** (bypass role check)
3. Check if user has required role → if yes, allow access
4. If not owner and no matching role → redirect to user's designated route

### Example Scenarios

#### Scenario 1: Owner accessing Legal page
```
User: owner (isOwner = true, role = 'procurement')
Accessing: /legal
Result: ✅ ALLOWED (owner privilege)
```

#### Scenario 2: Legal user accessing Legal page
```
User: legal (isOwner = false, role = 'legal')
Accessing: /legal
Result: ✅ ALLOWED (matching role)
```

#### Scenario 3: Legal user trying to access Procurement
```
User: legal (isOwner = false, role = 'legal')
Accessing: /procurement
Result: ❌ DENIED → Redirect to /legal
```

#### Scenario 4: Owner accessing any page
```
User: owner (isOwner = true, role = 'management')
Accessing: /legal, /procurement, /management
Result: ✅ ALLOWED for all (owner privilege)
```

---

## Code Implementation

### AuthProvider.tsx
```typescript
const { 
  session,
  profile,
  role,        // 'legal' | 'procurement' | 'management'
  isOwner,     // true if user created a company
  loading,
  signOut
} = useAuth()
```

### ProtectedRoute.tsx
```typescript
export default function ProtectedRoute({ children, allow }: Props) {
  const { loading, session, role, isOwner } = useAuth()

  // 1. Check authentication
  if (!session) return <Navigate to="/auth/login" />

  // 2. Owner bypass - can access everything
  if (isOwner) return children

  // 3. Check role permission
  if (allow && role && !allow.includes(role)) {
    const redirect = /* redirect to user's role route */
    return <Navigate to={redirect} />
  }

  // 4. Allow access
  return children
}
```

### Route Configuration (main.tsx)
```typescript
{
  path: '/legal',
  element: (
    <ProtectedRoute allow={['legal']}>
      <LegalLayout />
    </ProtectedRoute>
  ),
  children: [...]
}
```

---

## Database Schema

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('legal', 'procurement', 'management')),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### companies table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),  -- The creator
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Query to check if owner
```typescript
async function checkIfOwner(userId: string) {
  const { data } = await supabase
    .from('companies')
    .select('owner_id')
    .eq('owner_id', userId)
    .maybeSingle();
  
  return data ? true : false;
}
```

---

## Testing Checklist

### ✅ Authentication Tests
- [ ] Unauthenticated user → Redirect to login
- [ ] Authenticated user without role → Redirect to dashboard

### ✅ Owner Tests
- [ ] Owner can access `/legal`
- [ ] Owner can access `/procurement`
- [ ] Owner can access `/management`
- [ ] Owner with role='legal' can still access `/procurement` and `/management`

### ✅ Role-based Tests
- [ ] Legal user can access `/legal`
- [ ] Legal user cannot access `/procurement` (redirect to `/legal`)
- [ ] Legal user cannot access `/management` (redirect to `/legal`)
- [ ] Procurement user can access `/procurement`
- [ ] Procurement user cannot access `/legal` (redirect to `/procurement`)
- [ ] Procurement user cannot access `/management` (redirect to `/procurement`)
- [ ] Management user can access `/management`
- [ ] Management user cannot access `/legal` (redirect to `/management`)
- [ ] Management user cannot access `/procurement` (redirect to `/management`)

---

## UI Indicators (Recommendations)

### Navbar - Show accessible routes
```tsx
function Navbar() {
  const { role, isOwner } = useAuth()
  
  return (
    <nav>
      {/* Owner or Legal can see this */}
      {(isOwner || role === 'legal') && (
        <Link to="/legal">Legal</Link>
      )}
      
      {/* Owner or Procurement can see this */}
      {(isOwner || role === 'procurement') && (
        <Link to="/procurement">Procurement</Link>
      )}
      
      {/* Owner or Management can see this */}
      {(isOwner || role === 'management') && (
        <Link to="/management">Management</Link>
      )}
    </nav>
  )
}
```

### Badge - Show user status
```tsx
function UserBadge() {
  const { role, isOwner, profile } = useAuth()
  
  return (
    <div>
      {profile?.full_name}
      {isOwner && <span className="badge">Owner</span>}
      <span className="role">{role}</span>
    </div>
  )
}
```

---

## Migration Notes

### From Old System
**Before:** Role-based signup/login with SelectRole page
**After:** Owner gets full access, team members get specific roles

### Existing Users
- Users who created companies → Mark as `owner` in companies table
- Team members → Keep their roles (legal/procurement/management)
- Solo users → Need to create a company or join one

---

## Security Considerations

1. **Backend validation required**
   - Frontend permissions are for UX only
   - Always validate permissions on backend (RLS, API endpoints)

2. **RLS Policies**
   ```sql
   -- Example: Legal data access
   CREATE POLICY "legal_access"
     ON legal_documents FOR SELECT
     USING (
       auth.uid() IN (
         SELECT id FROM profiles 
         WHERE role = 'legal' 
         OR id IN (SELECT owner_id FROM companies)
       )
     );
   ```

3. **API Route Guards**
   - Check `isOwner` flag before allowing mutations
   - Verify role matches action requirements
   - Log unauthorized access attempts

---

## Summary

✅ **Owner = Super User** (access everything)
✅ **Legal = /legal only**
✅ **Procurement = /procurement only**
✅ **Management = /management only**

**Key Feature:** Owner bypass logic ensures company creators have full control without permission restrictions.
