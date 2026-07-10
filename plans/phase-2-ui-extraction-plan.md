# Phase 2 UI Extraction Plan

> Branch: `ui-clarify-phase-2`  
> Source UI repo: `kasidetnxp/UI_Web_Setup_file`  
> Target implementation repo: `Kasidet4531/Web-Request-setup-file`

## Goal

Clarify which parts of the `UI_Web_Setup_file` prototype should inform Phase 2 of the main PSF Setup File Web Application, without copying the prototype wholesale into the production codebase.

The output of this plan should become the reviewable source for later implementation work in the main repo.

---

## Source-of-truth hierarchy

Use sources in this order:

1. **Main repo specification**: `Web-Request-setup-file/psf_setup_file_web_application_spec_en.md`
2. **Domain language**: `Web-Request-setup-file/CONTEXT.md`
3. **Architecture decisions**: `Web-Request-setup-file/docs/adr/*.md`
4. **Current main repo frontend/backend code**: actual implementation constraints
5. **UI prototype repo**: visual reference and component inventory only

Important implication:

> If the UI prototype conflicts with the main repo spec/ADR/domain language, the main repo wins.

---

## Current reality

### Main repo already has

- TanStack Router route structure.
- Production-style local login using backend session cookie.
- `GET /api/me`-style current-user flow through the frontend API client.
- Dynamic form rendering through backend active form schema.
- Request creation / saved draft / requester-data update / submit flow scaffolding.
- Placeholder routes for Dashboard, PSF Requests, History, and Admin.

Relevant main repo files:

- `frontend/src/routes/login/-LoginPage.tsx`
- `frontend/src/routes/dashboard/index.tsx`
- `frontend/src/routes/requests/index.tsx`
- `frontend/src/routes/requests/new.tsx`
- `frontend/src/routes/requests/$requestId/index.tsx`
- `frontend/src/components/ActiveSchemaForm.tsx`
- `frontend/src/components/RequestDraftDetailPage.tsx`
- `frontend/src/services/api.ts`

### UI prototype provides

- Visual layout references for Dashboard, PSF Requests, Request Detail, History, Admin, and Export.
- Mock role behavior for requester / setup owner / admin.
- Summary card, table, status badge, detail page, and admin page concepts.
- Mock state and custom router that should **not** be ported as production architecture.

Relevant UI prototype files:

- `src/app/pages/DashboardPage.tsx`
- `src/app/pages/RequestsListPage.tsx`
- `src/app/pages/RequestDetailPage.tsx`
- `src/app/pages/RequestFormPage.tsx`
- `src/app/pages/LoginPage.tsx`
- `src/app/components/dashboard/SummaryCards.tsx`
- `src/app/components/dashboard/RequestsTable.tsx`
- `src/app/components/requests/StatusBadge.tsx`
- `src/app/context/AppContext.tsx`

---

## Phase 2 MVP screen decisions

| Screen | Phase 2 decision | Notes |
|---|---|---|
| Login | Keep main repo implementation; do not port prototype auth | Main repo already uses backend session cookie and seeded MVP accounts. Prototype quick-login can inspire demo UX only. |
| Dashboard | Implement / redesign as focused operational queue | Must answer: “what needs attention now?” not “show every possible field.” |
| PSF Requests | Implement as all-request browsing/search page | Separate from Dashboard to avoid duplicate table behavior. |
| New Request Form | Keep main repo dynamic schema renderer | Product Type remains top/required per spec. Prototype can inform copy/layout only. |
| Request Detail | Implement workflow-first shell around existing form renderer | Header summary + status + role-specific actions + sections. |
| Request History | Keep request-specific history and keep Global History in navigation for Phase 2 | Request detail should link to request-specific history; global History remains visible rather than hidden. Full Global History functionality can be split into a Phase 2 follow-up issue. |
| Admin pages | Defer broad admin implementation | Keep placeholders or minimal routes. Do not pull full prototype admin scope into Phase 2. |
| Export | Show export entry points in Phase 2 | Keep the Export button/route visible. Full export wiring can be split into a Phase 2 follow-up issue rather than blocking core dashboard/list/detail implementation. |

---

## Role-based UI behavior

Grounding: main spec section 8 and ADR `0010-shared-setup-queue-visibility.md`.

### Requester

- Dashboard shows own requests only.
- Can create a request.
- Can edit requester information before submit.
- After submit, requester information becomes read-only.
- Cannot see PSF Created Information until status is `PSF Created` or `Completed`.
- Can view related request history.
- Can use the manual status dropdown in Phase 2; backend authorization/transition validation remains the source of truth.

### Setup File Owner

- Uses a **shared queue model**, not individual pre-assignment.
- Dashboard can see all requests across **all statuses**.
- The UI may highlight pending/actionable statuses with cards or quick filters, but it must not hide completed/rejected/cancelled requests from Setup File Owners by default.
- Can edit PSF Created Information.
- Can update statuses manually according to configured workflow.
- When acting on a request, backend records setup owner identity and department (`GNTC` or `MFG`).

### Admin

- Can see all requests.
- Can override/edit if permitted by backend.
- Admin configuration screens are Phase-later unless the corresponding backend scope is already ready.

