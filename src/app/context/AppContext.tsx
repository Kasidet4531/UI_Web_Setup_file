import React, { createContext, useContext, useState, useCallback } from "react";
import { MOCK_USERS, MockUser, UserRole, Department } from "../mock/mockUsers";
import { MOCK_REQUESTS, PSFRequest } from "../mock/mockRequests";
import { MOCK_AUDIT_LOGS, AuditLog } from "../mock/mockAuditLogs";
import { MOCK_USER_LOGS, UserLog, UserActionType } from "../mock/mockUserLogs";
import { ACTIVE_SCHEMA, ALL_SCHEMAS, FormSchema } from "../mock/mockFormSchema";
import { DEFAULT_STATUSES, DEFAULT_TRANSITIONS, StatusDef, TransitionRule } from "../mock/mockStatuses";
import { DEFAULT_EXPORT_COLUMNS, ExportColumn } from "../mock/mockExportProfile";

type RequestStatus = string;

interface AppContextValue {
  currentUser: MockUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Users
  users: MockUser[];
  addUser: (user: Omit<MockUser, "id">) => void;
  updateUser: (id: string, data: Partial<MockUser>) => void;
  removeUser: (id: string) => void;
  userLogs: UserLog[];

  // Requests
  requests: PSFRequest[];
  getRequest: (id: string) => PSFRequest | undefined;
  createRequest: (data: Partial<PSFRequest>) => PSFRequest;
  updateRequest: (id: string, data: Partial<PSFRequest>) => void;
  changeStatus: (id: string, newStatus: string, reason?: string) => void;

  // Audit
  auditLogs: AuditLog[];
  getRequestLogs: (requestId: string) => AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id">) => void;

  // Schema
  activeSchema: FormSchema;
  updateActiveSchema: (schema: FormSchema) => void;
  getSchemaForVersion: (version: number) => FormSchema | undefined;

  // Dynamic statuses & transitions
  statuses: StatusDef[];
  addStatus: (s: Omit<StatusDef, "isBuiltIn">) => void;
  updateStatus: (key: string, data: Partial<StatusDef>) => void;
  removeStatus: (key: string) => void;
  transitions: TransitionRule[];
  setTransitions: React.Dispatch<React.SetStateAction<TransitionRule[]>>;

  // Export Profile
  exportColumns: ExportColumn[];
  updateExportColumns: (cols: ExportColumn[]) => void;
  resetExportColumns: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [requests, setRequests] = useState<PSFRequest[]>(MOCK_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [userLogs, setUserLogs] = useState<UserLog[]>(MOCK_USER_LOGS);
  const [activeSchema, setActiveSchema] = useState<FormSchema>(ACTIVE_SCHEMA);
  const [statuses, setStatuses] = useState<StatusDef[]>(DEFAULT_STATUSES);
  const [transitions, setTransitions] = useState<TransitionRule[]>(DEFAULT_TRANSITIONS);
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS);

  const updateExportColumns = useCallback((cols: ExportColumn[]) => {
    setExportColumns(cols);
  }, []);

