import { useState } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/requests/StatusBadge";
import { Download, Shield, ArrowLeft } from "lucide-react";

interface ExportPageProps {
  onNavigate: (path: string) => void;
}

const REQUESTER_MASKED_STATUS_KEYS = [
  "DRAFT",
  "SUBMITTED",
  "SETUP_IN_PROGRESS",
  "NEED_MORE_INFO",
  "REJECTED",
  "CANCELLED",
];

export function ExportPage({ onNavigate }: ExportPageProps) {
  const { requests, currentUser, statuses } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exported, setExported] = useState(false);

  const isRequester = currentUser?.role === "requester";

  const filtered = requests.filter((r) => {
    if (isRequester && r.requester !== currentUser?.username) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (fromDate && r.requestDate < fromDate) return false;
    if (toDate && r.requestDate > toDate) return false;
    return true;
  });

  const handleExport = () => {
    // Simulate export — in reality this calls GET /api/requests/export.xlsx
    const rows = filtered.map((r) => {
      const psfMasked =
        isRequester && REQUESTER_MASKED_STATUS_KEYS.includes(r.status);
      return {
        "Request No.": r.requestNo,
        "Product Type": r.productType,
        Title: r.title,
        "Reference PSF Name": r.requesterData.reference_psf_name ?? "",
        "Probecard Name": r.requesterData.probecard_name ?? "",
        "PSF Setup File Name": psfMasked
          ? "N/A (Pending Setup)"
          : r.psfCreatedData.psf_setup_file_name ?? "",
        Status: r.status,
        Priority: r.priority,
        "Due Date": r.dueDate,
        Requester: r.requesterName,
        "Setup Owner": r.setupOwnerName ?? "",
        "Setup Owner Dept.": r.setupOwnerRole ?? "",
      };
    });

    // Build CSV
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => `"${(row as Record<string, string>)[h] ?? ""}"`).join(",")
      ),
    ].join("\n");

    const now = new Date();
    const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psf_requests_${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate("/dashboard")}
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
          <ArrowLeft size={15} /> Back
        </button>
        <span style={{ color: "var(--border)" }}>|</span>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Export Excel</h1>
      </div>

      {/* Security notice for Requesters */}
      {isRequester && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <Shield size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: "#92400e" }}>
            <strong>Security Notice:</strong> As a Requester, columns in the <em>PSF Created Information</em> section
            for requests that have not yet reached <strong>PSF Created</strong> status will be exported as{" "}
            <strong>"N/A (Pending Setup)"</strong> instead of actual values.
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Filter panel */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 20,
            width: 280,
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Export Filters</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Request Date From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Request Date To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--muted-foreground)" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} will be exported
            </div>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                background: exported ? "#d1fae5" : filtered.length === 0 ? "var(--muted)" : "var(--primary)",
                color: exported ? "#065f46" : filtered.length === 0 ? "var(--muted-foreground)" : "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: filtered.length === 0 ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Download size={15} />
              {exported ? "Downloaded!" : "Download CSV"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Preview ({filtered.length} rows)
            </div>
            <div style={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {[
                      "Request No.",
                      "Product Type",
                      "Title",
                      "Probecard Name",
                      "PSF Setup File Name",
                      "Status",
                      "Priority",
                      "Due Date",
                      "Setup Owner",
                      "Dept.",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "var(--muted-foreground)",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const psfMasked =
                      isRequester && REQUESTER_MASKED_STATUS_KEYS.includes(r.status);
                    return (
                      <tr
                        key={r.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={{ padding: "7px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>{r.requestNo}</td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{r.productType}</td>
                        <td style={{ padding: "7px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{r.requesterData.probecard_name || "—"}</td>
                        <td
                          style={{
                            padding: "7px 10px",
                            whiteSpace: "nowrap",
                            color: psfMasked ? "#6b7280" : "var(--foreground)",
                            fontStyle: psfMasked ? "italic" : "normal",
                          }}
                        >
                          {psfMasked ? "N/A (Pending Setup)" : r.psfCreatedData.psf_setup_file_name || "—"}
                        </td>
                        <td style={{ padding: "7px 10px" }}>
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{r.priority}</td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{r.dueDate}</td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{r.setupOwnerName || "—"}</td>
                        <td style={{ padding: "7px 10px" }}>
                          {r.setupOwnerRole ? (
                            <span
                              style={{
                                padding: "1px 6px",
                                background: r.setupOwnerRole === "GNTC" ? "#dbeafe" : "#fce7f3",
                                color: r.setupOwnerRole === "GNTC" ? "#1d4ed8" : "#be185d",
                                borderRadius: 8,
                                fontWeight: 600,
                              }}
                            >
                              {r.setupOwnerRole}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
