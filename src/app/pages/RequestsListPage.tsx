import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { RequestsTable } from "../components/dashboard/RequestsTable";
import { Plus, Search } from "lucide-react";

interface RequestsListPageProps {
  onNavigate: (path: string) => void;
}

export function RequestsListPage({ onNavigate }: RequestsListPageProps) {
  const { requests, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");

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
          (r.requesterData.probecard_name ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [requests, currentUser, search, statusFilter]);

  const { statuses } = useApp();

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>PSF Requests</h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            {visibleRequests.length} requests
          </p>
        </div>
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
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 14,
          marginBottom: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            style={{ ...inputStyle, paddingLeft: 30, width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "")}
          style={inputStyle}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

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
    </div>
  );
}
