import { useApp } from "../context/AppContext";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { StatusBadge } from "../components/requests/StatusBadge";
import { ArrowLeft } from "lucide-react";

interface RequestHistoryPageProps {
  requestId: string;
  onNavigate: (path: string) => void;
}

export function RequestHistoryPage({ requestId, onNavigate }: RequestHistoryPageProps) {
  const { getRequest, getRequestLogs } = useApp();
  const req = getRequest(requestId);
  const logs = getRequestLogs(requestId);

  if (!req) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--muted-foreground)" }}>
        Request not found.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate(`/requests/${req.id}`)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
          }}
        >
          <ArrowLeft size={15} /> Back to Request
        </button>
        <span style={{ color: "var(--border)" }}>|</span>
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{req.requestNo}</span>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Audit History</span>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {req.requestNo} · {req.requesterName}
          </div>
        </div>
        <StatusBadge status={req.status} />
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted-foreground)" }}>
          {logs.length} audit entries
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
        }}
      >
        <AuditTimeline logs={logs} />
      </div>
    </div>
  );
}
