# ECDEAVOTMIS

**Education & Vocational Training Management Information System — Busia County, Kenya**

A production government records system for registering ECDE centres and Vocational Training institutions, enrolling learners with unique identifiers (UPIs), tracking institutional assets, filing emergency reports, and generating county-wide reports — under full role-based access control.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Backend / Database | [Convex](https://convex.dev) (reactive queries, mutations, file storage) |
| Authentication | [Convex Auth](https://labs.convex.dev/auth) — Password provider only |
| UI components | Tailwind CSS + shadcn/Radix |
| Charts | Recharts |
| Forms | react-hook-form + Zod |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` (never commit this):

```env
CONVEX_DEPLOYMENT=dev:your-project-name
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Deploy to Convex

```bash
CONVEX_DEPLOY_KEY=your-full-deploy-key npx convex deploy --cmd "echo done"
```

### 4. Seed the super admin (run once)

```bash
CONVEX_DEPLOY_KEY=your-full-deploy-key npx convex run seed:bootstrapSuperAdmin
```

This creates the county administrator account **idempotently** (safe to run twice). Credentials are printed to the console once:

```
Email:    admin@ecdeavotmis.go.ke
Password: bsa@2026
```

**Rotate the password immediately after first login** via Profile → Change Password.

### 5. Run the dev server

```bash
npm run dev
```

---

## Role model

| Role | Access |
|---|---|
| `super_admin` | Full county-wide access — all institutions, all learners, user management, audit log |
| `institution_admin` | Full CRUD scoped to their assigned institution |
| `teacher` | Capture and view learners at their institution |
| `data_clerk` | Capture and view learners at their institution |

There is **no public sign-up**. All users are created by the super admin via **Administration → Manage Users**.

---

## UPI Format

Every learner receives a permanent Unique Personal Identifier on enrolment:

```
B-{INSTITUTION_CODE}-{SEQUENCE}
Example: B-NEC001-00042
```

UPIs are generated server-side using a serializable Convex transaction — no `Math.random()`, no collisions.

---

## Key features

- ECDE and Vocational Training learner enrolment with photo upload
- Institution registration with auto-generated unique codes
- Infrastructure, bank accounts, capitation receipts, school books tracking
- Emergency incident reporting with status workflow
- Learner transfer (UPI retained), release, and deceased recording
- CSV export on all reports (live data, no mock rows)
- County-wide KPI dashboard with charts
- Full audit log
- Role-based sidebar — each role sees only what they can use

---

## Database

All data lives in Convex (no Supabase, no Postgres). The database ships **empty** — every institution and learner is created through the UI. The only pre-seeded record is the super admin account.
