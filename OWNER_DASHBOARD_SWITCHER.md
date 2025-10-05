# Owner Dashboard Switcher

## Overview
Menambahkan fitur untuk owner agar bisa berpindah-pindah dashboard (Procurement, Legal, Management) dari menu dropdown profil di kanan atas.

## Implementasi

### Fitur yang Ditambahkan
1. **Menu Dropdown untuk Owner**
   - Muncul hanya jika user adalah owner (`isOwner === true`)
   - Berisi 3 pilihan dashboard: Procurement, Legal, Management
   - Dilengkapi dengan icon untuk setiap dashboard
   - Separator line memisahkan menu dashboard dengan logout

2. **Navigasi Seamless**
   - Klik pada pilihan dashboard akan menutup dropdown dan navigate ke route yang dipilih
   - Menggunakan `useNavigate` dari React Router

## Files Modified

### 1. `src/routes/management/Layout.tsx`
- Import `useNavigate` dari react-router-dom
- Destructure `isOwner` dari `useAuth()`
- Tambah function `handleNavigate` untuk navigasi
- Update dropdown menu dengan conditional render untuk owner

### 2. `src/routes/legal/Layout.tsx`
- Import `useNavigate` dari react-router-dom
- Destructure `isOwner` dari `useAuth()`
- Tambah function `handleNavigate` untuk navigasi
- Update dropdown menu dengan conditional render untuk owner

### 3. `src/routes/procurement/Layout.tsx`
- Import `useNavigate` dari react-router-dom
- Destructure `isOwner` dari `useAuth()`
- Tambah function `handleNavigate` untuk navigasi
- Update dropdown menu dengan conditional render untuk owner

## UI/UX

### Dropdown Menu Structure (untuk Owner)
```
┌─────────────────────────────┐
│ SWITCH DASHBOARD            │
├─────────────────────────────┤
│ 📊 Procurement              │
│ 📈 Legal                    │
│ 📊 Management               │
├─────────────────────────────┤
│ 🚪 Logout                   │
└─────────────────────────────┘
```

### Dropdown Menu Structure (untuk Non-Owner)
```
┌─────────────────────────────┐
│ 🚪 Logout                   │
└─────────────────────────────┘
```

## Icons Used
- **Procurement**: Grid/Dashboard icon (4 squares)
- **Legal**: Line chart icon
- **Management**: Bar chart icon
- **Logout**: Exit door with arrow

## Styling
- Width: `w-56` (224px)
- Menu items: Full width with hover effect (`hover:bg-slate-50`)
- Header: Small, uppercase, gray text
- Separator: 1px gray line (`h-px bg-slate-200`)

## Benefits
1. **Owner Flexibility**: Owner bisa cepat pindah antar dashboard tanpa harus navigate manual
2. **Contextual Menu**: Menu hanya muncul untuk owner, user biasa hanya lihat logout
3. **Consistent UX**: Implementasi sama di semua 3 layout (Procurement, Legal, Management)
4. **Clean UI**: Menu tersembunyi di dropdown, tidak mengganggu layout

## Dependencies
- `useNavigate` from `react-router-dom`
- `isOwner` from `AuthProvider` context
- Existing authentication flow

## Testing Checklist
- [ ] Login sebagai owner
- [ ] Klik profile dropdown di kanan atas
- [ ] Verifikasi menu "SWITCH DASHBOARD" muncul
- [ ] Klik "Procurement" → navigasi ke /procurement
- [ ] Klik "Legal" → navigasi ke /legal
- [ ] Klik "Management" → navigasi ke /management
- [ ] Dropdown tertutup setelah klik salah satu menu
- [ ] Login sebagai non-owner (procurement/legal/management role)
- [ ] Verifikasi hanya menu "Logout" yang muncul
