import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { RequestsTable } from "../components/dashboard/RequestsTable";
import { RequestStatus } from "../mock/mockRequests";
import { Search, Plus, Download } from "lucide-react";

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { requests, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [setupOwnerRoleFilter, setSetupOwnerRoleFilter] = useState("");

  const visibleRequests = useMemo(() => {
    let list = requests;

    // Role-based filtering
    if (currentUser?.role === "requester") {
      list = list.filter((r) => r.requester === currentUser.username);
    } else if (currentUser?.role === "setup_owner") {
      // Pre-filtered to pending by default
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestNo.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.requesterData.probecard_name ?? "").toLowerCase().includes(q) ||
          (r.requesterData.reference_psf_name ?? "").toLowerCase().includes(q) ||
          (r.psfCreatedData.psf_setup_file_name ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (productTypeFilter) {
      list = list.filter((r) => r.productType === productTypeFilter);
    }
    if (setupOwnerRoleFilter) {
      list = list.filter((r) => r.setupOwnerRole === setupOwnerRoleFilter);
    }

    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [requests, currentUser, search, statusFilter, productTypeFilter, setupOwnerRoleFilter]);

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
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            {currentUser?.role === "requester"
              ? "Your PSF requests"
              : `All PSF requests · ${visibleRequests.length} shown`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(currentUser?.role === "requester" || currentUser?.role === "admin") && (
            <button
              onClick={() => onNavigate("/requests/new")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Plus size={16} /> New Request
            </button>
          )}
          <button
            onClick={() => onNavigate("/requests/export")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards
        requests={
          currentUser?.role === "requester"
            ? requests.filter((r) => r.requester === currentUser.username)
            : requests
        }
        onFilter={setStatusFilter}
        activeFilter={statusFilter}
      />

      {/* Search & filters */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 16,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, PSF name, probecard..."
            style={{ ...inputStyle, paddingLeft: 32, width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <select
          value={productTypeFilter}
          onChange={(e) => setProductTypeFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Product Types</option>
          <option>New Product</option>
          <option>Transfer Product</option>
          <option>Existing Product</option>
        </select>
        <select
          value={setupOwnerRoleFilter}
          onChange={(e) => setSetupOwnerRoleFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Departments</option>
          <option value="GNTC">GNTC</option>
          <option value="MFG">MFG</option>
        </select>
        {(statusFilter || productTypeFilter || setupOwnerRoleFilter || search) && (
          <button
            onClick={() => {
              setStatusFilter(null);
              setProductTypeFilter("");
              setSetupOwnerRoleFilter("");
              setSearch("");
            }}
            style={{
              padding: "8px 12px",
              background: "var(--muted)",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--muted-foreground)",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}
      >
        <RequestsTable
          requests={visibleRequests}
          onOpen={(id) => onNavigate(`/requests/${id}`)}
          userRole={currentUser?.role ?? "requester"}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted-foreground)" }}>
        Showing {visibleRequests.length} of {requests.length} requests
      </div>
    </div>
  );
}
