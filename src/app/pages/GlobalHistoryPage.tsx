import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AuditTable } from "../components/history/AuditTable";
import { ActionType } from "../mock/mockAuditLogs";
import {
  Search,
  History,
  X,
  RotateCcw,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionType | "">("");
  const [deptFilter, setDeptFilter] = useState("");

  // Keyboard shortcut listener (Ctrl+K or / to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          (l.newValue ?? "").toLowerCase().includes(q) ||
          (l.reason ?? "").toLowerCase().includes(q)
      );
    }
    if (actionFilter) logs = logs.filter((l) => l.actionType === actionFilter);
    if (deptFilter) logs = logs.filter((l) => l.changedByDepartment === deptFilter);

    return logs.sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }, [auditLogs, currentUser, requests, search, actionFilter, deptFilter]);

  const activeFilterCount = [
    Boolean(search.trim()),
    Boolean(actionFilter),
    Boolean(deptFilter),
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearch("");
    setActionFilter("");
    setDeptFilter("");
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-2xs">
            <History size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Global Audit History
            </h1>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel overflow-hidden bg-card">
        {/* Search & Filter Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-card/60">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Command-style Search Bar */}
            <div className="relative flex-1 group">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    searchInputRef.current?.blur();
                  }
                }}
                placeholder="Search by request no, actor, field label, value, reason..."
                className="input-base input-with-icon input-with-clear text-xs sm:text-sm h-11 shadow-2xs border-border/80 group-focus-within:border-accent group-focus-within:ring-2 group-focus-within:ring-accent/20 transition-all rounded-lg"
              />

              {/* Right indicators inside search bar */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {search ? (
                  <button
                    onClick={() => {
                      setSearch("");
                      searchInputRef.current?.focus();
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                    title="Clear search (Esc)"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-secondary/80 border border-border rounded pointer-events-none select-none shadow-2xs">
                    Ctrl K
                  </kbd>
                )}
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* Action Type */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActionType | "")}
                  className="input-base text-xs h-11 min-w-[165px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Action Types</option>
                  {ACTION_TYPES.map((a) => (
                    <option key={a.type} value={a.type}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="input-base text-xs h-11 min-w-[115px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Depts</option>
                  <option value="GNTC">GNTC</option>
                  <option value="MFG">MFG</option>
                </select>
              </div>

              {/* Fixed Clear Filter Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
                className={`h-11 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-all ${
                  activeFilterCount > 0
                    ? "border-accent/40 bg-accent text-white hover:bg-accent/90 cursor-pointer shadow-xs"
                    : "border-border/60 bg-secondary/30 text-muted-foreground/40 cursor-not-allowed"
                }`}
                title={activeFilterCount > 0 ? "Clear all active filters" : "No active filters"}
              >
                <RotateCcw size={13} className={activeFilterCount > 0 ? "transition-transform group-hover:-rotate-45" : ""} />
                <span className="hidden sm:inline">Clear Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audit Data Table */}
        <AuditTable
          logs={visibleLogs}
          onOpenRequest={(reqId) => onNavigate(`/requests/${reqId}`)}
        />
      </div>
    </div>
  );
}

