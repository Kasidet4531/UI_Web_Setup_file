import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { RequestsTable } from "../components/dashboard/RequestsTable";
import { RequestStatus } from "../mock/mockRequests";
import {
  Plus,
  Search,
  FileText,
  X,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

interface RequestsListPageProps {
  onNavigate: (path: string) => void;
}

export function RequestsListPage({ onNavigate }: RequestsListPageProps) {
  const { requests, currentUser, statuses } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");
  const [deptFilter, setDeptFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");

  const visibleRequests = useMemo(() => {
    let list = requests;
    if (currentUser?.role === "requester") {
      list = list.filter((r) => r.requester === currentUser.username);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestNo.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.requesterData?.probecard_name ?? "").toLowerCase().includes(q) ||
          (r.requesterData?.reference_psf_name ?? "").toLowerCase().includes(q) ||
          (r.psfCreatedData?.psf_setup_file_name ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (deptFilter) list = list.filter((r) => r.setupOwnerRole === deptFilter);
    if (productTypeFilter) list = list.filter((r) => r.productType === productTypeFilter);

    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [requests, currentUser, search, statusFilter, deptFilter, productTypeFilter]);

  const hasActiveFilters = Boolean(search || statusFilter || deptFilter || productTypeFilter);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setDeptFilter("");
    setProductTypeFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText size={22} className="text-accent" />
            <span>All PSF Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {currentUser?.role === "requester"
              ? "Browse all requests created under your account"
              : `System-wide directory of PSF setup specifications · ${visibleRequests.length} matching`}
          </p>
        </div>

        {(currentUser?.role === "requester" || currentUser?.role === "admin") && (
          <button
            onClick={() => onNavigate("/requests/new")}
            className="btn-primary shadow-sm"
          >
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      {/* Filter and Table Panel */}
      <div className="glass-panel overflow-hidden">
        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-border bg-card space-y-3">
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
                placeholder="Search by Request No, Title, Probecard..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "")}
              className="input-base sm:w-40 text-xs"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
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

          {/* Active Filter Bar */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
                <SlidersHorizontal size={12} /> Filtered by:
              </span>

              {statusFilter && (
                <span className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-0.5 rounded-md text-[11px]">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("")} className="hover:opacity-75">
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
                onClick={handleReset}
                className="text-accent hover:underline text-[11px] font-semibold ml-auto flex items-center gap-1"
              >
                <RefreshCw size={11} /> Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <RequestsTable
          requests={visibleRequests}
          onOpen={(id) => onNavigate(`/requests/${id}`)}
          userRole={currentUser?.role ?? "requester"}
        />

        <div className="p-3 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Total results: <strong className="text-foreground">{visibleRequests.length}</strong>
          </span>
          <span className="text-[11px]">Click row to open details</span>
        </div>
      </div>
    </div>
  );
}
