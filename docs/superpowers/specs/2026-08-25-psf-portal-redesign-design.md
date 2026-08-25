# PSF Request Portal — Modern Clean Enterprise Redesign Spec

**Date:** 2026-08-25  
**Topic:** Full UX/UI Redesign for PSF Request & Setup File Management System  
**Design Direction:** Modern Clean Enterprise (Slate Navy & Royal Blue, 8dp Grid, Accessible Contrast, Workflow Stepper, High-Scannability Data Tables)

---

## 1. Overview & Goals
The PSF Request Portal manages the lifecycle of probecard setup files across Requester, Setup Owner (GNTC / MFG), and Admin teams. The current UI has usability challenges: raw inline styles, low visual hierarchy, lack of visual workflow progression, and suboptimal form/table readability.

This redesign transforms the portal into a clean, modern, accessible, and high-efficiency enterprise application.

### Key Objectives:
1. **Design System & Aesthetics:** Implement a cohesive design token system with Slate/Navy primary palette, subtle card elevations, crisp borders, and full Light/Dark mode support.
2. **Global Navigation & Layout:** Provide an intuitive App Shell with a collapsible sidebar, breadcrumbs, role indicator, and fast shortcuts.
3. **Actionable Dashboard:** Deliver interactive KPI metric summary cards that double as one-click quick filters, accompanied by an enhanced search & filter bar and responsive data table.
4. **Visual Workflow Stepper:** Clarify the request lifecycle with an interactive horizontal stepper (`DRAFT` → `SUBMITTED` → `SETUP_IN_PROGRESS` → `COMPLETED`) on the detail page.
5. **Streamlined Forms & Auto-fill:** Structure request forms with clean visual grouping, real-time draft status feedback, and transparent Auto-fill previews from reference PSFs.
6. **Polished Admin & Export Views:** Ensure consistent, modern card-based interfaces across user management, form schema config, autofill rules, workflow matrix, and Excel export profiles.

---

## 2. Design System & Tokens

### 2.1 Color Palette
- **Primary / Brand:** `#0F172A` (Slate 900)
- **Primary Accent / CTA:** `#2563EB` (Blue 600) / Hover: `#1D4ED8` (Blue 700)
- **Light Theme Background:** `#F8FAFC` (Slate 50)
- **Light Theme Surface (Cards):** `#FFFFFF`
- **Light Theme Borders:** `#E2E8F0` (Slate 200)
- **Light Theme Muted Text:** `#64748B` (Slate 500)
- **Dark Theme Background:** `#0B0F19`
- **Dark Theme Surface (Cards):** `#111827` (Gray 900)
- **Dark Theme Borders:** `#1F2937` (Gray 800)
- **Dark Theme Muted Text:** `#9CA3AF` (Gray 400)

### 2.2 Status Badges & Lifecycle Colors
- **DRAFT:** Slate (`bg: #F1F5F9`, `text: #475569`, `border: #CBD5E1`)
- **SUBMITTED:** Amber (`bg: #FEF3C7`, `text: #B45309`, `border: #FCD34D`)
- **SETUP_IN_PROGRESS:** Blue (`bg: #EFF6FF`, `text: #1D4ED8`, `border: #93C5FD`)
- **COMPLETED:** Emerald (`bg: #ECFDF5`, `text: #047857`, `border: #6EE7B7`)
- **REJECTED / CANCELLED:** Rose (`bg: #FFE4E6`, `text: #BE123C`, `border: #FDA4AF`)
- **ON_HOLD:** Purple (`bg: #F5F3FF`, `text: #6D28D9`, `border: #C4B5FD`)
- **OVERDUE Flag:** Red badge with alert icon (`#DC2626`)

### 2.3 Typography & Sizing
- **Heading Font:** Inter / system-ui, semibold/bold (700/600), tight letter-spacing.
- **Body Font:** Inter / system-ui, regular/medium (400/500), 14px default, line-height 1.5.
- **Mono Font (Part Numbers, IDs):** JetBrains Mono / Fira Code / ui-monospace, 13px.
- **Radius Tokens:** `--radius: 0.5rem` (8px for inputs/buttons), `--radius-lg: 0.75rem` (12px for cards/containers).

---

## 3. UI Component Architecture

```
src/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Modern App Shell (Header, Sidebar, Main)
│   │   │   ├── NavSidebar.tsx         # Collapsible sidebar with active badges
│   │   │   └── Header.tsx             # Breadcrumbs, role switch, theme toggle
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx       # KPI Metric Cards with active filter highlight
│   │   │   ├── RequestsTable.tsx      # High-scannability data table with sort/chips
│   │   │   └── FilterBar.tsx          # Search + multi-criteria dropdown filters
│   │   ├── requests/
│   │   │   ├── WorkflowStepper.tsx    # Visual lifecycle progress bar
│   │   │   ├── StatusBadge.tsx        # Modern chip component
│   │   │   ├── StatusDropdown.tsx     # Context-aware action dropdown
│   │   │   ├── RequesterInfoSection.tsx # Grouped form fields with autofill tags
│   │   │   ├── PSFCreatedSection.tsx  # Setup owner engineering fields
│   │   │   └── AutofillBadge.tsx      # Blue glow indicator with source link
│   │   ├── history/
│   │   │   └── AuditTimeline.tsx      # Modern timestamped change feed
│   │   └── ui/                        # Reusable primitives (Buttons, Cards, Inputs)
│   └── pages/
│       ├── DashboardPage.tsx          # Overview dashboard
│       ├── RequestFormPage.tsx        # New request creation form
│       ├── RequestDetailPage.tsx      # Two-column request workspace
│       ├── RequestsListPage.tsx       # Full request listing with advanced filter
│       ├── GlobalHistoryPage.tsx      # System-wide audit history
│       ├── ExportPage.tsx             # Excel export generator & profile selector
│       ├── LoginPage.tsx              # Clean login / persona selector
│       └── admin/                     # Config and admin screens
```

