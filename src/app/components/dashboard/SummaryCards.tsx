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
      activeBg: "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30 shadow-lg scale-[1.02]",
      dotColor: "bg-blue-500 ring-blue-500/20",
      countColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "SUBMITTED" as const,
      label: "Waiting for Setup",
      description: "Submitted and awaiting setup owner pickup",
      count: counts.submitted,
      icon: <Clock size={20} className="text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/50",
      activeBg: "bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30 shadow-lg scale-[1.02]",
      dotColor: "bg-amber-500 ring-amber-500/20",
      countColor: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "SETUP_IN_PROGRESS" as const,
      label: "Setup In Progress",
      description: "Currently in engineering setup workflow",
      count: counts.inProgress,
      icon: <Wrench size={20} className="text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/50",
      activeBg: "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg scale-[1.02]",
      dotColor: "bg-indigo-500 ring-indigo-500/20",
      countColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "OVERDUE" as const,
      label: "Overdue Actions",
      description: "Past target due date and not completed",
      count: counts.overdue,
      icon: <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/50",
      activeBg: "bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/30 shadow-lg scale-[1.02]",
      dotColor: "bg-rose-500 ring-rose-500/20",
      countColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
        const isDimmed = activeFilter !== null && !isActive;

        return (
          <button
            key={card.key}
            onClick={() => onFilter(isActive ? null : card.key)}
            className={`glass-panel p-4 text-left transition-all duration-200 relative group cursor-pointer ${
              isActive
                ? `${card.activeBg} z-10`
                : isDimmed
                ? "opacity-60 hover:opacity-100 hover:border-border-strong hover:shadow-md"
                : "hover:border-border-strong hover:shadow-md"
            }`}
          >
            {/* Top row: Icon & Glowing Indicator when Active */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${card.bgIcon}`}
              >
                {card.icon}
              </div>
              {isActive && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ring-4 ${card.dotColor} animate-pulse`}
                  title="Selected"
                />
              )}
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