  const resetExportColumns = useCallback(() => {
    setExportColumns(DEFAULT_EXPORT_COLUMNS);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  // ─── User management ────────────────────────────────────────────────────────

  const addUser = useCallback(
    (userData: Omit<MockUser, "id">) => {
      const newUser: MockUser = { ...userData, id: `u-${Date.now()}` };
      setUsers((prev) => [...prev, newUser]);
      const log: UserLog = {
        id: `ulog-${Date.now()}`,
        actionType: "USER_ADDED",
        targetUserId: newUser.id,
        targetUserName: newUser.name,
        performedBy: currentUser?.username ?? "admin",
        performedByName: currentUser?.name ?? "Admin",
        newValue: `${newUser.role}${newUser.department ? " · " + newUser.department : ""}`,
        performedAt: new Date().toISOString(),
      };
      setUserLogs((prev) => [log, ...prev]);
    },
    [currentUser]
  );

  const updateUser = useCallback(
    (id: string, data: Partial<MockUser>) => {
      setUsers((prev) => {
        const old = prev.find((u) => u.id === id);
        if (!old) return prev;

        // Determine what changed for the log
        const changes: string[] = [];
        if (data.role && data.role !== old.role) {
          changes.push(`role: ${old.role} → ${data.role}`);
        }
        if (data.department !== undefined && data.department !== old.department) {
          changes.push(`dept: ${old.department ?? "—"} → ${data.department ?? "—"}`);
        }

        if (changes.length > 0) {
          const actionType: UserActionType =
            data.role && data.role !== old.role ? "ROLE_CHANGED" : "USER_UPDATED";
          const log: UserLog = {
            id: `ulog-${Date.now()}`,
            actionType,
            targetUserId: id,
            targetUserName: old.name,
            performedBy: currentUser?.username ?? "admin",
            performedByName: currentUser?.name ?? "Admin",
            oldValue: `${old.role}${old.department ? " · " + old.department : ""}`,
            newValue: `${data.role ?? old.role}${
              (data.department ?? old.department)
                ? " · " + (data.department ?? old.department)
                : ""
            }`,
            performedAt: new Date().toISOString(),
          };
          setUserLogs((prev) => [log, ...prev]);
        }

        return prev.map((u) =>
          u.id === id ? { ...u, ...data } : u
        );
      });
    },
    [currentUser]
  );

  const removeUser = useCallback(
    (id: string) => {
      setUsers((prev) => {
        const target = prev.find((u) => u.id === id);
        if (!target) return prev;
        const log: UserLog = {
          id: `ulog-${Date.now()}`,
          actionType: "USER_REMOVED",
          targetUserId: id,
          targetUserName: target.name,
          performedBy: currentUser?.username ?? "admin",
          performedByName: currentUser?.name ?? "Admin",
          oldValue: `${target.role}${target.department ? " · " + target.department : ""}`,
          performedAt: new Date().toISOString(),
        };
        setUserLogs((prev) => [log, ...prev]);
        return prev.filter((u) => u.id !== id);
      });
    },
    [currentUser]
  );

  // ─── Request management ──────────────────────────────────────────────────────

  const addAuditLog = useCallback((log: Omit<AuditLog, "id">) => {
    setAuditLogs((prev) => [{ ...log, id: `log-${Date.now()}` }, ...prev]);
  }, []);

  const getRequest = useCallback(
    (id: string) => requests.find((r) => r.id === id),
    [requests]
  );

  const createRequest = useCallback(
    (data: Partial<PSFRequest>): PSFRequest => {
      const id = `req-${Date.now()}`;
      const reqNo = `REQ-${String(requests.length + 1).padStart(4, "0")}`;
      const newReq: PSFRequest = {
        id,
        requestNo: reqNo,
        formKey: "psf-request-form",
        formVersion: ACTIVE_SCHEMA.version,
        status: "DRAFT",
        requester: currentUser?.username ?? "",
        requesterName: currentUser?.name ?? "",
        setupOwner: null,
        setupOwnerName: null,
        setupOwnerRole: null,
        productType: "",
        priority: "Medium",
        title: "",
        dueDate: "",
        requestDate: new Date().toISOString().split("T")[0],
        requesterData: {},
        psfCreatedData: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: null,
        psfCreatedAt: null,
        completedAt: null,
        autofillMeta: [],
        ...data,
      };
      setRequests((prev) => [newReq, ...prev]);
      return newReq;
    },
    [currentUser, requests.length]
  );

  const updateRequest = useCallback(
    (id: string, data: Partial<PSFRequest>) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...data, updatedAt: new Date().toISOString() }
            : r
        )
      );
    },
    []
  );

  const changeStatus = useCallback(
    (id: string, newStatus: string, reason?: string) => {
      const req = requests.find((r) => r.id === id);
      if (!req || !currentUser) return;

      const now = new Date().toISOString();
      const updates: Partial<PSFRequest> = { status: newStatus };

      if (newStatus === "SUBMITTED") updates.submittedAt = now;
      if (newStatus === "PSF_CREATED") updates.psfCreatedAt = now;
      if (newStatus === "COMPLETED") updates.completedAt = now;

      if (
        currentUser.role === "setup_owner" &&
        ["SETUP_IN_PROGRESS", "PSF_CREATED", "COMPLETED"].includes(newStatus)
      ) {
        updates.setupOwner = currentUser.username;
        updates.setupOwnerName = currentUser.name;
        updates.setupOwnerRole = currentUser.department as "GNTC" | "MFG";
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: now } : r
        )
      );

      addAuditLog({
        requestId: id,
        requestNo: req.requestNo,
        actionType: newStatus === "PSF_CREATED" ? "MARK_PSF_CREATED" : "CHANGE_STATUS",
        fieldKey: "status",
        fieldLabel: "Status",
        oldValue: req.status,
        newValue: newStatus,
        changedBy: currentUser.username,
        changedByName: currentUser.name,
        changedByRole: currentUser.role,
        changedByDepartment: currentUser.department,
        changedAt: now,
        reason,
      });
    },
    [requests, currentUser, addAuditLog]
  );

  const getRequestLogs = useCallback(
    (requestId: string) =>
      auditLogs
        .filter((l) => l.requestId === requestId)
        .sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
        ),
    [auditLogs]
  );

  // ─── Status management ───────────────────────────────────────────────────────

  const addStatus = useCallback((s: Omit<StatusDef, "isBuiltIn">) => {
    setStatuses((prev) => [...prev, { ...s, isBuiltIn: false }]);
  }, []);

  const updateStatus = useCallback((key: string, data: Partial<StatusDef>) => {
    setStatuses((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...data } : s))
    );
  }, []);

  const removeStatus = useCallback((key: string) => {
    setStatuses((prev) => prev.filter((s) => s.key !== key || s.isBuiltIn));
  }, []);

  const getSchemaForVersion = useCallback(
    (version: number) => ALL_SCHEMAS.find((s) => s.version === version),
    []
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        users,
        addUser,
        updateUser,
        removeUser,
        userLogs,
        requests,
        getRequest,
        createRequest,
        updateRequest,
        changeStatus,
        auditLogs,
        getRequestLogs,
        addAuditLog,
        activeSchema,
        updateActiveSchema: setActiveSchema,
        getSchemaForVersion,
        statuses,
        addStatus,
        updateStatus,
        removeStatus,
        transitions,
        setTransitions,
        exportColumns,
        updateExportColumns,
        resetExportColumns,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