---

## 4. Detailed Component Specifications

### 4.1 Global Layout & Navigation
- **Sidebar:**
  - Header: Logo icon with gradient accent + app title + version pill.
  - Navigation list: Grouped items (`Overview`, `Requests`, `History`, `Administration`).
  - Active item indicator: Left blue bar, filled icon, light accent background.
  - Collapse / Expand button with subtle micro-interaction.
  - Bottom card: Current active persona with instant role switch dropdown for paired testing.
- **Top Header:**
  - Dynamic breadcrumbs: `Dashboard` or `Requests / REQ-2026-001`.
  - Global search quick trigger (`Ctrl+K` visual hint).
  - Quick action: `+ New Request` primary button.
  - Theme toggle (Light / Dark mode) + Notification bell icon.

### 4.2 Dashboard Page
- **KPI Summary Cards (4 Cards):**
  1. *My Open Requests* (Active count, Blue badge)
  2. *Waiting for Setup* (Submitted status count, Amber badge)
  3. *Setup in Progress* (In-progress count, Indigo badge)
  4. *Overdue Requests* (Overdue count, Red alert badge)
  - Clicking any card toggles an active filter state on the data table below.
- **Search & Filter Bar:**
  - Search input with clear button.
  - Filters: Department (`GNTC`, `MFG`), Product Type (`New`, `Transfer`, `Existing`), Priority (`High`, `Medium`, `Low`).
  - Reset Filter button appears when any filter is active.
- **Requests Table:**
  - Column headers with sort arrows.
  - Columns: Request No (mono font), Title & Probecard, Product Type, Requester & Dept, Setup Owner, Due Date (highlighted if overdue), Status badge, Actions.
  - Row hover effect with subtle background tint.
  - Empty state with clear illustration and "Create your first request" CTA.

### 4.3 Request Detail & Workflow
- **Workflow Stepper:**
  - 4 major stages: `DRAFT` ➔ `SUBMITTED` ➔ `SETUP IN PROGRESS` ➔ `COMPLETED` (or `REJECTED` branch).
  - Current stage highlighted with glowing ring, completed stages marked with checkmarks.
- **Two-Column Responsive Workspace:**
  - **Left / Main Column (70%):**
    - Section 1: *Requester Information* (Read-only or Editable based on state/role).
    - Section 2: *PSF Setup File Output* (Editable by Setup Owner / Admin).
    - Autofill indicator badge next to fields populated from reference PSF with tooltip/popover showing source request.
  - **Right / Sidebar Column (30%):**
    - Card 1: *Status & Actions Panel* — Primary action button (e.g., "Start Setup", "Mark as Completed", "Reject"), assigned owner details, due date countdown.
    - Card 2: *Audit Log Timeline* — Chronological activity feed showing timestamp, user avatar, action type, and field delta.

### 4.4 New Request Form
- Clean section headers with step numbers.
- Dynamic fields rendered from Active Form Schema.
- Reference PSF field with instant lookup and Auto-fill suggestion drawer/banner.
- Auto-save draft status indicator ("Draft saved 2m ago").
- Action bar fixed at bottom or header: "Save Draft" and "Submit Request".

### 4.5 Excel Export & Admin Screens
- **Export Page:** Card-based profile selection, interactive column checklist chips with "Select All" / "Deselect All", live preview count, and export progress button.
- **Admin Pages:** Standardized table and card layouts for Users & Roles, Form Schema Configurator, Workflow Transitions, and Auto-fill Rule definitions.

---

## 5. Verification Plan

### Automated & Build Verification
1. `npm run build` / `vite build` — Validate TypeScript compilation and CSS bundling with zero errors.
2. Code lint / type integrity check across all updated TSX files.

### Visual & Interactive Verification
1. **Theme Switch:** Toggle between Light and Dark modes to confirm color contrast ratio $\ge 4.5:1$ across all cards and text.
2. **Role Switching:** Verify persona switches (Requester -> Setup Owner GNTC/MFG -> Admin) dynamically update permissions and navigation items.
3. **Workflow Stepper:** Transition a request from DRAFT ➔ SUBMITTED ➔ SETUP_IN_PROGRESS ➔ COMPLETED and verify stepper updates correctly.
4. **Interactive Filters:** Click KPI summary cards on the dashboard and verify the table filter applies instantly.
5. **Autofill Experience:** Create a new request, select a reference PSF, apply autofill, and verify field population and blue indicator badges.
