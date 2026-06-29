import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { ActionType } from "../mock/mockAuditLogs";
import { Search, Filter } from "lucide-react";

interface GlobalHistoryPageProps {
  onNavigate: (path: string) => void;
}

const ACTION_TYPES: ActionType[] = [
  "CREATE_REQUEST",
  "UPDATE_FIELD",
  "CHANGE_STATUS",
  "UPLOAD_ATTACHMENT",
  "DELETE_ATTACHMENT",
  "USE_AUTOFILL",
  "MARK_PSF_CREATED",
  "EXPORT_EXCEL",
  "ADMIN_OVERRIDE",
];

export function GlobalHistoryPage({ onNavigate }: GlobalHistoryPageProps) {
  const { auditLogs, currentUser, requests } = useApp();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionType | "">("");
  const [deptFilter, setDeptFilter] = useState("");

  const visibleLogs = useMemo(() => {
    let logs = auditLogs;

    // Requesters can only see logs from their own requests
    if (currentUser?.role === "requester") {
      const myReqIds = requests
        .filter((r) => r.requester === currentUser.username)
        .map((r) => r.id);
      logs = logs.filter((l) => myReqIds.includes(l.requestId));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.requestNo.toLowerCase().includes(q) ||
          (l.changedByName ?? "").toLowerCase().includes(q) ||
          (l.fieldLabel ?? "").toLowerCase().includes(q)
      );
    }
    if (actionFilter) logs = logs.filter((l) => l.actionType === actionFilter);
    if (deptFilter) logs = logs.filter((l) => l.changedByDepartment === deptFilter);

    return logs.sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }, [auditLogs, currentUser, requests, search, actionFilter, deptFilter]);

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Audit History</h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
          Field-level change log across all PSF requests
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 14,
          marginBottom: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Filter size={15} style={{ color: "var(--muted-foreground)" }} />
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by request no., user, field..."
            style={{ ...inputStyle, paddingLeft: 30, width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionType | "")}
          style={inputStyle}
        >
          <option value="">All Actions</option>
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Departments</option>
          <option value="GNTC">GNTC</option>
          <option value="MFG">MFG</option>
        </select>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {visibleLogs.length} entries
        </span>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
        }}
      >
        <AuditTimeline logs={visibleLogs} />
      </div>
    </div>
  );
}
