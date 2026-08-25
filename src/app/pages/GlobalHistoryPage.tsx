import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { ActionType } from "../mock/mockAuditLogs";
import {
  Search,
  Filter,
  History,
  X,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

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

  const hasActiveFilters = Boolean(search || actionFilter || deptFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History size={22} className="text-accent" />
          <span>Global Audit History</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Full audit trail of field modifications, workflow transitions, and autofill actions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 space-y-3 bg-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Request No, Actor, Field..."
              className="input-base pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionType | "")}
            className="input-base sm:w-44 text-xs"
          >
            <option value="">All Action Types</option>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input-base sm:w-36 text-xs"
          >
            <option value="">All Depts</option>
            <option value="GNTC">GNTC</option>
            <option value="MFG">MFG</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
              <SlidersHorizontal size={12} /> Active Filters:
            </span>

            {actionFilter && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 rounded-md text-[11px]">
                Action: {actionFilter.replace(/_/g, " ")}
                <button onClick={() => setActionFilter("")} className="hover:opacity-75">
                  <X size={12} />
                </button>
              </span>
            )}

            {deptFilter && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 rounded-md text-[11px]">
                Dept: {deptFilter}
                <button onClick={() => setDeptFilter("")} className="hover:opacity-75">
                  <X size={12} />
                </button>
              </span>
            )}

            {search && (
              <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 rounded-md text-[11px]">
                Query: "{search}"
                <button onClick={() => setSearch("")} className="hover:opacity-75">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setSearch("");
                setActionFilter("");
                setDeptFilter("");
              }}
              className="text-accent hover:underline text-[11px] font-semibold ml-auto flex items-center gap-1"
            >
              <RefreshCw size={11} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Timeline Container */}
      <div className="glass-panel p-6 bg-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Activity Log Stream
          </div>
          <span className="text-xs text-muted-foreground">
            Total entries: <strong className="text-foreground">{visibleLogs.length}</strong>
          </span>
        </div>

        <AuditTimeline logs={visibleLogs} />
      </div>
    </div>
  );
}
