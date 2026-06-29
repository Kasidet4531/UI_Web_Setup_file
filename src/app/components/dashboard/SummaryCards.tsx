import { PSFRequest, RequestStatus } from "../../mock/mockRequests";
import { FileText, Clock, Wrench, CheckSquare, CheckCircle, AlertTriangle } from "lucide-react";

interface SummaryCardsProps {
  requests: PSFRequest[];
  onFilter: (status: RequestStatus | null) => void;
  activeFilter: RequestStatus | null;
}

interface CardConfig {
  label: string;
  status: RequestStatus | null;
  count: number;
  icon: React.ReactNode;
  bg: string;
  color: string;
}

export function SummaryCards({ requests, onFilter, activeFilter }: SummaryCardsProps) {
  const today = new Date().toISOString().split("T")[0];

  const counts = {
    total: requests.length,
    submitted: requests.filter((r) => r.status === "SUBMITTED").length,
    inProgress: requests.filter((r) => r.status === "SETUP_IN_PROGRESS").length,
    psfCreated: requests.filter((r) => r.status === "PSF_CREATED").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
    overdue: requests.filter(
      (r) =>
        r.dueDate < today &&
        !["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status)
    ).length,
  };

  const cards: CardConfig[] = [
    {
      label: "Total Requests",
      status: null,
      count: counts.total,
      icon: <FileText size={20} />,
      bg: "#f0f4ff",
      color: "#3b5bdb",
    },
    {
      label: "Waiting for Setup",
      status: "SUBMITTED",
      count: counts.submitted,
      icon: <Clock size={20} />,
      bg: "#fff4e5",
      color: "#e67700",
    },
    {
      label: "Setup In Progress",
      status: "SETUP_IN_PROGRESS",
      count: counts.inProgress,
      icon: <Wrench size={20} />,
      bg: "#fef3c7",
      color: "#b45309",
    },
    {
      label: "PSF Created",
      status: "PSF_CREATED",
      count: counts.psfCreated,
      icon: <CheckSquare size={20} />,
      bg: "#d1fae5",
      color: "#065f46",
    },
    {
      label: "Completed",
      status: "COMPLETED",
      count: counts.completed,
      icon: <CheckCircle size={20} />,
      bg: "#dcfce7",
      color: "#15803d",
    },
    {
      label: "Overdue",
      status: null,
      count: counts.overdue,
      icon: <AlertTriangle size={20} />,
      bg: "#fee2e2",
      color: "#991b1b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => {
        const isActive = activeFilter === card.status && card.status !== null;
        return (
          <button
            key={card.label}
            onClick={() =>
              card.status !== null ? onFilter(isActive ? null : card.status) : undefined
            }
            style={{
              background: "var(--card)",
              border: `2px solid ${isActive ? card.color : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "16px",
              cursor: card.status !== null ? "pointer" : "default",
              textAlign: "left",
              transition: "border-color 0.15s",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius)",
                background: card.bg,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              {card.icon}
            </div>
            <div
              style={{ fontSize: 26, fontWeight: 700, color: card.color, lineHeight: 1 }}
            >
              {card.count}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted-foreground)",
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {card.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
