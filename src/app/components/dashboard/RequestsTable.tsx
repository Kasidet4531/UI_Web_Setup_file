import React, { useState } from "react";
import { PSFRequest } from "../../mock/mockRequests";
import { StatusBadge } from "../requests/StatusBadge";
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  FileQuestion,
  User,
} from "lucide-react";

interface RequestsTableProps {
  requests: PSFRequest[];
  onOpen: (id: string) => void;
  userRole: string;
}

type SortField = "requestNo" | "title" | "dueDate" | "status" | "priority" | "updatedAt";
type SortOrder = "asc" | "desc";

export function RequestsTable({ requests, onOpen, userRole }: RequestsTableProps) {
  const today = new Date().toISOString().split("T")[0];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let comparison = 0;
    if (sortField === "requestNo") {
      comparison = a.requestNo.localeCompare(b.requestNo);
    } else if (sortField === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === "dueDate") {
      comparison = a.dueDate.localeCompare(b.dueDate);
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === "priority") {
      const priorityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    } else if (sortField === "updatedAt") {
      comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "High":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Medium":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Low":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground mx-auto flex items-center justify-center mb-3">
          <FileQuestion size={24} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No requests found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No PSF requests match your active search or filter criteria. Try clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider select-none">
            <th
              onClick={() => handleSort("requestNo")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Request No</span>
                <ArrowUpDown size={12} className={sortField === "requestNo" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th
              onClick={() => handleSort("title")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Title & Product</span>
                <ArrowUpDown size={12} className={sortField === "title" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th className="py-3 px-3.5">Probecard / PSF Output</th>
            <th
              onClick={() => handleSort("status")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Status</span>
                <ArrowUpDown size={12} className={sortField === "status" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th
              onClick={() => handleSort("priority")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Priority</span>
                <ArrowUpDown size={12} className={sortField === "priority" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th
              onClick={() => handleSort("dueDate")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Due Date</span>
                <ArrowUpDown size={12} className={sortField === "dueDate" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th className="py-3 px-3.5">Owners / Dept</th>
            <th className="py-3 px-3.5 text-right">Action</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border/60">
          {sortedRequests.map((req) => {
            const isOverdue =
              req.dueDate < today &&
              !["COMPLETED", "CANCELLED", "REJECTED"].includes(req.status);

            return (
              <tr
                key={req.id}
                onClick={() => onOpen(req.id)}
                className={`table-row-hover cursor-pointer transition-colors ${
                  isOverdue ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                }`}
              >
                {/* Request No & Form Version */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-code font-bold text-foreground">
                      {req.requestNo}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, req.requestNo)}
                      title="Copy request number"
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      {copiedId === req.requestNo ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                  {req.formVersion < 2 && (
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-1.5 rounded">
                      Legacy v{req.formVersion}
                    </span>
                  )}
                </td>

                {/* Title & Product Type */}
                <td className="py-3.5 px-3.5 max-w-[240px]">
                  <div className="font-medium text-foreground truncate" title={req.title}>
                    {req.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium border border-border">
                      {req.productType || "Standard Product"}
                    </span>
                  </div>
                </td>

                {/* Probecard / PSF Output */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <div className="font-medium text-foreground text-xs">
                    {req.requesterData?.probecard_name || "—"}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-mono-code">
                    {userRole === "requester" &&
                    !["PSF_CREATED", "COMPLETED"].includes(req.status) ? (
                      <span className="italic text-muted-foreground">Pending setup</span>
                    ) : (
                      req.psfCreatedData?.psf_setup_file_name || "—"
                    )}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <StatusBadge status={req.status} size="sm" />
                </td>

                {/* Priority */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadge(
                      req.priority
                    )}`}
                  >
                    {req.priority}
                  </span>
                </td>

                {/* Due Date & Overdue Tag */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isOverdue
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : "text-foreground"
                    }`}
                  >
                    <Calendar size={13} className={isOverdue ? "text-rose-500" : "text-muted-foreground"} />
                    <span>{req.dueDate || "—"}</span>
                  </div>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      <AlertCircle size={10} /> Overdue
                    </span>
                  )}
                </td>

                {/* Owners / Dept */}
                <td className="py-3.5 px-3.5 whitespace-nowrap text-[11px]">
                  <div className="text-foreground font-medium flex items-center gap-1">
                    <User size={11} className="text-muted-foreground" />
                    <span>{req.requesterName}</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>{req.setupOwnerName ? `Setup: ${req.setupOwnerName}` : "Unassigned"}</span>
                    {req.setupOwnerRole && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          req.setupOwnerRole === "GNTC"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {req.setupOwnerRole}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(req.id);
                    }}
                    className="btn-secondary text-xs py-1 px-2.5 hover:bg-accent hover:text-white hover:border-transparent transition-all"
                  >
                    <span>View</span>
                    <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
