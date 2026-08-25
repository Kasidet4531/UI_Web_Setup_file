import React from "react";
import { PSFRequest } from "../../mock/mockRequests";
import { MockUser } from "../../mock/mockUsers";
import {
  FileText,
  Clock,
  Wrench,
  AlertTriangle,
} from "lucide-react";

export type CardFilterType = "MY_OPEN" | "SUBMITTED" | "SETUP_IN_PROGRESS" | "OVERDUE" | null;

interface SummaryCardsProps {
  requests: PSFRequest[];
  currentUser?: MockUser | null;
  onFilter: (filter: CardFilterType) => void;
  activeFilter: CardFilterType;
}

export function SummaryCards({ requests, currentUser, onFilter, activeFilter }: SummaryCardsProps) {
  const today = new Date().toISOString().split("T")[0];
  const terminalStatuses = ["COMPLETED", "CANCELLED", "REJECTED"];

  const counts = {
    myOpen: requests.filter((r) => {
      const isOpen = !terminalStatuses.includes(r.status);
      if (!isOpen) return false;
      if (!currentUser || currentUser.role === "admin") return true;
      if (currentUser.role === "setup_owner") {
        return r.setupOwner === currentUser.username || r.requester === currentUser.username;
      }
      return r.requester === currentUser.username;
    }).length,
    submitted: requests.filter((r) => r.status === "SUBMITTED").length,
    inProgress: requests.filter((r) => r.status === "SETUP_IN_PROGRESS").length,
    overdue: requests.filter(
      (r) => r.dueDate < today && !terminalStatuses.includes(r.status)
    ).length,
  };

  const cards = [
    {
      key: "MY_OPEN" as const,
      label: "My Open Requests",
      description: "Active requests assigned or submitted by you",
      count: counts.myOpen,
      icon: <FileText size={20} className="text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
      color: "#2563eb",
      countColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "SUBMITTED" as const,
      label: "Waiting for Setup",
      description: "Submitted and awaiting setup owner pickup",
      count: counts.submitted,
      icon: <Clock size={20} className="text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/50",
      color: "#d97706",
      countColor: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "SETUP_IN_PROGRESS" as const,
      label: "Setup In Progress",
      description: "Currently in engineering setup workflow",
      count: counts.inProgress,
      icon: <Wrench size={20} className="text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/50",
      color: "#4f46e5",
      countColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "OVERDUE" as const,
      label: "Overdue Actions",
      description: "Past target due date and not completed",
      count: counts.overdue,
      icon: <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/50",
      color: "#e11d48",
      countColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilter(isActive ? null : card.key)}
            style={
              isActive
                ? {
                    borderColor: card.color,
                    borderWidth: "2px",
                    boxShadow: `0 0 0 1px ${card.color}, 0 4px 12px -2px ${card.color}25`,
                  }
                : undefined
            }
            className={`p-4 text-left rounded-2xl transition-all duration-150 relative cursor-pointer bg-card border ${
              isActive
                ? "z-10"
                : "border-border hover:border-border-strong hover:shadow-xs"
            }`}
          >
            {/* Top row: Icon */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform ${card.bgIcon}`}
              >
                {card.icon}
              </div>
            </div>

            {/* Metric Number */}
            <div className={`text-2xl font-bold tracking-tight ${card.countColor}`}>
              {card.count}
            </div>

            {/* Label */}
            <div className="text-xs font-semibold text-foreground mt-1">
              {card.label}
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {card.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
