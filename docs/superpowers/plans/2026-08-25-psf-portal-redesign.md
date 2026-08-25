# PSF Request Portal Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire PSF Request Portal into a modern, clean, high-efficiency enterprise web application with refined Slate Navy theme, visual workflow steppers, interactive KPI dashboard, structured forms with smart auto-fill, and polished data tables.

**Architecture:** Refactor CSS design tokens in `src/styles/theme.css` and `src/styles/globals.css` into a semantic design system. Build reusable UI components (Workflow Stepper, Status Badges, Metric Cards, Breadcrumb Header, App Shell). Modernize all main views (`DashboardPage`, `RequestDetailPage`, `RequestFormPage`, `RequestsListPage`, `GlobalHistoryPage`, `ExportPage`, `LoginPage`, and Admin pages).

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Radix UI primitives, Motion (Framer Motion).

## Global Constraints
- Modern Clean Enterprise visual standard: Deep Slate (`#0F172A`), Tech Blue (`#2563EB`), Crisp Light Background (`#F8FAFC`), Deep Charcoal Dark Mode (`#0B0F19`).
- Accessibility: Contrast ratio $\ge 4.5:1$ for all text in both light and dark mode.
- Icon consistency: Lucide-react SVG icons throughout, no raw emojis as icons.
- Zero broken imports or TypeScript compile errors (`npm run build` must pass cleanly).

---

