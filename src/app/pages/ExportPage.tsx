import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/requests/StatusBadge";
import {
  Download,
  Shield,
  ArrowLeft,
  FileSpreadsheet,
  Calendar,
  Filter,
  Check,
  Eye,
  Sliders,
  RotateCcw,
} from "lucide-react";

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
  const { requests, currentUser, statuses, exportColumns } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    exportColumns.filter((c) => c.enabled).map((c) => c.key)
  );
  const [exported, setExported] = useState(false);

  // Sync with system exportColumns if profile changes
  useEffect(() => {
    setSelectedColumns(exportColumns.filter((c) => c.enabled).map((c) => c.key));
  }, [exportColumns]);

  const isRequester = currentUser?.role === "requester";
  const isAdmin = currentUser?.role === "admin";

  const filtered = requests.filter((r) => {
    if (isRequester && r.requester !== currentUser?.username) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (fromDate && r.requestDate < fromDate) return false;
    if (toDate && r.requestDate > toDate) return false;
    return true;
  });

  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns((cols) => cols.filter((c) => c !== key));
      }
    } else {
      setSelectedColumns((cols) => [...cols, key]);
    }
  };

  const selectAllCols = () => setSelectedColumns(exportColumns.map((c) => c.key));
  const resetToProfileDefaults = () =>
    setSelectedColumns(exportColumns.filter((c) => c.enabled).map((c) => c.key));

  const getFieldValue = (r: (typeof requests)[number], key: string, psfMasked: boolean) => {
    switch (key) {
      case "request_no":
        return r.requestNo;
      case "product_type":
        return r.productType;
      case "title":
        return r.title;
      case "product":
        return r.requesterData?.product || "";
      case "wafer_fab":
        return r.requesterData?.wafer_fab || "";
      case "reference_psf_name":
        return r.requesterData?.reference_psf_name || "";
      case "probecard_name":
        return r.requesterData?.probecard_name || "";
      case "psf_setup_file_name":
        return psfMasked
          ? "N/A (Pending Setup)"
          : r.psfCreatedData?.psf_setup_file_name || "";
      case "status":
        return r.status;
      case "priority":
        return r.priority;
      case "due_date":
        return r.dueDate || "";
      case "requester":
        return r.requesterName;
      case "setup_owner":
        return r.setupOwnerName || "";
      case "setup_owner_role":
        return r.setupOwnerRole || "";
      default:
        return "";
    }
  };

  const activeColumnsInOrder = exportColumns.filter((c) => selectedColumns.includes(c.key));

  const handleExport = () => {
    if (filtered.length === 0 || activeColumnsInOrder.length === 0) return;

    const rows = filtered.map((r) => {
      const psfMasked = isRequester && REQUESTER_MASKED_STATUS_KEYS.includes(r.status);
      const obj: Record<string, string> = {};
      activeColumnsInOrder.forEach((col) => {
        obj[col.label] = getFieldValue(r, col.key, psfMasked);
      });
      return obj;
    });

    const headers = activeColumnsInOrder.map((c) => c.label);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => `"${(row as Record<string, string>)[h] ?? ""}"`).join(",")
      ),
    ].join("\n");

    const now = new Date();
    const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
    // Add UTF-8 BOM for Microsoft Excel compatibility
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psf_requests_export_${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("/requests")}
            className="btn-ghost text-xs py-1.5 px-2.5"
          >
            <ArrowLeft size={15} />
            <span>Back to Requests</span>
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <FileSpreadsheet size={17} />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              Export PSF Requests to Excel / CSV
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => onNavigate("/admin/export-profile")}
              className="btn-secondary text-xs py-2 px-3 shadow-2xs flex items-center gap-1.5"
              title="Configure system-wide export profile"
            >
              <Sliders size={13} />
              <span>Edit Export Profile</span>
            </button>
          )}

          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || activeColumnsInOrder.length === 0}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 px-4 shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={15} />
            <span>{exported ? "Downloaded File!" : `Export ${filtered.length} Requests`}</span>
          </button>
        </div>
      </div>

      {/* Requester Masking Notice */}
      {isRequester && (
        <div className="glass-panel p-4 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs shadow-2xs">
          <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-amber-900 dark:text-amber-300">
              Data Security Policy Applied
            </div>
            <p className="text-amber-700 dark:text-amber-400 text-[11px]">
              Setup parameters for in-progress or draft requests are masked as "Pending Setup" until
              the Setup File Owner completes verification.
            </p>
          </div>
        </div>
      )}

      {/* Export Configuration Card */}
      <div className="glass-panel p-5 sm:p-6 space-y-5 bg-card shadow-sm">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Filter size={15} className="text-accent" />
            <span>1. Filter Export Scope</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base text-xs h-10 shadow-2xs rounded-lg cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">From Request Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-base text-xs h-10 shadow-2xs rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">To Request Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-base text-xs h-10 shadow-2xs rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Column Selection Card from Active Export Profile */}
      <div className="glass-panel p-5 sm:p-6 space-y-4 bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders size={15} className="text-accent" />
              <span>2. Columns (Based on Active Export Profile)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Column ordering and defaults are synchronized with the system's Export Profile settings.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <button
              onClick={selectAllCols}
              className="btn-ghost text-xs py-1 text-accent font-medium"
            >
              Select All
            </button>
            <span className="text-border">|</span>
            <button
              onClick={resetToProfileDefaults}
              className="btn-ghost text-xs py-1 text-muted-foreground flex items-center gap-1"
              title="Reset to profile default enabled columns"
            >
              <RotateCcw size={12} />
              <span>Reset to Profile Defaults</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {exportColumns.map((col, idx) => {
            const isSelected = selectedColumns.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/10 border-accent text-accent font-semibold shadow-2xs"
                    : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                    isSelected
                      ? "bg-accent border-accent text-white"
                      : "border-border bg-card"
                  }`}
                >
                  {isSelected && <Check size={11} className="stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-muted-foreground font-mono-code mr-1.5 text-[10px]">
                    #{idx + 1}
                  </span>
                  <span>{col.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Section with Dynamic Profile Columns */}
      <div className="glass-panel p-5 sm:p-6 space-y-4 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye size={15} className="text-accent" />
              <span>3. Live Export Preview ({filtered.length} matching rows · {activeColumnsInOrder.length} columns)</span>
            </h2>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || activeColumnsInOrder.length === 0}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Generate File</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No requests found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg max-h-80">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/70 border-b border-border font-semibold text-[11px] text-muted-foreground select-none">
                  {activeColumnsInOrder.map((col) => (
                    <th key={col.key} className="py-2.5 px-3 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.slice(0, 10).map((r) => {
                  const psfMasked = isRequester && REQUESTER_MASKED_STATUS_KEYS.includes(r.status);
                  return (
                    <tr key={r.id} className="table-row-hover">
                      {activeColumnsInOrder.map((col) => {
                        const val = getFieldValue(r, col.key, psfMasked);
                        if (col.key === "status") {
                          return (
                            <td key={col.key} className="py-2 px-3 whitespace-nowrap">
                              <StatusBadge status={r.status} size="sm" />
                            </td>
                          );
                        }
                        if (col.key === "request_no") {
                          return (
                            <td key={col.key} className="py-2 px-3 font-mono-code font-bold text-foreground whitespace-nowrap">
                              {val}
                            </td>
                          );
                        }
                        return (
                          <td key={col.key} className="py-2 px-3 max-w-[200px] truncate text-foreground/90 whitespace-nowrap">
                            {val || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
