import { PSFRequest } from "../../mock/mockRequests";
import { StatusBadge } from "../requests/StatusBadge";
import { ArrowRight, ArrowUpDown } from "lucide-react";

interface RequestsTableProps {
  requests: PSFRequest[];
  onOpen: (id: string) => void;
  userRole: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  Low: "#6b7280",
  Medium: "#2563eb",
  High: "#d97706",
  Critical: "#dc2626",
};

export function RequestsTable({ requests, onOpen, userRole }: RequestsTableProps) {
  const today = new Date().toISOString().split("T")[0];

  if (requests.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: "var(--muted-foreground)",
          fontSize: 14,
        }}
      >
        No requests found matching your criteria.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            {[
              "Request No.",
              "Product Type",
              "Title",
              "Probecard Name",
              "PSF Setup File",
              "Status",
              "Priority",
              "Due Date",
              "Requester",
              "Setup Owner",
              "Dept.",
              "",
            ].map((col) => (
              <th
                key={col}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const isOverdue =
              req.dueDate < today &&
              !["COMPLETED", "CANCELLED", "REJECTED"].includes(req.status);
            return (
              <tr
                key={req.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: isOverdue ? "#fff5f5" : "var(--card)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = isOverdue
                    ? "#fff5f5"
                    : "var(--card)")
                }
              >
                <td style={{ padding: "10px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {req.requestNo}
                  {req.formVersion < 2 && (
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: 10,
                        color: "#9333ea",
                        background: "#f3e8ff",
                        padding: "1px 5px",
                        borderRadius: 8,
                      }}
                    >
                      v{req.formVersion}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: 12 }}>
                  {req.productType}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {req.title}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {req.requesterData.probecard_name || "—"}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {userRole === "requester" &&
                  !["PSF_CREATED", "COMPLETED"].includes(req.status)
                    ? <span style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Pending</span>
                    : req.psfCreatedData.psf_setup_file_name || "—"}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <StatusBadge status={req.status} size="sm" />
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      color: PRIORITY_COLOR[req.priority] ?? "var(--foreground)",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {req.priority}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                    color: isOverdue ? "#dc2626" : "var(--foreground)",
                    fontWeight: isOverdue ? 600 : 400,
                  }}
                >
                  {req.dueDate}
                  {isOverdue && " ⚠️"}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {req.requesterName}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {req.setupOwnerName || "—"}
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {req.setupOwnerRole ? (
                    <span
                      style={{
                        padding: "2px 7px",
                        background: req.setupOwnerRole === "GNTC" ? "#dbeafe" : "#fce7f3",
                        color: req.setupOwnerRole === "GNTC" ? "#1d4ed8" : "#be185d",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {req.setupOwnerRole}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <button
                    onClick={() => onOpen(req.id)}
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "none",
                      borderRadius: "var(--radius)",
                      padding: "5px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    View <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