### Task 1: Design Tokens, Typography & Global Styling

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/styles/globals.css`
- Modify: `index.html` (add Google Font Inter / Plus Jakarta Sans)

**Interfaces:**
- Produces: CSS variables `--background`, `--card`, `--border`, `--primary`, `--accent`, `--status-*`, `--radius`, `--font-sans`, `--font-mono`.

- [ ] **Step 1: Update `index.html` with modern Google Fonts (Inter & JetBrains Mono)**
- [ ] **Step 2: Update `src/styles/theme.css` with Modern Clean Enterprise tokens**
  Define semantic tokens for cards, borders, primary blues, slate neutrals, and status badge color triplets (background, border, text).
- [ ] **Step 3: Update `src/styles/globals.css` with clean base styling, scrollbars, and card utilities**
- [ ] **Step 4: Run Vite build check to verify CSS parsing**
  Run: `npm run build`
  Expected: Build succeeds without CSS syntax errors.
- [ ] **Step 5: Commit changes**
  `git add src/styles/ index.html; git commit -m "style: implement modern enterprise design tokens and typography"`

---

### Task 2: Modern App Shell, Header & Navigation

**Files:**
- Modify: `src/app/components/layout/AppLayout.tsx`
- Modify: `src/app/components/layout/NavSidebar.tsx`
- Create: `src/app/components/layout/AppHeader.tsx`

**Interfaces:**
- `AppLayout`: Wraps all pages with responsive sidebar, top breadcrumb header, and scrollable container.
- `NavSidebar`: Collapsible sidebar with active left accent bar, icon support, role filtering, badge counts, and user persona switcher.
- `AppHeader`: Breadcrumbs, quick search input hint, role switcher modal/dropdown, notification icon, dark mode switch.

- [ ] **Step 1: Create `src/app/components/layout/AppHeader.tsx`**
  Implement breadcrumb path generator (`Dashboard`, `PSF Requests / REQ-2026-001`, `Admin / Users`), theme toggle, notification bell with indicator, and quick user role switch pill.
- [ ] **Step 2: Redesign `src/app/components/layout/NavSidebar.tsx`**
  Add modern logo with gradient badge, collapsible navigation groups, active state styling with blue indicator, count badges for pending items, and clean logout button.
- [ ] **Step 3: Update `src/app/components/layout/AppLayout.tsx`**
  Integrate `AppHeader` and `NavSidebar` with smooth sidebar collapse transitions and clean background surface.
- [ ] **Step 4: Verify layout build & render**
  Run: `npm run build`
- [ ] **Step 5: Commit changes**
  `git add src/app/components/layout/; git commit -m "feat: redesign modern AppShell with collapsible sidebar and breadcrumb header"`

---

### Task 3: Dashboard Redesign & Interactive KPI Summary Cards

**Files:**
- Modify: `src/app/components/dashboard/SummaryCards.tsx`
- Modify: `src/app/pages/DashboardPage.tsx`
- Modify: `src/app/components/dashboard/RequestsTable.tsx`

**Interfaces:**
- `SummaryCards`: 4 KPI cards (My Open, Waiting for Setup, In Progress, Overdue) with active border ring, soft gradient backgrounds, and one-click filtering.
- `RequestsTable`: High-scannability data table with sortable columns, status chips, priority pills, and hover row highlighting.

- [ ] **Step 1: Redesign `src/app/components/dashboard/SummaryCards.tsx`**
  Modern card styling with icon badges, active border highlight, hover lift effect, and clear count typography.
- [ ] **Step 2: Redesign `src/app/components/dashboard/RequestsTable.tsx`**
  Format table header with subtle background, mono font for Request IDs, department pills, colored priority badges (`High` = Red, `Medium` = Amber, `Low` = Slate), and direct action buttons.
- [ ] **Step 3: Update `src/app/pages/DashboardPage.tsx`**
  Implement search bar with clear button, multi-criteria filter select dropdowns (Department, Product Type), active filter tag dismissals, and clean header with "New Request" primary action.
- [ ] **Step 4: Verify Dashboard build**
  Run: `npm run build`
- [ ] **Step 5: Commit changes**
  `git add src/app/components/dashboard/ src/app/pages/DashboardPage.tsx; git commit -m "feat: redesign dashboard with interactive KPI cards and modern table"`

---

### Task 4: Workflow Stepper & Request Detail Workspace

**Files:**
- Create: `src/app/components/requests/WorkflowStepper.tsx`
- Modify: `src/app/components/requests/StatusBadge.tsx`
- Modify: `src/app/components/requests/StatusDropdown.tsx`
- Modify: `src/app/components/requests/AutofillBadge.tsx`
- Modify: `src/app/components/history/AuditTimeline.tsx`
- Modify: `src/app/pages/RequestDetailPage.tsx`

**Interfaces:**
- `WorkflowStepper`: Horizontal 4-step progress indicator (`DRAFT` → `SUBMITTED` → `SETUP_IN_PROGRESS` → `COMPLETED` / `REJECTED`).
- `RequestDetailPage`: 2-column workspace layout (Left: Requester + PSF Created data cards; Right: Action Center card + Live Audit Timeline feed).

- [ ] **Step 1: Create `src/app/components/requests/WorkflowStepper.tsx`**
  Visual progress stepper with numbered steps, active pulse glow, completed checkmark icons, and rejected branch indication.
- [ ] **Step 2: Update `StatusBadge.tsx` and `AutofillBadge.tsx`**
  Refined chip styles with dot indicators, tooltip explanations, and reference request links.
- [ ] **Step 3: Update `AuditTimeline.tsx`**
  Modern timeline feed with action icons, actor avatars, relative timestamps, and diff tags.
- [ ] **Step 4: Redesign `src/app/pages/RequestDetailPage.tsx`**
  Implement the 2-column responsive layout, embedding the `WorkflowStepper` at top, clean card containers, clear action buttons, and version upgrade banner.
- [ ] **Step 5: Verify Detail Page build**
  Run: `npm run build`
- [ ] **Step 6: Commit changes**
  `git add src/app/components/requests/ src/app/components/history/ src/app/pages/RequestDetailPage.tsx; git commit -m "feat: add visual workflow stepper and redesign request detail workspace"`

---

### Task 5: New Request Form & Auto-fill Experience

**Files:**
- Modify: `src/app/pages/RequestFormPage.tsx`
- Modify: `src/app/components/requests/RequesterInfoSection.tsx`
- Modify: `src/app/components/requests/PSFCreatedSection.tsx`

**Interfaces:**
- `RequestFormPage`: Sectioned form layout with auto-save draft status, top action bar, and sticky submit buttons.
- `RequesterInfoSection`: Grouped fields with clean input focus rings, floating labels/helper text, and auto-fill detection banner.

- [ ] **Step 1: Redesign `src/app/components/requests/RequesterInfoSection.tsx`**
  Group fields into logical cards (General Information, Probecard & Product, Recipe & Notes) with responsive 2-column grid and clear required indicators.
- [ ] **Step 2: Redesign `src/app/components/requests/PSFCreatedSection.tsx`**
  Engineering output form for Setup Owners (GNTC/MFG) with clean file name generation and parameter inputs.
- [ ] **Step 3: Redesign `src/app/pages/RequestFormPage.tsx`**
  Add header action bar, autofill suggestion banner when selecting reference PSF, and toast notification on draft save.
- [ ] **Step 4: Verify Form build**
  Run: `npm run build`
- [ ] **Step 5: Commit changes**
  `git add src/app/pages/RequestFormPage.tsx src/app/components/requests/RequesterInfoSection.tsx src/app/components/requests/PSFCreatedSection.tsx; git commit -m "feat: redesign request creation form and autofill experience"`

---

### Task 6: Requests List, History, Export & Admin Screens

**Files:**
- Modify: `src/app/pages/RequestsListPage.tsx`
- Modify: `src/app/pages/GlobalHistoryPage.tsx`
- Modify: `src/app/pages/ExportPage.tsx`
- Modify: `src/app/pages/LoginPage.tsx`
- Modify: `src/app/pages/admin/AdminLayout.tsx`
- Modify: `src/app/pages/admin/UsersPage.tsx`
- Modify: `src/app/pages/admin/FormConfigPage.tsx`

**Interfaces:**
- Consistent modern card styles, table filters, role badges, and toggle switches across secondary and administrative pages.

- [ ] **Step 1: Redesign `LoginPage.tsx`**
  Modern split-screen or centered card with quick persona selector buttons (Requester, Setup Owner GNTC, Setup Owner MFG, Admin) for instant 1-click testing.
- [ ] **Step 2: Redesign `RequestsListPage.tsx` and `GlobalHistoryPage.tsx`**
  Full-width clean table views with status filters, date range inputs, and export triggers.
- [ ] **Step 3: Redesign `ExportPage.tsx`**
  Interactive profile cards, visual column selection chips with "Select All" toggle, and live export preview table.
- [ ] **Step 4: Redesign Admin screens (`AdminLayout`, `UsersPage`, `FormConfigPage`)**
  Clean tabbed navigation, modern table rows with role pills, and schema editor cards.
- [ ] **Step 5: Verify All Pages build**
  Run: `npm run build`
- [ ] **Step 6: Commit changes**
  `git add src/app/pages/; git commit -m "feat: redesign login, export, history, and admin management pages"`

---

### Task 7: End-to-End Verification & Visual Polish

**Files:**
- Check: All modified components and pages.

- [ ] **Step 1: Run full production build**
  Run: `npm run build`
  Expected: Successful bundle generation with zero errors or warnings.
- [ ] **Step 2: Verify user flows**
  - Test login / persona switching.
  - Test dashboard KPI filter clicks.
  - Test creating a request with autofill.
  - Test progressing request through Workflow Stepper (`DRAFT` → `SUBMITTED` → `SETUP_IN_PROGRESS` → `COMPLETED`).
  - Test Dark / Light mode toggle across all views.
- [ ] **Step 3: Final Commit & Walkthrough Documentation**
  `git commit -am "chore: complete PSF Portal Modern Clean Enterprise redesign"`
