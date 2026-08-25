import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { ActionType } from "../mock/mockAuditLogs";
import {
  Search,
  History,
  X,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface GlobalHistoryPageProps {
  onNavigate: (path: string) => void;
}

const ACTION_TYPES: { type: ActionType; label: string }[] = [
  { type: "CREATE_REQUEST", label: "Request Created" },
  { type: "CHANGE_STATUS", label: "Status Changed" },
  { type: "UPDATE_FIELD", label: "Field Updated" },
  { type: "MARK_PSF_CREATED", label: "PSF Marked Created" },
  { type: "USE_AUTOFILL", label: "Auto-fill Applied" },
  { type: "UPLOAD_ATTACHMENT", label: "Attachment Uploaded" },
  { type: "DELETE_ATTACHMENT", label: "Attachment Deleted" },
  { type: "EXPORT_EXCEL", label: "Excel Exported" },
  { type: "ADMIN_OVERRIDE", label: "Admin Override" },
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
          (l.fieldLabel ?? "").toLowerCase().includes(q) ||
          (l.oldValue ?? "").toLowerCase().includes(q) ||
          (l.newValue ?? "").toLowerCase().includes(q)
      );
    }
    if (actionFilter) logs = logs.filter((l) => l.actionType === actionFilter);
    if (deptFilter) logs = logs.filter((l) => l.changedByDepartment === deptFilter);

    return logs.sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }, [auditLogs, currentUser, requests, search, actionFilter, deptFilter]);

  const hasActiveFilters = Boolean(search || actionFilter || deptFilter);

  const handleClearFilters = () => {
    setSearch("");
    setActionFilter("");
    setDeptFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <History size={22} className="text-accent" />
            <span>Global Audit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Full audit trail of field modifications, workflow transitions, and autofill actions
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel overflow-hidden bg-card">
        {/* Search & Filter Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-card/60">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Request No, Actor, Field, or Values..."
                className="input-base input-with-icon input-with-clear text-xs sm:text-sm h-10 shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* Action Type */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as ActionType | "")}
                className="input-base text-xs h-10 min-w-[170px] cursor-pointer shadow-2xs"
              >
                <option value="">All Action Types</option>
                {ACTION_TYPES.map((a) => (
                  <option key={a.type} value={a.type}>
                    {a.label}
                  </option>
                ))}
              </select>

              {/* Department */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="input-base text-xs h-10 min-w-[115px] cursor-pointer shadow-2xs"
              >
                <option value="">All Depts</option>
                <option value="GNTC">GNTC</option>
                <option value="MFG">MFG</option>
              </select>

              {/* Reset filter button if any filter is active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-10 px-3 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs"
                  title="Reset all filters"
                >
                  <RefreshCw size={13} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Activity Stream Section */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Activity Log Stream
              </span>
              <span className="text-[11px] font-mono-code font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                {visibleLogs.length} events
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              Click request pill to view request details
            </span>
          </div>

          <AuditTimeline
            logs={visibleLogs}
            onSelectRequest={(reqId) => onNavigate(`/requests/${reqId}`)}
          />
        </div>
      </div>
    </div>
  );
}
