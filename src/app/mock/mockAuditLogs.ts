export type ActionType =
  | "CREATE_REQUEST"
  | "UPDATE_FIELD"
  | "CHANGE_STATUS"
  | "UPLOAD_ATTACHMENT"
  | "DELETE_ATTACHMENT"
  | "USE_AUTOFILL"
  | "MARK_PSF_CREATED"
  | "EXPORT_EXCEL"
  | "ADMIN_OVERRIDE";

export interface AuditLog {
  id: string;
  requestId: string;
  requestNo: string;
  actionType: ActionType;
  fieldKey?: string;
  fieldLabel?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedByName: string;
  changedByRole: string;
  changedByDepartment?: string | null;
  changedAt: string;
  reason?: string;
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "CREATE_REQUEST",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: undefined,
    newValue: "SUBMITTED",
    changedBy: "requester01",
    changedByName: "Alice Johnson",
    changedByRole: "requester",
    changedByDepartment: null,
    changedAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "log-002",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "CHANGE_STATUS",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "SUBMITTED",
    newValue: "SETUP_IN_PROGRESS",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "log-003",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "UPDATE_FIELD",
    fieldKey: "psf_setup_file_name",
    fieldLabel: "PSF Setup File Name",
    oldValue: "",
    newValue: "PSF_PRODA_FAB_A_001",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-05-25T13:30:00Z",
  },
  {
    id: "log-004",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "MARK_PSF_CREATED",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "SETUP_IN_PROGRESS",
    newValue: "PSF_CREATED",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-05-25T14:00:00Z",
  },
  {
    id: "log-005",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "UPLOAD_ATTACHMENT",
    fieldKey: "template",
    fieldLabel: "Template",
    oldValue: undefined,
    newValue: "template_PRODA_001.xlsx",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-05-25T14:05:00Z",
  },
  {
    id: "log-006",
    requestId: "req-001",
    requestNo: "REQ-0001",
    actionType: "CHANGE_STATUS",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "PSF_CREATED",
    newValue: "COMPLETED",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "log-007",
    requestId: "req-002",
    requestNo: "REQ-0002",
    actionType: "CREATE_REQUEST",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: undefined,
    newValue: "SUBMITTED",
    changedBy: "requester02",
    changedByName: "Bob Smith",
    changedByRole: "requester",
    changedByDepartment: null,
    changedAt: "2026-05-20T11:00:00Z",
  },
  {
    id: "log-008",
    requestId: "req-002",
    requestNo: "REQ-0002",
    actionType: "CHANGE_STATUS",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "SUBMITTED",
    newValue: "SETUP_IN_PROGRESS",
    changedBy: "setup_mfg01",
    changedByName: "Diana Lee",
    changedByRole: "setup_owner",
    changedByDepartment: "MFG",
    changedAt: "2026-05-22T09:00:00Z",
  },
  {
    id: "log-009",
    requestId: "req-002",
    requestNo: "REQ-0002",
    actionType: "MARK_PSF_CREATED",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "SETUP_IN_PROGRESS",
    newValue: "PSF_CREATED",
    changedBy: "setup_mfg01",
    changedByName: "Diana Lee",
    changedByRole: "setup_owner",
    changedByDepartment: "MFG",
    changedAt: "2026-06-10T11:00:00Z",
  },
  {
    id: "log-010",
    requestId: "req-003",
    requestNo: "REQ-0003",
    actionType: "CREATE_REQUEST",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: undefined,
    newValue: "SUBMITTED",
    changedBy: "requester01",
    changedByName: "Alice Johnson",
    changedByRole: "requester",
    changedByDepartment: null,
    changedAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "log-011",
    requestId: "req-003",
    requestNo: "REQ-0003",
    actionType: "USE_AUTOFILL",
    fieldKey: "product",
    fieldLabel: "Product",
    oldValue: "",
    newValue: "PRODUCT-A",
    changedBy: "requester01",
    changedByName: "Alice Johnson",
    changedByRole: "requester",
    changedByDepartment: null,
    changedAt: "2026-06-01T08:30:00Z",
    reason: "Auto-filled from REQ-0001",
  },
  {
    id: "log-012",
    requestId: "req-003",
    requestNo: "REQ-0003",
    actionType: "CHANGE_STATUS",
    fieldKey: "status",
    fieldLabel: "Status",
    oldValue: "SUBMITTED",
    newValue: "SETUP_IN_PROGRESS",
    changedBy: "setup_gntc01",
    changedByName: "Charlie Tan",
    changedByRole: "setup_owner",
    changedByDepartment: "GNTC",
    changedAt: "2026-06-05T09:00:00Z",
  },
];
