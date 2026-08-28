import React, { useState, useMemo, useEffect } from "react";
import { AuditLog, ActionType } from "../../mock/mockAuditLogs";
import {
  ArrowUpDown,
  Calendar,
  Copy,
  Check,
  FileQuestion,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  ArrowRightLeft,
  Edit3,
  Upload,
  Trash2,
  Sparkles,
  FileDown,
  Shield,
  CheckCircle,
  Clock,
} from "lucide-react";

interface AuditTableProps {
  logs: AuditLog[];
  onOpenRequest: (requestId: string) => void;
}

type SortField = "changedAt" | "requestNo" | "actionType" | "changedByName";
type SortOrder = "asc" | "desc";

const ACTION_CONFIG: Record<
  ActionType,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={12} />,
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={12} />,
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={12} />,
    badgeClass: "bg-secondary text-foreground border-border",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment Uploaded",
    icon: <Upload size={12} />,
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  },
  DELETE_ATTACHMENT: {
    label: "Attachment Deleted",
    icon: <Trash2 size={12} />,
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  USE_AUTOFILL: {
    label: "Auto-fill Applied",
    icon: <Sparkles size={12} />,
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  MARK_PSF_CREATED: {
    label: "PSF Created",
    icon: <CheckCircle size={12} />,
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  EXPORT_EXCEL: {
    label: "Excel Exported",
    icon: <FileDown size={12} />,
    badgeClass: "bg-secondary text-foreground border-border",
  },
  ADMIN_OVERRIDE: {
    label: "Admin Override",
    icon: <Shield size={12} />,
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return iso;
  }
}

export function AuditTable({ logs, onOpenRequest }: AuditTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("changedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Reset page when dataset or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [logs.length, sortField, sortOrder]);

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

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      let comparison = 0;
      if (sortField === "changedAt") {
        comparison = new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
      } else if (sortField === "requestNo") {
        comparison = a.requestNo.localeCompare(b.requestNo);
      } else if (sortField === "actionType") {
        comparison = a.actionType.localeCompare(b.actionType);
      } else if (sortField === "changedByName") {
        comparison = a.changedByName.localeCompare(b.changedByName);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [logs, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, safeCurrentPage, pageSize]);

  const startIdx = (safeCurrentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, sortedLogs.length);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground mx-auto flex items-center justify-center mb-3">
          <FileQuestion size={24} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No audit events found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No audit history matches your active search or filter criteria. Try clearing some filters.
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
              onClick={() => handleSort("changedAt")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Date & Time</span>
                <ArrowUpDown size={12} className={sortField === "changedAt" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
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
              onClick={() => handleSort("actionType")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Action</span>
                <ArrowUpDown size={12} className={sortField === "actionType" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
            <th className="py-3 px-3.5">Target / Field</th>
            <th className="py-3 px-3.5">Modification Details</th>
            <th
              onClick={() => handleSort("changedByName")}
              className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                <span>Performed By</span>
                <ArrowUpDown size={12} className={sortField === "changedByName" ? "text-accent" : "opacity-40"} />
              </div>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border/60">
          {paginatedLogs.map((log) => {
            const config = ACTION_CONFIG[log.actionType] || {
              label: log.actionType,
              icon: <Clock size={12} />,
              badgeClass: "bg-secondary text-foreground border-border",
            };

            const hasValueChange = Boolean(log.oldValue || log.newValue);

            return (
              <tr
                key={log.id}
                onClick={() => onOpenRequest(log.requestId)}
                className="table-row-hover group cursor-pointer transition-colors"
              >
                {/* Timestamp */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Calendar size={13} className="text-muted-foreground shrink-0" />
                    <span>{formatDateTime(log.changedAt)}</span>
                  </div>
                </td>

                {/* Request No */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-code font-bold text-foreground group-hover:text-accent transition-colors">
                      {log.requestNo}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, log.requestNo)}
                      title="Copy request number"
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      {copiedId === log.requestNo ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </td>

                {/* Action Badge */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${config.badgeClass}`}
                  >
                    {config.icon}
                    <span>{config.label}</span>
                  </span>
                </td>

                {/* Target / Field */}
                <td className="py-3.5 px-3.5 whitespace-nowrap">
                  <span className="font-medium text-foreground text-xs">
                    {log.fieldLabel || log.fieldKey || "General"}
                  </span>
                </td>

                {/* Modification Details */}
                <td className="py-3.5 px-3.5 max-w-[320px]">
                  {hasValueChange ? (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      {log.oldValue && (
                        <span className="line-through text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded text-[11px] font-mono-code border border-border/50 max-w-[120px] truncate" title={log.oldValue}>
                          {log.oldValue}
                        </span>
                      )}
                      {log.oldValue && log.newValue && (
                        <ArrowRight size={11} className="text-muted-foreground shrink-0" />
                      )}
                      {log.newValue && (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded text-[11px] font-mono-code border border-emerald-200 dark:border-emerald-800/60 max-w-[150px] truncate" title={log.newValue}>
                          {log.newValue}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">
                      {log.reason || "Action performed"}
                    </span>
                  )}

                  {log.reason && hasValueChange && (
                    <div className="text-[11px] text-muted-foreground mt-0.5 italic truncate" title={log.reason}>
                      Note: {log.reason}
                    </div>
                  )}
                </td>

                {/* Performed By */}
                <td className="py-3.5 px-3.5 whitespace-nowrap text-[11px]">
                  <div className="text-foreground font-medium flex items-center gap-1">
                    <User size={11} className="text-muted-foreground" />
                    <span>{log.changedByName}</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span className="capitalize">{log.changedByRole.replace("_", " ")}</span>
                    {log.changedByDepartment && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          log.changedByDepartment === "GNTC"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {log.changedByDepartment}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-foreground">{sortedLogs.length > 0 ? startIdx + 1 : 0}</strong>–<strong className="text-foreground">{endIdx}</strong> of{" "}
            <strong className="text-foreground">{sortedLogs.length}</strong> events
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 rounded border border-border bg-background text-foreground text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1 rounded border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                <ChevronsLeft size={13} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1 rounded border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={13} />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`min-w-[26px] h-6 px-1.5 rounded text-xs font-semibold transition-colors ${
                      safeCurrentPage === page
                        ? "bg-accent text-white shadow-2xs"
                        : "border border-border bg-background hover:bg-secondary text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-1 rounded border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight size={13} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1 rounded border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                <ChevronsRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
