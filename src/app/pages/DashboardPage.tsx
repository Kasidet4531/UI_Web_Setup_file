import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { SummaryCards, CardFilterType } from "../components/dashboard/SummaryCards";
import { RequestsTable } from "../components/dashboard/RequestsTable";
import {
  Search,
  Plus,
  Download,
  Filter,
  X,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { requests, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [cardFilter, setCardFilter] = useState<CardFilterType>(null);
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [setupOwnerRoleFilter, setSetupOwnerRoleFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const visibleRequests = useMemo(() => {
    let list = requests;

    // Role-based baseline filtering
    if (currentUser?.role === "requester") {
      list = list.filter((r) => r.requester === currentUser.username);
    }

    // Card filter
    const today = new Date().toISOString().split("T")[0];
    const terminalStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];

    if (cardFilter === "MY_OPEN") {
      list = list.filter((r) => {
        const isOpen = !terminalStatuses.includes(r.status);
        if (!isOpen) return false;
        if (!currentUser || currentUser.role === "admin") return true;
        if (currentUser.role === "setup_owner") {
          return r.setupOwner === currentUser.username || r.requester === currentUser.username;
        }
        return r.requester === currentUser.username;
      });
    } else if (cardFilter === "SUBMITTED") {
      list = list.filter((r) => r.status === "SUBMITTED");
    } else if (cardFilter === "SETUP_IN_PROGRESS") {
      list = list.filter((r) => r.status === "SETUP_IN_PROGRESS");
    } else if (cardFilter === "OVERDUE") {
      list = list.filter((r) => r.dueDate < today && !terminalStatuses.includes(r.status));
    }

    // Search query
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

    // Product Type Filter
    if (productTypeFilter) {
      list = list.filter((r) => r.productType === productTypeFilter);
    }

    // Department Filter
    if (setupOwnerRoleFilter) {
      list = list.filter((r) => r.setupOwnerRole === setupOwnerRoleFilter);
    }

    // Priority Filter
    if (priorityFilter) {
      list = list.filter((r) => r.priority === priorityFilter);
    }

    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [
    requests,
    currentUser,
    search,
    cardFilter,
    productTypeFilter,
    setupOwnerRoleFilter,
    priorityFilter,
  ]);

  const hasActiveFilters = Boolean(
    cardFilter || productTypeFilter || setupOwnerRoleFilter || priorityFilter || search
  );

  const handleClearAllFilters = () => {
    setCardFilter(null);
    setProductTypeFilter("");
    setSetupOwnerRoleFilter("");
    setPriorityFilter("");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            PSF Request Dashboard
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {(currentUser?.role === "requester" || currentUser?.role === "admin") && (
            <button
              onClick={() => onNavigate("/requests/new")}
              className="btn-primary shadow-sm"
            >
              <Plus size={16} /> New Request
            </button>
          )}
          <button
            onClick={() => onNavigate("/requests/export")}
            className="btn-secondary"
          >
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Interactive Metric Summary Cards */}
      <SummaryCards
        requests={requests}
        currentUser={currentUser}
        onFilter={setCardFilter}
        activeFilter={cardFilter}
      />

      {/* Main Table Section */}
      <div className="glass-panel overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-card">
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
                placeholder="Search request no, title, probecard, PSF file..."
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
              {/* Product Type */}
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
                className="input-base text-xs h-10 min-w-[155px] cursor-pointer shadow-2xs"
              >
                <option value="">All Product Types</option>
                <option value="New Product">New Product</option>
                <option value="Transfer Product">Transfer Product</option>
                <option value="Existing Product">Existing Product</option>
              </select>

              {/* Department */}
              <select
                value={setupOwnerRoleFilter}
                onChange={(e) => setSetupOwnerRoleFilter(e.target.value)}
                className="input-base text-xs h-10 min-w-[115px] cursor-pointer shadow-2xs"
              >
                <option value="">All Depts</option>
                <option value="GNTC">GNTC</option>
                <option value="MFG">MFG</option>
              </select>

              {/* Priority */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-base text-xs h-10 min-w-[115px] cursor-pointer shadow-2xs"
              >
                <option value="">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Reset filter button if any filter is active */}
              {(productTypeFilter || setupOwnerRoleFilter || priorityFilter || search || cardFilter) && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
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
