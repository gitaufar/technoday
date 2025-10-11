# User Flow - OptiMind Contract Management System

## 🎯 Complete User Flow (Simple for Non-IT)

```mermaid
graph TD
    Start[User Opens App] --> Login[Login Page]
    
    Login --> CheckUser{First Time?}
    CheckUser -->|Yes| Signup[Sign Up]
    CheckUser -->|No| Auth[Enter Email & Password]
    
    Signup --> SelectRole[Select Role:<br/>Owner/Legal/Management/Procurement]
    SelectRole --> CreateProfile[Complete Profile]
    CreateProfile --> Dashboard
    
    Auth --> Dashboard{Which Role?}
    
    %% Owner Flow
    Dashboard -->|Owner| OwnerDash[Owner Dashboard]
    OwnerDash --> OwnerMenu{What to do?}
    OwnerMenu -->|View Stats| ViewKPI[View KPIs & Reports]
    OwnerMenu -->|Manage Team| TeamPage[Team Management]
    OwnerMenu -->|Invite Member| InviteForm[Enter Email & Role]
    OwnerMenu -->|Billing| BillingPage[View Invoices & Plans]
    OwnerMenu -->|Settings| CompanySettings[Company Settings]
    
    InviteForm --> SendEmail[Send Invitation Email]
    SendEmail --> EmailSent[✅ Email Sent]
    
    BillingPage --> BillingAction{Action?}
    BillingAction -->|Upgrade Plan| PaymentModal[Enter Payment Details]
    BillingAction -->|View Invoice| DownloadInvoice[Download Invoice PDF]
    PaymentModal --> ProcessPayment[Process Payment]
    ProcessPayment --> InvoiceCreated[✅ Invoice Generated]
    
    %% Legal Flow
    Dashboard -->|Legal| LegalDash[Legal Dashboard]
    LegalDash --> LegalMenu{What to do?}
    LegalMenu -->|Upload Contract| UploadPage[Upload Contract PDF]
    LegalMenu -->|View Contracts| ContractList[List All Contracts]
    LegalMenu -->|Check Risk| RiskCenter[Risk Analysis Center]
    
    UploadPage --> AIProcess[🤖 AI Processing Contract]
    AIProcess --> ExtractData[Extract Key Information]
    ExtractData --> RiskAnalysis[Analyze Legal Risks]
    RiskAnalysis --> ContractDetail[View Contract Details]
    
    ContractList --> SelectContract[Select Contract]
    SelectContract --> ContractDetail
    ContractDetail --> ContractActions{Action?}
    ContractActions -->|Add Notes| WriteNotes[Write Legal Notes]
    ContractActions -->|View AI Analysis| ViewAI[View AI Recommendations]
    ContractActions -->|Check Entities| ViewEntities[View Extracted Parties & Dates]
    
    RiskCenter --> RiskDashboard[View All Risks by Category]
    RiskDashboard --> RiskDetail[View Risk Details & Solutions]
    
    %% Management Flow
    Dashboard -->|Management| MgmtDash[Management Dashboard]
    MgmtDash --> MgmtMenu{What to do?}
    MgmtMenu -->|View KPIs| ViewMetrics[View Contract Metrics]
    MgmtMenu -->|Risk Heatmap| HeatmapView[View Risk Distribution]
    MgmtMenu -->|Lifecycle| LifecycleView[View Contract Timeline]
    MgmtMenu -->|Reports| ReportPage[Generate Reports]
    
    ViewMetrics --> KPICards[Active Contracts, Expired, Values]
    HeatmapView --> RiskVisualization[Visual Risk by Category]
    LifecycleView --> TimelineView[Contract Stages Timeline]
    ReportPage --> ExportReport[Export to PDF/Excel]
    
    %% Procurement Flow
    Dashboard -->|Procurement| ProcureDash[Procurement Dashboard]
    ProcureDash --> ProcureMenu{What to do?}
    ProcureMenu -->|Vendor Contracts| VendorList[View Vendor Agreements]
    ProcureMenu -->|Purchase Orders| POList[View Purchase Orders]
    ProcureMenu -->|Track Budget| BudgetView[View Budget vs Actual]
    
    VendorList --> VendorDetail[View Vendor Contract Details]
    POList --> PODetail[View PO Details]
    BudgetView --> BudgetAlert[Check Over/Under Budget]
    
    %% Common Actions
    ViewKPI --> Logout{Continue or Logout?}
    EmailSent --> Logout
    InvoiceCreated --> Logout
    WriteNotes --> Logout
    ViewAI --> Logout
    ViewEntities --> Logout
    RiskDetail --> Logout
    ExportReport --> Logout
    VendorDetail --> Logout
    PODetail --> Logout
    BudgetAlert --> Logout
    TeamPage --> Logout
    CompanySettings --> Logout
    
    Logout -->|Logout| Login
    Logout -->|Continue| Dashboard
    
    style Start fill:#e1f5fe
    style Login fill:#fff3e0
    style Dashboard fill:#f3e5f5
    style OwnerDash fill:#e8f5e9
    style LegalDash fill:#fff9c4
    style MgmtDash fill:#fce4ec
    style ProcureDash fill:#e0f2f1
    style AIProcess fill:#ffccbc
    style SendEmail fill:#c8e6c9
    style ProcessPayment fill:#b2dfdb
```

## 📱 Simplified Flow for Non-Technical Users

