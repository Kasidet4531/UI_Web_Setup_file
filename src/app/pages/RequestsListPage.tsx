import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { RequestsTable } from "../components/dashboard/RequestsTable";
import { RequestStatus } from "../mock/mockRequests";
import {
  Plus,
  Search,
  FileText,
  X,
  RotateCcw,
} from "lucide-react";

interface RequestsListPageProps {
  onNavigate: (path: string) => void;
}

export function RequestsListPage({ onNavigate }: RequestsListPageProps) {
  const { requests, currentUser, statuses } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");
  const [deptFilter, setDeptFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [fabFilter, setFabFilter] = useState("");

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

  // Base list based on current user role
  const baseRequests = useMemo(() => {
    if (currentUser?.role === "requester") {
      return requests.filter((r) => r.requester === currentUser.username);
    }
    return requests;
  }, [requests, currentUser]);

  // Filtered requests list
  const visibleRequests = useMemo(() => {
    let list = baseRequests;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestNo.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.requesterData?.product ?? "").toLowerCase().includes(q) ||
          (r.requesterData?.probecard_name ?? "").toLowerCase().includes(q) ||
          (r.requesterData?.reference_psf_name ?? "").toLowerCase().includes(q) ||
          (r.psfCreatedData?.psf_setup_file_name ?? "").toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q) ||
          (r.setupOwnerName ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (deptFilter) list = list.filter((r) => r.setupOwnerRole === deptFilter);
    if (productTypeFilter) list = list.filter((r) => r.productType === productTypeFilter);
    if (priorityFilter) list = list.filter((r) => r.priority === priorityFilter);
    if (fabFilter) list = list.filter((r) => r.requesterData?.wafer_fab === fabFilter);

    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [
    baseRequests,
    search,
    statusFilter,
    deptFilter,
    productTypeFilter,
    priorityFilter,
    fabFilter,
  ]);

  const activeFilterCount = [
    Boolean(search.trim()),
    Boolean(statusFilter),
    Boolean(deptFilter),
    Boolean(productTypeFilter),
    Boolean(priorityFilter),
    Boolean(fabFilter),
  ].filter(Boolean).length;

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setDeptFilter("");
    setProductTypeFilter("");
    setPriorityFilter("");
    setFabFilter("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-2xs">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              All PSF Requests
            </h1>
          </div>
        </div>

        {(currentUser?.role === "requester" || currentUser?.role === "admin") && (
          <button
            onClick={() => onNavigate("/requests/new")}
            className="btn-primary shadow-sm h-10 px-4 gap-2"
          >
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      {/* Main Search & Filter Card */}
      <div className="glass-panel overflow-hidden">
        {/* Search Input & Advanced Filters Toolbar */}
        <div className="p-3.5 sm:p-4 bg-card space-y-3">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
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
                placeholder="Search request no, product, title, probecard, PSF file, owner..."
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

            {/* Filter Dropdowns Grid */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* Status */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "")}
                  className="input-base text-xs h-11 min-w-[130px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Type */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="input-base text-xs h-11 min-w-[145px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Product Types</option>
                  <option value="New Product">New Product</option>
                  <option value="Transfer Product">Transfer Product</option>
                  <option value="Existing Product">Existing Product</option>
                </select>
              </div>

              {/* Department */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="input-base text-xs h-11 min-w-[110px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Depts</option>
                  <option value="GNTC">GNTC</option>
                  <option value="MFG">MFG</option>
                </select>
              </div>

              {/* Priority */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-base text-xs h-11 min-w-[110px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Wafer Fab */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={fabFilter}
                  onChange={(e) => setFabFilter(e.target.value)}
                  className="input-base text-xs h-11 min-w-[110px] cursor-pointer shadow-2xs rounded-lg"
                >
                  <option value="">All Fabs</option>
                  <option value="FAB-ATMC">FAB-ATMC</option>
                  <option value="FAB-OAK">FAB-OAK</option>
                  <option value="FAB-SSMC">FAB-SSMC</option>
                  <option value="FAB-SS1">FAB-SS1</option>
                  <option value="FAB-TSMC-12">FAB-TSMC-12</option>
                  <option value="FAB-TSMC-16">FAB-TSMC-16</option>
                  <option value="FAB-GF-22">FAB-GF-22</option>
                  <option value="FAB-UMC-8">FAB-UMC-8</option>
                </select>
              </div>

              {/* Fixed Clear Filter Button */}
              <button
                type="button"
                onClick={handleReset}
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

        {/* Requests Table */}
        <RequestsTable
          requests={visibleRequests}
          onOpen={(id) => onNavigate(`/requests/${id}`)}
          userRole={currentUser?.role ?? "requester"}
        />
      </div>
    </div>
  );
}
