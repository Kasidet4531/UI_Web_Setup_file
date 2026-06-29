# Plan: PSF Setup File Web Application

## Context

The user wants to build a frontend prototype of a PSF (Probe Station File) Setup File Request Management system based on the detailed spec in `src/imports/psf_setup_file_web_application_spec_en.md`. The app manages a multi-role workflow (Requester → Setup File Owner [GNTC/MFG] → Admin) with dynamic forms, role-based visibility, search, audit history, and Excel export. No real backend exists — this will use mock data and simulated state. The project already has an empty `src/app/App.tsx`, React Router v7, shadcn-style Radix UI components in `src/app/components/ui/`, and a full Tailwind v4 design token system.

---

## Architecture

- **Routing**: React Router v7 with `<BrowserRouter>` + `<Routes>` in App.tsx
- **State**: React `useState`/`useContext` for auth/role simulation, local mock data store
- **No backend**: All API calls return mock data; status transitions mutate local state
- **UI components**: Use existing `src/app/components/ui/` (Button, Input, Select, Badge, Card, Table, Dialog, Tabs, etc.) — do NOT create custom versions

---

## Pages & Routes

| Route | Component File | Description |
|---|---|---|
| `/login` | `pages/LoginPage.tsx` | Auth form, role selector (mock login) |
| `/dashboard` | `pages/DashboardPage.tsx` | Summary cards + request table + search |
| `/requests/new` | `pages/RequestFormPage.tsx` | Create new PSF request |
| `/requests/:id` | `pages/RequestDetailPage.tsx` | View/edit request detail, status transitions |
| `/requests/:id/history` | `pages/RequestHistoryPage.tsx` | Field-level audit log timeline |
| `/history` | `pages/GlobalHistoryPage.tsx` | Global audit log (filtered) |
| `/admin` | `pages/admin/AdminPage.tsx` | Admin landing with sub-nav |
| `/admin/users` | `pages/admin/UsersPage.tsx` | User role management |
| `/admin/form-config` | `pages/admin/FormConfigPage.tsx` | JSON schema editor + live preview |
| `/admin/workflow` | `pages/admin/WorkflowPage.tsx` | Status transition config |
| `/admin/autofill` | `pages/admin/AutofillPage.tsx` | Auto-fill rules |
| `/admin/export-profile` | `pages/admin/ExportProfilePage.tsx` | Export column config |

---

## Mock Data & State

Create `src/app/mock/` directory with:
- `mockUsers.ts` — users with roles (Requester, Setup File Owner GNTC, Setup File Owner MFG, Admin)
- `mockRequests.ts` — 8–10 PSF requests at various workflow statuses
- `mockAuditLogs.ts` — field-level audit entries
- `mockFormSchema.ts` — dynamic form schema JSON (v1)

Create `src/app/context/AppContext.tsx` — provides:
- `currentUser` (role, name, department)
- `requests` list + CRUD operations
- `auditLogs`

---

## Key UI Components to Create

| File | Purpose |
|---|---|
| `components/layout/AppLayout.tsx` | Side nav + header shell (Dashboard, PSF Requests, History, Admin) |
| `components/layout/NavSidebar.tsx` | Left nav with role-filtered links |
| `components/requests/RequesterInfoSection.tsx` | Section 1 of the form (read-only after submit) |
| `components/requests/PSFCreatedSection.tsx` | Section 2 — hidden/placeholder for Requester until PSF Created status |
| `components/requests/StatusBadge.tsx` | Color-coded status pill |
| `components/requests/StatusDropdown.tsx` | Manual status transition control (visible to all roles) |
| `components/requests/AutofillBadge.tsx` | "Auto-filled" badge + source note |
| `components/dashboard/SummaryCards.tsx` | Total/Waiting/InProgress/Created/Completed/Overdue cards |
| `components/dashboard/RequestsTable.tsx` | Table with columns per spec, sortable |
| `components/history/AuditTimeline.tsx` | Timeline or table of field-level changes |
| `components/admin/JsonSchemaEditor.tsx` | Monaco-style textarea + live form preview |

---

## Workflow & Visibility Rules

### Status Flow
`Draft → Submitted → Setup In Progress → PSF Created → Completed`

Optional: `Need More Information`, `Rejected`, `Cancelled`

### PSF Created Section Visibility
- Requester: **hidden** (shows placeholder text) when status is Draft/Submitted/Setup In Progress/Need More Info/Rejected/Cancelled
- Requester: **visible read-only** when status is PSF Created or Completed
- Setup File Owner / Admin: always visible and editable

### Status Dropdown
Shown to ALL roles on the request detail page in ALL statuses. Transitions update local mock state and append an audit log entry.

---

## Implementation Steps

1. **Setup routing** — Wire React Router v7 in `App.tsx` with `<BrowserRouter>` + `<Routes>`, redirect `/` → `/login`
2. **Create mock data & context** — `mockUsers`, `mockRequests`, `mockAuditLogs`, `mockFormSchema`, `AppContext`
3. **AppLayout + NavSidebar** — Persistent shell; nav items filtered by role
4. **LoginPage** — Username/password mock form + role picker (dropdown showing test users); sets `currentUser` in context
5. **DashboardPage** — SummaryCards + RequestsTable + search bar (filters mock data by title/status/etc.)
6. **RequestFormPage (new)** — Product Type radio buttons at top, RequesterInfoSection with all fields, auto-fill simulation
7. **RequestDetailPage** — Renders both sections; PSFCreatedSection conditionally visible; StatusDropdown; history link
8. **RequestHistoryPage / GlobalHistoryPage** — AuditTimeline with filter controls
9. **Admin pages** — Users table (role edit), FormConfig (JSON editor + preview), Workflow config, Autofill rules list, Export profile column reorder

---

## File Creation Order

1. `src/app/mock/` files (data layer)
2. `src/app/context/AppContext.tsx`
3. `src/app/components/layout/` (AppLayout, NavSidebar)
4. `src/app/components/requests/` (StatusBadge, StatusDropdown, RequesterInfoSection, PSFCreatedSection, AutofillBadge)
5. `src/app/components/dashboard/` (SummaryCards, RequestsTable)
6. `src/app/components/history/AuditTimeline.tsx`
7. `src/app/pages/` (all page files)
8. `src/app/App.tsx` — wire routes

---

## Verification

After implementation:
- Log in as each role (Requester, Setup File Owner GNTC, Admin) and verify nav/access differences
- Create a new request as Requester → verify PSF Created section shows placeholder
- Change status to "PSF Created" as Setup File Owner → verify section becomes visible to Requester
- Verify status dropdown is visible to all roles in all statuses
- Check audit timeline updates on status changes
- Confirm dashboard search filters work
