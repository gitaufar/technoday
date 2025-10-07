# Routing Logic Update - Role-Based Navigation

## Overview
Updated the authentication and routing logic to handle different user roles with specific navigation paths.

## Changes Made

### 1. **Callback.tsx** - Post-Login Routing
**File**: `src/routes/auth/Callback.tsx`

**Logic**:
```
- If user is Owner → redirect to /owner
- If user has null role → redirect to /create-project
- If user has any other role (legal, management, procurement) → redirect to /role
```

**Implementation**:
- Added `isOwner` check from AuthProvider
- Simplified routing logic to three main paths:
  1. Owner users go to `/owner`
  2. Users without role (null) go to `/create-project`
  3. All other role users go to `/role` (unified dashboard)

### 2. **ProtectedRoute.tsx** - Route Access Control
**File**: `src/auth/ProtectedRoute.tsx`

**Updates**:
- **Special exception for `/create-project`**: Even owners CANNOT access this route - it's exclusively for users with `role: null`
- **Special exception for `/role` routes**: Owners CANNOT access these routes - they're exclusively for legal/management/procurement roles
- Owner bypass: Owners can only access `/owner` routes
- Role-based redirects: Users trying to access unauthorized routes are redirected to their appropriate dashboard:
  - Owner → `/owner`
  - Null role → `/create-project`
  - Other roles → `/role`

**Logic Flow**:
1. Check if route is exclusively for null role (`allow={[null]}`)
   - If yes, redirect non-null users (including owner) to their dashboard
2. Check if route is for specific roles (legal/management/procurement) and user is owner
   - If yes, redirect owner to `/owner`
3. Apply owner bypass only for routes that explicitly include 'owner' in allow array
4. Apply role-based access control for other users

### 3. **main.tsx** - Route Configuration
**File**: `src/main.tsx`

**Verified Configuration**:
```tsx
{
  path: '/create-project',
  element: (
    <ProtectedRoute allow={[null]}>
      <NullLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <NullDashboard /> },
    { path: 'Create', element: <Create /> },
  ],
}
```

**Access Control**:
- `/create-project` - Only accessible by users with `role: null` (owner blocked)
- `/owner` - Only accessible by owner users
- `/role` - Only accessible by legal, management, procurement roles (owner blocked)
- Other specific routes (procurement, legal, management) remain accessible by their respective roles and owner via dashboard switcher

## User Flows

### New User (role: null)
1. Sign up/Login
2. Redirected to `/create-project`
3. Can create company/project
4. After setup, role is assigned

### Owner User
1. Login
2. Redirected to `/owner`
3. Can access specific role dashboards (legal, management, procurement) via dashboard switcher
4. **Cannot** access `/create-project` (null role only)
5. **Cannot** access `/role` (unified dashboard for non-owner roles only)
6. Full access to company management via owner dashboard

### Role Users (legal/management/procurement)
1. Login
2. Redirected to `/role` (unified dashboard)
3. Access to Dashboard and Team pages
4. Can still access role-specific routes if needed

## Security
- All routes are protected by `ProtectedRoute` component
- Role validation happens at route level
- Unauthorized access attempts redirect to appropriate dashboard
- Owner has **LIMITED** access:
  - ✅ Can access `/owner` routes
  - ✅ Can access specific role dashboards (legal, management, procurement) via switcher
  - ❌ **Cannot** access `/create-project` (exclusively for null role)
  - ❌ **Cannot** access `/role` (exclusively for legal/management/procurement roles)
- `/create-project` is **exclusively** for users with `role: null`
- `/role` is **exclusively** for users with roles: legal, management, or procurement

## Testing Checklist
- [ ] Login with null role → should go to `/create-project`
- [ ] Login as owner → should go to `/owner`
- [ ] Login with legal role → should go to `/role`
- [ ] Login with management role → should go to `/role`
- [ ] Login with procurement role → should go to `/role`
- [ ] Try accessing `/create-project` with non-null role → should redirect to `/role`
- [ ] **Try accessing `/create-project` as owner → should redirect to `/owner`** ⚠️
- [ ] **Try accessing `/role` as owner → should redirect to `/owner`** ⚠️
- [ ] Owner can access specific role dashboards (legal, management, procurement) via switcher
- [ ] Role users (legal/management/procurement) can access `/role` but not `/owner`
