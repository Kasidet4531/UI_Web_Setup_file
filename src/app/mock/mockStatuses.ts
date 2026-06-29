export interface StatusDef {
  key: string;
  label: string;
  bg: string;
  color: string;
  isBuiltIn: boolean;
  category: "core" | "progress" | "terminal";
  description?: string;
}

export const DEFAULT_STATUSES: StatusDef[] = [
  {
    key: "DRAFT",
    label: "Draft",
    bg: "#f3f4f6",
    color: "#6b7280",
    isBuiltIn: true,
    category: "core",
    description: "Request created but not yet submitted",
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    bg: "#dbeafe",
    color: "#1d4ed8",
    isBuiltIn: true,
    category: "core",
    description: "Request submitted, awaiting setup owner pickup",
  },
  {
    key: "SETUP_IN_PROGRESS",
    label: "Setup In Progress",
    bg: "#fef3c7",
    color: "#b45309",
    isBuiltIn: true,
    category: "core",
    description: "Setup file owner is actively working on the setup",
  },
  {
    key: "PSF_CREATED",
    label: "PSF Created",
    bg: "#d1fae5",
    color: "#065f46",
    isBuiltIn: true,
    category: "core",
    description: "PSF setup file has been created and information filled in",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    bg: "#dcfce7",
    color: "#15803d",
    isBuiltIn: true,
    category: "terminal",
    description: "Request is fully completed",
  },
  {
    key: "NEED_MORE_INFO",
    label: "Need More Info",
    bg: "#fce7f3",
    color: "#be185d",
    isBuiltIn: true,
    category: "core",
    description: "Additional information required from requester",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    bg: "#fee2e2",
    color: "#991b1b",
    isBuiltIn: true,
    category: "terminal",
    description: "Request has been rejected",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    bg: "#f3f4f6",
    color: "#374151",
    isBuiltIn: true,
    category: "terminal",
    description: "Request has been cancelled",
  },
];

export interface TransitionRule {
  id: string;
  from: string;
  to: string;
  roles: string[];
}

export const DEFAULT_TRANSITIONS: TransitionRule[] = [
  { id: "t1", from: "DRAFT", to: "SUBMITTED", roles: ["requester", "admin"] },
  { id: "t2", from: "SUBMITTED", to: "SETUP_IN_PROGRESS", roles: ["setup_owner", "admin"] },
  { id: "t3", from: "SETUP_IN_PROGRESS", to: "PSF_CREATED", roles: ["setup_owner", "admin"] },
  { id: "t4", from: "PSF_CREATED", to: "COMPLETED", roles: ["setup_owner", "admin"] },
  { id: "t5", from: "SUBMITTED", to: "NEED_MORE_INFO", roles: ["setup_owner", "admin"] },
  { id: "t6", from: "NEED_MORE_INFO", to: "SUBMITTED", roles: ["requester", "admin"] },
  { id: "t7", from: "SUBMITTED", to: "REJECTED", roles: ["setup_owner", "admin"] },
  { id: "t8", from: "SETUP_IN_PROGRESS", to: "REJECTED", roles: ["setup_owner", "admin"] },
  { id: "t9", from: "DRAFT", to: "CANCELLED", roles: ["requester", "admin"] },
  { id: "t10", from: "SUBMITTED", to: "CANCELLED", roles: ["requester", "admin"] },
];
