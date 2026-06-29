import { AuditLog } from "../../mock/mockAuditLogs";
import {
  Plus,
  ArrowRightLeft,
  Edit3,
  Upload,
  Trash2,
  Sparkles,
  FileDown,
  Shield,
  CheckCircle,
} from "lucide-react";

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CREATE_REQUEST: { label: "Request Created", icon: <Plus size={14} />, color: "#2563eb" },
  CHANGE_STATUS: { label: "Status Changed", icon: <ArrowRightLeft size={14} />, color: "#d97706" },
  UPDATE_FIELD: { label: "Field Updated", icon: <Edit3 size={14} />, color: "#6b7280" },
  UPLOAD_ATTACHMENT: { label: "Attachment Uploaded", icon: <Upload size={14} />, color: "#059669" },
  DELETE_ATTACHMENT: { label: "Attachment Deleted", icon: <Trash2 size={14} />, color: "#dc2626" },
  USE_AUTOFILL: { label: "Auto-fill Applied", icon: <Sparkles size={14} />, color: "#7c3aed" },
  MARK_PSF_CREATED: { label: "PSF Marked Created", icon: <CheckCircle size={14} />, color: "#065f46" },
  EXPORT_EXCEL: { label: "Excel Exported", icon: <FileDown size={14} />, color: "#0369a1" },
  ADMIN_OVERRIDE: { label: "Admin Override", icon: <Shield size={14} />, color: "#b91c1c" },
};

interface AuditTimelineProps {
  logs: AuditLog[];
  compact?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export function AuditTimeline({ logs, compact = false }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div style={{ color: "var(--muted-foreground)", fontSize: 13, padding: "16px 0" }}>
        No audit history yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {logs.map((log, i) => {
        const cfg = ACTION_CONFIG[log.actionType] ?? {
          label: log.actionType,
          icon: <Edit3 size={14} />,
          color: "#6b7280",
        };
        return (
          <div key={log.id} style={{ display: "flex", gap: 12 }}>
            {/* Timeline connector */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: cfg.color + "22",
                  color: cfg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${cfg.color}`,
                  flexShrink: 0,
                }}
              >
                {cfg.icon}
              </div>
              {i < logs.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 16,
                    background: "var(--border)",
                    margin: "4px 0",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div
              style={{
                paddingBottom: i < logs.length - 1 ? 16 : 0,
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13, color: cfg.color }}>
                  {cfg.label}
                </span>
                {!compact && log.fieldLabel && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                      background: "var(--muted)",
                      padding: "1px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {log.fieldLabel}
                  </span>
                )}
              </div>

              {!compact && (log.oldValue || log.newValue) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  {log.oldValue && (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "2px 8px",
                        borderRadius: 4,
                        textDecoration: "line-through",
                      }}
                    >
                      {log.oldValue}
                    </span>
                  )}
                  {log.oldValue && log.newValue && (
                    <ArrowRightLeft size={12} style={{ color: "var(--muted-foreground)" }} />
                  )}
                  {log.newValue && (
                    <span
                      style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {log.newValue}
                    </span>
                  )}
                </div>
              )}

              {log.reason && (
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
                  Reason: {log.reason}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span>{log.changedByName}</span>
                <span>·</span>
                <span
                  style={{
                    background:
                      log.changedByDepartment === "GNTC"
                        ? "#dbeafe"
                        : log.changedByDepartment === "MFG"
                        ? "#fce7f3"
                        : "var(--muted)",
                    color:
                      log.changedByDepartment === "GNTC"
                        ? "#1d4ed8"
                        : log.changedByDepartment === "MFG"
                        ? "#be185d"
                        : "var(--muted-foreground)",
                    padding: "1px 6px",
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  {log.changedByDepartment
                    ? `${log.changedByRole} · ${log.changedByDepartment}`
                    : log.changedByRole}
                </span>
                <span>·</span>
                <span>{formatDate(log.changedAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
