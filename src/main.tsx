import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'

// Auth
import Login from './routes/auth/Login'
import Signup from './routes/auth/Signup'
import OAuthCallback from './routes/auth/Callback'
import SelectRole from './routes/auth/SelectRole'

// Null Layout for new users
import NullLayout from './routes/null/layout'
import NullDashboard from './routes/null/Dashboard'
import Create from './routes/null/Create'

// Owner
import OwnerLayout from './routes/owner/layout'

// Procurement
import ProcurementLayout from './routes/procurement/Layout'
import ProcurementDashboard from './routes/procurement/Dashboard'
import DraftContract from './routes/procurement/Draft'
import UploadContract from './routes/procurement/Upload'
import StatusTracking from './routes/procurement/Status'
import ProcurementContractDetail from './routes/procurement/ContractDetail'

// Legal
import LegalLayout from './routes/legal/Layout'
import LegalDashboard from './routes/legal/Dashboard'
import LegalInbox from './routes/legal/Inbox'
import LegalRiskCenter from './routes/legal/RiskCenter'
import ContractDetail from './routes/legal/ContractDetail'

// Management
import {
  Layout as ManagementLayout,
  KPIMonitoring,
  RiskHeatmap,
  LifecycleTimeline,
  Reports,
  Settings as ManagementSettings
} from './routes/management'
import ManagementContractDetail from './routes/management/ContractDetail'
import { LandingPage } from './routes/common/LandingPage'
import { TeamOwner } from './routes/owner/TeamOwner'
import { DashboardOwner } from './routes/owner/DashboardOwner'
import { BillingOwner } from './routes/owner/BillingOwner'
import { SettingOwner } from './routes/owner/SettingOwner'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/signup', element: <Signup /> },
  { path: '/auth/select-role', element: <SelectRole /> },
  { path: '/auth/callback', element: <OAuthCallback /> },
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
  },
  {
    path: '/owner',
    element: (
      <ProtectedRoute allow={['owner']}>
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOwner /> },
      { path: 'team', element: <TeamOwner /> },
      { path: 'billing', element: <BillingOwner /> },
      { path: 'settings', element: <SettingOwner /> },
    ],
  },
  {
    path: '/procurement',
    element: (
      <ProtectedRoute allow={['procurement']}>
        <ProcurementLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ProcurementDashboard /> },
      { path: 'draft', element: <DraftContract /> },
      { path: 'upload', element: <UploadContract /> },
      { path: 'status', element: <StatusTracking /> },
      { path: 'contracts/:id', element: <ProcurementContractDetail /> },
    ],
  },
  {
    path: '/legal',
    element: (
      <ProtectedRoute allow={['legal']}>
        <LegalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LegalDashboard /> },
      { path: 'inbox', element: <LegalInbox /> },
      { path: 'risk-center', element: <LegalRiskCenter /> },
      { path: 'contracts/:id', element: <ContractDetail /> },
    ],
  },
  {
    path: '/management',
    element: (
      <ProtectedRoute allow={['management']}>
        <ManagementLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <KPIMonitoring /> },
      { path: 'kpi', element: <KPIMonitoring /> },
      { path: 'risk-heatmap', element: <RiskHeatmap /> },
      { path: 'lifecycle', element: <LifecycleTimeline /> },
      { path: 'reports', element: <Reports /> },
      { path: 'contracts/:id', element: <ManagementContractDetail /> },
      { path: 'settings', element: <ManagementSettings /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)