---

## Dashboard extraction target

### Purpose

Dashboard should become an operational queue, not a full data explorer.

It should answer:

1. What requires attention now?
2. Which requests are waiting / overdue / in progress?
3. What is the next action?

### Summary cards

Product decision: start with **4 primary cards** in Phase 2:

| Card | Requester | Setup Owner | Admin |
|---|---|---|---|
| My Open Requests | Yes | Optional | Optional |
| Waiting for Setup | No | Yes | Yes |
| Setup In Progress | Yes, own related | Yes | Yes |
| Overdue | Yes, own related | Yes | Yes |

Avoid showing all 6 prototype cards on the first iteration because that made the prototype feel noisy. Additional counts can move to the Requests page, secondary filters, or a later dashboard iteration.

For Setup File Owners, the queue table should still include all request statuses; the cards are shortcuts/highlights, not visibility limits.

### Dashboard queue table default columns

Product decision: approve the default MVP dashboard table columns below.

Default MVP columns:

| Column | Reason |
|---|---|
| Request No. | Stable identifier |
| Title / Product Type | Human understanding of the request |
| Status | Workflow state |
| Priority | Triage |
| Due Date | Urgency |
| Owner / Dept | Responsibility, where applicable |
| Action | Open detail / continue / review |

Columns to hide from default dashboard view:

- Reference PSF Name
- Probecard Name
- PSF Setup File Name
- Requester
- Separate Setup Owner and Dept columns unless needed by role

These fields still belong in:

- Request detail page
- Requests search page
- Export
- optional expanded row later

---

## PSF Requests page extraction target

### Purpose

PSF Requests is the full browsing/search page.

It should answer:

1. Find a request by keyword/status/date/product.
2. Review historical and current requests.
3. Open a request detail page.

### Difference from Dashboard

| Dashboard | PSF Requests |
|---|---|
| Focused queue | Full searchable list |
| Minimal columns | More columns allowed |
| Role-default filters | User-driven filters |
| Next action oriented | Data lookup oriented |

### Filters

MVP filters should map to indexed/searchable fields from the main spec:

- keyword
- status
- product type
- due date range or overdue toggle
- setup owner department (`GNTC` / `MFG`) if useful

Defer advanced filter sets until backend search API is stable.

---

## Request Detail extraction target

### Purpose

Request Detail should be workflow-first, not just a long form.

### Recommended layout

1. Header summary
   - Request No.
   - Title
   - Product Type
   - Status badge
   - Priority
   - Due Date
   - Requester
   - Setup Owner / Dept when available
2. Primary actions
   - Save Draft
   - Submit Request
   - Start Setup
   - Request More Information
   - Mark PSF Created
   - Complete
   - Manual status dropdown for all roles in Phase 2, with backend validation
3. Requester Information section
   - editable only while allowed
4. PSF Created Information section
   - visible/editable according to role/status rules
   - placeholder for requester before visibility opens
5. Activity / History
   - request-specific timeline or link to `/requests/$requestId/history`

### Main repo integration

Do **not** replace `ActiveSchemaForm` blindly. Instead:

- Keep dynamic schema rendering as the form engine.
- Wrap it with a better detail page shell.
- Add role/status-aware action controls around the existing form renderer.

---

## Login decision

The main repo spec requires real login/session behavior:

- backend-authenticated identity
- HTTP-only secure cookie
- current user profile from `/api/me`
- no sensitive auth tokens in `localStorage`

The main repo already implements this direction. Therefore:

- Keep main repo login as production base.
- Do not port prototype mock quick-login as production auth.
- Prototype quick-login may inspire a dev-only seeded-account helper, but only if clearly marked as MVP/demo/testing.

---

## Component reuse / rewrite matrix

| Prototype item | Decision | Reason |
|---|---|---|
| `StatusBadge` | Reuse prototype visual concept / rewrite in main repo style | Useful and low-risk. |
| `SummaryCards` | Reuse prototype visual concept / simplify to 4 cards | Good dashboard pattern, but reduce count/noise. |
| `RequestsTable` | Rewrite as role-aware queue/list components using prototype styling where readable | Prototype table is too dense and mock-data-bound. |
| `DashboardPage` | Use prototype as visual starting point, then simplify hard-to-read parts | Must support all-status setup-owner visibility and clearer next actions. |
| `RequestsListPage` | Use prototype as visual starting point, then make API-backed | Needs clearer distinction from Dashboard. |
| `RequestDetailPage` | Use prototype layout ideas and workflow affordances | Main repo must preserve dynamic schema and backend-backed request state. |
| `RequestFormPage` | Use copy/layout ideas only | Main repo already has backend schema-driven create form. |
| `LoginPage` | Do not port | Main repo auth is closer to spec. |
| `AdminLayout` / admin pages | Defer | Too broad for Phase 2 MVP. |
| `AppContext` mock state | Do not port | Production state must use API/client/cache patterns. |
| Custom state router in `App.tsx` | Do not port | Main repo uses TanStack Router. |

---

## API mapping

### Existing main repo API client support

From `frontend/src/services/api.ts`:

- `GET /api/me`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/forms/{formKey}/schema`
- `POST /api/requests`
- `GET /api/requests/{requestId}`
- `PUT /api/requests/{requestId}/requester-data`
- `POST /api/requests/{requestId}/submit`

### Needed for Phase 2 dashboard/list/detail

Check or implement in main repo before UI wiring:

- `GET /api/requests?keyword=&status=&priority=&from=&to=`
- `GET /api/dashboard/summary`
- `POST /api/requests/{requestId}/start-setup`
- `PUT /api/requests/{requestId}/psf-created`
- `POST /api/requests/{requestId}/mark-psf-created`
- `POST /api/requests/{requestId}/complete`
- `GET /api/requests/{requestId}/history`
- `GET /api/audit-logs?requestId=&user=&actionType=&from=&to=` for visible Global History route; can be a follow-up Phase 2 issue
- `GET /api/requests/export.xlsx?status=&from=&to=` for visible Export button/route; can be a follow-up Phase 2 issue

Defer unless needed immediately:

- admin configuration APIs

---

## Clarification tasks before implementation

### Task 1: Approve screen scope

Confirm Phase 2 includes:

- Dashboard focused queue
- PSF Requests list/search
- Request Detail shell/actions
- New Request form polish only if needed
- Global History navigation/page remains visible
- Export entry point remains visible
- Manual status dropdown is available from Phase 2

Confirm Phase 2 defers:

- full Admin UI
- production redesign of Login beyond existing main repo page

### Task 2: Approve dashboard defaults by role

Define default dashboard filters:

- Requester: own active/open requests
- Setup Owner: shared queue with **all request statuses visible by default**; use cards/filters to highlight actionable statuses, not to hide other statuses
- Admin: all requests or summary overview with queue filter

### Task 3: Approve table columns

Approve MVP default dashboard columns:

- Request No.
- Title / Product Type
- Status
- Priority
- Due Date
- Owner / Dept
- Action

Approve richer columns for PSF Requests page if needed.

### Task 4: Approve detail page actions

For each status, confirm which primary action should be visible:

| Status | Primary action candidate |
|---|---|
| Draft | Save Draft / Submit |
| Submitted | Start Setup |
| Setup In Progress | Save PSF Info / Mark PSF Created |
| PSF Created | Complete / Request correction |
| Need More Information | Submit updated info |
| Rejected / Cancelled | Usually no primary action or reopen if allowed |

### Task 5: Approve component migration rule

Recommended rule:

> Use prototype visual direction as the starting point, but rewrite code for the main repo architecture. Keep prototype-inspired UI only when it improves clarity; simplify or replace dense/hard-to-read parts.

---

## Implementation sequence after this plan is approved

Implementation should happen in the main repo, not in this UI prototype branch.

Suggested order:

1. Add request list/dashboard API support if missing.
2. Add typed API client methods in `frontend/src/services/api.ts`.
3. Replace dashboard placeholder with focused queue layout.
4. Replace PSF Requests placeholder with API-backed searchable list.
5. Upgrade request detail placeholder into workflow-first detail shell.
6. Add role/status-aware actions.
7. Add manual status dropdown behavior for all roles with backend validation.
8. Add request-specific history section/link and keep Global History route in navigation.
9. Show Export entry point.
10. Run frontend tests/build and backend request tests.

Follow-up Phase 2 issues can then wire full functionality for:

- Global History filters/table backed by `GET /api/audit-logs?...`
- Export button/download backed by `GET /api/requests/export.xlsx?...`

Suggested verification commands in main repo:

```bash
cd /opt/data/Web-Request-setup-file
npm --prefix frontend run build
npm --prefix frontend test -- --run
npm --prefix backend test -- requests
```

Adjust exact commands to the main repo package scripts before execution.

---

## Product decisions recorded

| Decision area | Product decision |
|---|---|
| Dashboard cards | Start with 4 primary cards. |
| Setup Owner visibility | Setup Owners should see all request statuses, not only pending/actionable statuses. |
| Dashboard table columns | Approved MVP columns: Request No., Title / Product Type, Status, Priority, Due Date, Owner / Dept, Action. |
| Manual status dropdown | Include from Phase 2; requester/setup owner/admin can use it, with backend validation. |
| Export entry point | Show it in Phase 2 rather than hiding it; full export wiring can be a follow-up Phase 2 issue. |
| Global History | Keep it in navigation in Phase 2; full filters/table can be a follow-up Phase 2 issue. |
| Visual style | Use the prototype as the visual direction, but change parts that are hard to read/use. |

Remaining implementation-level checks:

- Export and Global History use **Option B**: visible in Phase 2 UI, with full wiring split into follow-up Phase 2 issues if needed.

---

## Acceptance criteria for this plan

This plan is ready to implement when:

- [x] Screen scope is approved.
- [x] Dashboard vs PSF Requests responsibility split is approved.
- [x] Role-based dashboard defaults are approved.
- [x] MVP table columns are approved.
- [x] Request Detail action model is approved, including manual status dropdown from Phase 2.
- [x] Deferred screens/features are explicitly listed.
- [ ] Main repo implementation branch can be created from the approved plan.