```mermaid
graph LR
    A[🚀 Start] --> B[🔐 Login]
    B --> C{Choose Role}
    
    C -->|👔 Owner| D[📊 Dashboard<br/>View Company Stats]
    C -->|⚖️ Legal| E[📄 Contracts<br/>Upload & Review]
    C -->|📈 Management| F[📉 Reports<br/>View Metrics]
    C -->|🛒 Procurement| G[💼 Vendors<br/>Track Purchases]
    
    D --> D1[Invite Team]
    D --> D2[Billing & Plans]
    D --> D3[Company Settings]
    
    E --> E1[Upload Contract]
    E --> E2[AI Analysis]
    E --> E3[Risk Assessment]
    
    F --> F1[View KPIs]
    F --> F2[Risk Heatmap]
    F --> F3[Generate Reports]
    
    G --> G1[Vendor Contracts]
    G --> G2[Purchase Orders]
    G --> G3[Budget Tracking]
    
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
    style F fill:#00BCD4,color:#fff
    style G fill:#FF5722,color:#fff
```

## 🔄 Invitation Flow (Simple)

```mermaid
sequenceDiagram
    participant Owner
    participant System
    participant Email
    participant NewUser
    
    Owner->>System: Click "Invite Member"
    Owner->>System: Enter email & select role
    System->>Email: Send invitation email
    Email->>NewUser: Deliver invitation
    NewUser->>Email: Click "Accept Invitation"
    NewUser->>System: Complete signup form
    System->>NewUser: Login automatically
    NewUser->>System: Access dashboard
    System->>Owner: Show new member in team list
```

## 💳 Billing/Upgrade Flow (Simple)

```mermaid
sequenceDiagram
    participant Owner
    participant Dashboard
    participant Payment
    participant System
    
    Owner->>Dashboard: Click "Upgrade Plan"
    Dashboard->>Payment: Show payment form
    Owner->>Payment: Enter card details
    Payment->>System: Process payment
    System->>System: Update subscription
    System->>System: Generate invoice
    System->>Dashboard: Refresh with new plan
    Dashboard->>Owner: Show success message
```

## 📄 Contract Upload Flow (Simple)

```mermaid
sequenceDiagram
    participant Legal
    participant Upload
    participant AI
    participant Dashboard
    
    Legal->>Upload: Click "Upload Contract"
    Legal->>Upload: Select PDF file
    Upload->>AI: Send PDF for processing
    AI->>AI: Extract parties, dates, values
    AI->>AI: Analyze legal risks
    AI->>AI: Generate recommendations
    AI->>Dashboard: Show contract details
    Dashboard->>Legal: Display results
    Legal->>Dashboard: Add notes (optional)
```

## 📊 Management View Flow (Simple)

```mermaid
graph TD
    A[Management Login] --> B[Dashboard]
    B --> C{Select View}
    
    C --> D[📊 KPI Cards]
    C --> E[🗺️ Risk Heatmap]
    C --> F[📈 Lifecycle Timeline]
    C --> G[📄 Reports]
    
    D --> D1[Active Contracts: 45]
    D --> D2[Total Value: Rp 2.5M]
    D --> D3[Expired Soon: 3]
    
    E --> E1[Financial Risk: High]
    E --> E2[Legal Risk: Medium]
    E --> E3[Operational Risk: Low]
    
    F --> F1[Draft → Review → Active]
    F --> F2[Active → Expiring → Expired]
    
    G --> G1[Export to PDF]
    G --> G2[Export to Excel]
    
    style A fill:#2196F3,color:#fff
    style B fill:#4CAF50,color:#fff
    style D fill:#FF9800,color:#fff
    style E fill:#F44336,color:#fff
    style F fill:#9C27B0,color:#fff
    style G fill:#00BCD4,color:#fff
```

## 🎯 Key User Journeys Summary

### 1️⃣ **Owner Journey**
```
Login → Dashboard → Invite Team → Manage Billing → View Reports → Logout
```

### 2️⃣ **Legal Journey**
```
Login → Dashboard → Upload Contract → AI Analysis → Review Risks → Add Notes → Logout
```

### 3️⃣ **Management Journey**
```
Login → Dashboard → View KPIs → Check Heatmap → Generate Report → Export → Logout
```

### 4️⃣ **Procurement Journey**
```
Login → Dashboard → View Vendors → Check Purchase Orders → Track Budget → Logout
```

## 📲 Mobile-Friendly Flow

```mermaid
graph TD
    Mobile[📱 Open on Mobile] --> MobileLogin[🔐 Login]
    MobileLogin --> MobileRole{Role?}
    
    MobileRole -->|Owner| MO[Owner Menu]
    MobileRole -->|Legal| ML[Legal Menu]
    MobileRole -->|Management| MM[Management Menu]
    
    MO --> MO1[👥 Team]
    MO --> MO2[💳 Billing]
    MO --> MO3[⚙️ Settings]
    
    ML --> ML1[📤 Upload]
    ML --> ML2[📋 Contracts]
    ML --> ML3[⚠️ Risks]
    
    MM --> MM1[📊 Stats]
    MM --> MM2[📈 Reports]
    MM --> MM3[🗺️ Heatmap]
    
    style Mobile fill:#4CAF50,color:#fff
    style MobileLogin fill:#2196F3,color:#fff
    style MO fill:#9C27B0,color:#fff
    style ML fill:#F44336,color:#fff
    style MM fill:#FF9800,color:#fff
```

---

## 📝 How to Use These Diagrams:

1. **Copy mermaid code** (inside ``` mermaid blocks)
2. **Paste to**:
   - GitHub Markdown (renders automatically)
   - [Mermaid Live Editor](https://mermaid.live)
   - Notion (supports mermaid)
   - VS Code (with Mermaid extension)

## 🎨 Legend:

- 🟢 **Green** = Owner/Admin functions
- 🔴 **Red** = Legal team functions
- 🔵 **Blue** = Management functions
- 🟠 **Orange** = Procurement functions
- 🟣 **Purple** = Shared/Common functions

---

**Created**: October 8, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready to Present
