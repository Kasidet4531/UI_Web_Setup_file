export type UserActionType =
  | "USER_ADDED"
  | "USER_REMOVED"
  | "ROLE_CHANGED"
  | "DEPARTMENT_CHANGED"
  | "USER_UPDATED";

export interface UserLog {
  id: string;
  actionType: UserActionType;
  targetUserId: string;
  targetUserName: string;
  performedBy: string;
  performedByName: string;
  oldValue?: string;
  newValue?: string;
  performedAt: string;
  note?: string;
}

export const MOCK_USER_LOGS: UserLog[] = [
  {
    id: "ulog-001",
    actionType: "USER_ADDED",
    targetUserId: "u3",
    targetUserName: "Charlie Tan",
    performedBy: "admin01",
    performedByName: "Eva Chen",
    newValue: "setup_owner · GNTC",
    performedAt: "2026-05-01T09:00:00Z",
    note: "Onboarded new GNTC engineer",
  },
  {
    id: "ulog-002",
    actionType: "ROLE_CHANGED",
    targetUserId: "u2",
    targetUserName: "Bob Smith",
    performedBy: "admin01",
    performedByName: "Eva Chen",
    oldValue: "setup_owner · GNTC",
    newValue: "requester",
    performedAt: "2026-05-10T11:30:00Z",
    note: "Role corrected per HR request",
  },
  {
    id: "ulog-003",
    actionType: "USER_ADDED",
    targetUserId: "u4",
    targetUserName: "Diana Lee",
    performedBy: "admin01",
    performedByName: "Eva Chen",
    newValue: "setup_owner · MFG",
    performedAt: "2026-05-15T08:00:00Z",
  },
];
