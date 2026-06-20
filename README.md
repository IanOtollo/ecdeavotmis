# ECDEAVOTMIS

**Education & Vocational Training Management Information System**
Busia County Government — Department of Education

Live: [https://ecdeavotmis.vercel.app](https://ecdeavotmis.vercel.app)

---

## Overview

ECDEAVOTMIS is a county-wide digital management platform for Early Childhood Development Education (ECDE) centres and Vocational Training (VT) institutions in Busia County, Kenya. It provides a single source of truth for learner enrolment, institution data, teaching staff, infrastructure, financial records, and emergency reporting — accessible to all authorised county education personnel.

---

## Features

### County Administration
- County-level dashboard with live KPIs: total institutions, active learners (ECDE vs VT), teaching staff, open emergencies
- Charts: learners per institution, institutions by type, monthly admissions, emergency status breakdown
- Full institution registry — register, view, search, and manage all ECDE and VT institutions county-wide
- Global search: find any learner or institution by name, UPI, or code from the top navbar
- User management: create accounts, assign roles, suspend/activate users, reset passwords
- Audit log: full trail of all system actions
- Admission and UPI reports with CSV export

### Institution Management
- Per-institution dashboard with operational action cards
- Institution profile: bio-data, location, registration details, nearest facilities
- Custom institution logo upload (replaces Busia County emblem in sidebar)
- Infrastructure records: buildings, equipment, utilities, ownership
- Teaching staff registry with TSC numbers, qualifications, employment type
- Bank account management with signatories
- Capitation receipts: disbursement tracking, reconciliation status
- School books inventory with CBC curriculum alignment

### Learner Management
- Capture ECDE learners (PP1/PP2) and Vocational Training learners on separate forms
- Auto-generated Unique Pupil Identifier (UPI) per institution
- Full learner profile: personal details, parent/guardian contacts, health information, previous education
- Learner status lifecycle: active, transferred, released, deceased
- Deceased learner register with cause of death and date
- Transfer and release workflow
- Learner detail page with full profile view

### Reports & Exports
- Admission Report — filtered by status, exportable to CSV
- UPI Register — full list of issued UPIs with all details
- My Learners — institution-specific learner list with CSV export
- Institution Statistics — gender breakdown, disability count, class/year distribution

### Security & Access Control

| Role | Access |
|---|---|
| `super_admin` | Full county-wide access, user management, audit log |
| `institution_admin` | Full access to their institution, reports, staff, finances |
| `teacher` | Learner capture and view within their institution |
| `data_clerk` | Learner capture and view within their institution |

- No public sign-up — accounts created by the County Administrator only
- Password reset by County Administrator via secure backend action
- All mutations require authenticated session
- Role enforced server-side on every Convex query and mutation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Backend | Convex (serverless, real-time) |
| Auth | @convex-dev/auth (password provider) |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Project Structure

```
ecdeavotmis/
├── convex/                       # Serverless backend
│   ├── schema.ts                 # All database tables and indexes
│   ├── auth.ts                   # Auth configuration
│   ├── users.ts                  # User CRUD, roles, password reset
│   ├── institutions.ts           # Institution CRUD, logo upload
│   ├── learners.ts               # Learner capture, UPI generation
│   ├── teachers.ts               # Teaching staff
│   ├── infrastructure.ts         # Infrastructure records
│   ├── bankAccounts.ts           # Bank accounts
│   ├── capitationReceipts.ts     # Capitation disbursements
│   ├── books.ts                  # Books inventory
│   ├── emergencies.ts            # Emergency incident reports
│   ├── dashboard.ts              # Aggregated KPI queries
│   ├── auditLogs.ts              # Audit trail
│   └── seed.ts                   # Super admin seed script
│
├── src/
│   ├── pages/
│   │   ├── Auth.tsx              # Login page
│   │   ├── Dashboard.tsx         # County + institution dashboards
│   │   ├── Institutions.tsx      # Institution list (admin)
│   │   ├── InstitutionDetail.tsx
│   │   ├── InstitutionBioData.tsx
│   │   ├── InstitutionStatistics.tsx
│   │   ├── MyInstitution.tsx     # Institution profile + logo upload
│   │   ├── CaptureLearners.tsx   # ECDE and VT enrolment form
│   │   ├── LearnerDetail.tsx
│   │   ├── MyLearners.tsx
│   │   ├── ViewLearners.tsx
│   │   ├── SearchLearners.tsx
│   │   ├── TransferLearners.tsx
│   │   ├── DeceasedLearner.tsx
│   │   ├── Teachers.tsx
│   │   ├── Infrastructure.tsx
│   │   ├── BankAccount.tsx
│   │   ├── CapitationReceipts.tsx
│   │   ├── SchoolBooks.tsx
│   │   ├── EmergencyReporting.tsx
│   │   ├── AdmissionReport.tsx
│   │   ├── UPIReport.tsx
│   │   └── admin/
│   │       ├── Users.tsx         # User management (super_admin only)
│   │       └── AuditLog.tsx
│   │
│   ├── components/
│   │   ├── AppSidebar.tsx        # Role-aware sidebar navigation
│   │   ├── Header.tsx            # Global search + user menu
│   │   ├── ProtectedRoute.tsx    # Auth guard with skeleton loader
│   │   └── ui/                   # shadcn/ui primitives
│   │
│   ├── hooks/
│   │   ├── useCurrentUser.ts
│   │   └── useStorageUrl.ts
│   │
│   └── index.css                 # Design tokens + Tailwind base
│
├── public/
│   └── busia-county-logo.png
├── index.html                    # Meta tags, OG tags, favicon
└── vercel.json                   # SPA routing config
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A Convex account at [convex.dev](https://convex.dev)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/IanOtollo/ecdeavotmis.git
cd ecdeavotmis

# 2. Install dependencies
npm install

# 3. Create your environment file
echo "VITE_CONVEX_URL=your_convex_url_here" > .env.local

# 4. Start the Convex backend (separate terminal)
npx convex dev

# 5. Seed the initial super admin
npx convex run seed:seedSuperAdmin

# 6. Start the frontend
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_CONVEX_URL` | Convex deployment URL — from the Convex dashboard |

Never commit `.env.local`.

---

## Deployment

Hosted on **Vercel** — auto-deploys on every push to `main`.

The Convex backend runs on **Convex Cloud (EU West 1)**, independent of Vercel.

### Required Vercel Environment Variables

Go to Vercel → Project → Settings → Environment Variables and add:

| Variable | Value |
|---|---|
| `VITE_CONVEX_URL` | Your Convex deployment URL |

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | System accounts with roles and institution assignment |
| `institutions` | ECDE centres and VT institutions |
| `learners` | Learner records with UPI, enrolment, health, guardian data |
| `teachers` | Teaching staff per institution |
| `infrastructure` | Buildings and equipment inventory |
| `bankAccounts` | Institution bank accounts and signatories |
| `capitationReceipts` | Government disbursement records |
| `books` | Library and textbook inventory |
| `emergencies` | Incident reports with status tracking |
| `auditLogs` | Full action audit trail |
| `counters` | Per-institution UPI sequence counters |

---

## Author

**Ian Otollo** — Busia County Government
Repository: [github.com/IanOtollo/ecdeavotmis](https://github.com/IanOtollo/ecdeavotmis)

---

*Authorised personnel only. This system contains confidential county education data.*
