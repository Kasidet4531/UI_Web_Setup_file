import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/requests/StatusBadge";
import {
  Download,
  Shield,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Filter,
  Check,
  Eye,
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

const AVAILABLE_COLUMNS = [
  { id: "requestNo", label: "Request No." },
  { id: "productType", label: "Product Type" },
  { id: "title", label: "Title" },
  { id: "referencePsf", label: "Reference PSF" },
  { id: "probecard", label: "Probecard Name" },
  { id: "psfOutput", label: "PSF Setup File" },
  { id: "status", label: "Status" },
  { id: "priority", label: "Priority" },
  { id: "dueDate", label: "Due Date" },
  { id: "requester", label: "Requester" },
  { id: "setupOwner", label: "Setup Owner" },
  { id: "dept", label: "Department" },
];

export function ExportPage({ onNavigate }: ExportPageProps) {
  const { requests, currentUser, statuses } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.map((c) => c.id)
  );
  const [exported, setExported] = useState(false);

  const isRequester = currentUser?.role === "requester";

  const filtered = requests.filter((r) => {
    if (isRequester && r.requester !== currentUser?.username) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (fromDate && r.requestDate < fromDate) return false;
    if (toDate && r.requestDate > toDate) return false;
    return true;
  });

  const toggleColumn = (id: string) => {
    if (selectedColumns.includes(id)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns((cols) => cols.filter((c) => c !== id));
      }
    } else {
      setSelectedColumns((cols) => [...cols, id]);
    }
  };

  const selectAllCols = () => setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.id));
  const deselectAllCols = () => setSelectedColumns(["requestNo", "title", "status"]);

  const handleExport = () => {
    const rows = filtered.map((r) => {
      const psfMasked =
        isRequester && REQUESTER_MASKED_STATUS_KEYS.includes(r.status);

      const obj: Record<string, string> = {};
      if (selectedColumns.includes("requestNo")) obj["Request No."] = r.requestNo;
      if (selectedColumns.includes("productType")) obj["Product Type"] = r.productType;
      if (selectedColumns.includes("title")) obj["Title"] = r.title;
      if (selectedColumns.includes("referencePsf"))
        obj["Reference PSF Name"] = r.requesterData.reference_psf_name ?? "";
      if (selectedColumns.includes("probecard"))
        obj["Probecard Name"] = r.requesterData.probecard_name ?? "";
      if (selectedColumns.includes("psfOutput"))
        obj["PSF Setup File Name"] = psfMasked
          ? "N/A (Pending Setup)"
          : r.psfCreatedData.psf_setup_file_name ?? "";
      if (selectedColumns.includes("status")) obj["Status"] = r.status;
      if (selectedColumns.includes("priority")) obj["Priority"] = r.priority;
      if (selectedColumns.includes("dueDate")) obj["Due Date"] = r.dueDate;
      if (selectedColumns.includes("requester")) obj["Requester"] = r.requesterName;
      if (selectedColumns.includes("setupOwner"))
        obj["Setup Owner"] = r.setupOwnerName ?? "";
      if (selectedColumns.includes("dept"))
        obj["Setup Owner Dept."] = r.setupOwnerRole ?? "";
      return obj;
    });

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
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("/dashboard")}
            className="btn-ghost text-xs py-1.5 px-2.5"
          >
            <ArrowLeft size={15} />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
            <h1 className="text-base font-bold text-foreground">
              Export PSF Requests to Excel / CSV
            </h1>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 shadow-sm disabled:opacity-50"
        >
          <Download size={15} />
          <span>{exported ? "Downloaded File!" : `Export ${filtered.length} Requests`}</span>
        </button>
      </div>

      {/* Requester Masking Notice */}
      {isRequester && (
        <div className="glass-panel p-4 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs">
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
      <div className="glass-panel p-6 space-y-5 bg-card">
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
              className="input-base text-xs"
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
              className="input-base text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">To Request Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </div>

      {/* Column Selection Card */}
      <div className="glass-panel p-6 space-y-4 bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              2. Select Columns to Include
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose which specification fields will be included in the exported spreadsheet.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAllCols}
              className="btn-ghost text-xs py-1 text-accent font-medium"
            >
              Select All
            </button>
            <span className="text-border">|</span>
            <button
              onClick={deselectAllCols}
              className="btn-ghost text-xs py-1 text-muted-foreground"
            >
              Reset Default
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {AVAILABLE_COLUMNS.map((col) => {
            const isSelected = selectedColumns.includes(col.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => toggleColumn(col.id)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all ${
                  isSelected
                    ? "bg-accent-light border-accent text-accent font-semibold shadow-2xs"
                    : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    isSelected
                      ? "bg-accent border-accent text-white"
                      : "border-border bg-card"
                  }`}
                >
                  {isSelected && <Check size={11} className="stroke-[3]" />}
                </div>
                <span className="truncate">{col.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Section */}
      <div className="glass-panel p-6 space-y-4 bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye size={15} className="text-accent" />
              <span>3. Live Export Preview ({filtered.length} matching rows)</span>
            </h2>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 px-3"
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
          <div className="overflow-x-auto border border-border rounded-lg max-h-72">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/60 border-b border-border font-semibold text-[11px] text-muted-foreground">
                  <th className="p-2.5 whitespace-nowrap">Request No</th>
                  <th className="p-2.5 whitespace-nowrap">Title</th>
                  <th className="p-2.5 whitespace-nowrap">Product</th>
                  <th className="p-2.5 whitespace-nowrap">Probecard</th>
                  <th className="p-2.5 whitespace-nowrap">Status</th>
                  <th className="p-2.5 whitespace-nowrap">Requester</th>
                  <th className="p-2.5 whitespace-nowrap">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.slice(0, 8).map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30">
                    <td className="p-2.5 font-mono-code font-bold">{r.requestNo}</td>
                    <td className="p-2.5 max-w-[200px] truncate">{r.title}</td>
                    <td className="p-2.5 whitespace-nowrap">{r.productType}</td>
                    <td className="p-2.5 whitespace-nowrap">{r.requesterData?.probecard_name || "—"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="p-2.5 whitespace-nowrap">{r.requesterName}</td>
                    <td className="p-2.5 whitespace-nowrap">{r.dueDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
