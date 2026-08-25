import React from "react";
import { AuditLog } from "../../mock/mockAuditLogs";
import {
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
  ArrowRight,
  ChevronRight,
  Calendar,
} from "lucide-react";

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeBg: string; textBadge: string }
> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={12} />,
    badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    textBadge: "Request Created",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={12} />,
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    textBadge: "Status Change",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={12} />,
    badgeBg: "bg-secondary text-foreground border-border",
    textBadge: "Field Update",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment Uploaded",
    icon: <Upload size={12} />,
    badgeBg: "bg-secondary text-foreground border-border",
    textBadge: "Attachment",
  },
  DELETE_ATTACHMENT: {
    label: "Attachment Deleted",
    icon: <Trash2 size={12} />,
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    textBadge: "Deleted",
  },
  USE_AUTOFILL: {
    label: "Auto-fill Applied",
    icon: <Sparkles size={12} />,
    badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    textBadge: "Auto-fill",
  },
  MARK_PSF_CREATED: {
    label: "PSF Marked Created",
    icon: <CheckCircle size={12} />,
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    textBadge: "PSF Created",
  },
  EXPORT_EXCEL: {
    label: "Excel Exported",
    icon: <FileDown size={12} />,
    badgeBg: "bg-secondary text-foreground border-border",
    textBadge: "Export",
  },
  ADMIN_OVERRIDE: {
    label: "Admin Override",
    icon: <Shield size={12} />,
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    textBadge: "Override",
  },
};

interface AuditTimelineProps {
  logs: AuditLog[];
  compact?: boolean;
  onSelectRequest?: (requestId: string) => void;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return iso;
  }
}

function formatDateHeader(iso: string) {
  try {
    const d = new Date(iso);
    const today = new Date().toISOString().split("T")[0];
    const itemDate = d.toISOString().split("T")[0];

    const formatted = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    });

    if (itemDate === today) {
      return `Today · ${formatted}`;
    }
    return formatted;
  } catch {
    return iso;
  }
}

export function AuditTimeline({ logs, onSelectRequest }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
        No audit activity found matching your filters.
      </div>
    );
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = log.changedAt ? log.changedAt.split("T")[0] : "Other";
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);

  const dateKeys = Object.keys(groupedLogs).sort((a, b) => (b > a ? 1 : -1));

  return (
    <div className="space-y-6">
      {dateKeys.map((dateKey) => {
        const dateLogs = groupedLogs[dateKey];
        const headerTitle = formatDateHeader(dateLogs[0].changedAt);

        return (
          <div key={dateKey} className="space-y-2.5">
            {/* Date Group Header */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pb-1">
              <Calendar size={13} className="text-accent" />
              <span>{headerTitle}</span>
              <span className="text-[11px] font-normal text-muted-foreground/80">
                ({dateLogs.length} {dateLogs.length === 1 ? "activity" : "activities"})
              </span>
              <div className="flex-1 h-[1px] bg-border ml-2" />
            </div>

            {/* List Table of Logs */}
            <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border/60 shadow-2xs">
              {dateLogs.map((log) => {
                const cfg = ACTION_CONFIG[log.actionType] ?? {
                  label: log.actionType,
                  icon: <Edit3 size={12} />,
                  badgeBg: "bg-secondary text-foreground border-border",
                  textBadge: "Action",
                };

                const initials = (log.changedByName || log.changedBy || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={log.id}
                    className="p-3 sm:px-4 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors group text-xs"
                  >
                    {/* Left & Middle: Time + Action + Request + Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
                      {/* Time */}
                      <div className="flex items-center gap-1 text-[11px] font-mono-code text-muted-foreground shrink-0 w-14">
                        <Clock size={11} className="text-muted-foreground/70" />
                        <span>{formatTime(log.changedAt)}</span>
                      </div>

                      {/* Action Badge */}
                      <div className="shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.badgeBg}`}
                        >
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </span>
                      </div>

                      {/* Request No Pill */}
                      {log.requestNo && (
                        <button
                          type="button"
                          onClick={() => onSelectRequest && onSelectRequest(log.requestId)}
                          className={`shrink-0 font-mono-code text-[11px] px-2 py-0.5 rounded bg-secondary text-foreground border border-border font-medium ${
                            onSelectRequest ? "hover:border-accent hover:text-accent hover:bg-accent/5 cursor-pointer" : ""
                          }`}
                          title={onSelectRequest ? "Click to view request details" : undefined}
                        >
                          {log.requestNo}
                        </button>
                      )}

                      {/* Change Description / Diff */}
                      <div className="text-xs text-foreground min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                        {log.fieldLabel && (
                          <span className="text-muted-foreground">
                            {log.fieldLabel}:
                          </span>
                        )}

                        {/* Value Transition */}
                        {(log.oldValue || log.newValue) ? (
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            {log.oldValue ? (
                              <span className="px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border font-mono-code text-[11px] line-through">
                                {log.oldValue}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-[11px]">None</span>
                            )}

                            <ArrowRight size={11} className="text-muted-foreground/60 shrink-0" />

                            {log.newValue ? (
                              <span className="px-1.5 py-0.2 rounded bg-accent/10 text-accent font-semibold border border-accent/20 font-mono-code text-[11px]">
                                {log.newValue}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-[11px]">Cleared</span>
                            )}
                          </div>
                        ) : log.reason ? (
                          <span className="italic text-muted-foreground text-[11px]">
                            "{log.reason}"
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            Modified by requester/setup owner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actor & Open Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                      {/* Actor Pill */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <div className="w-5 h-5 rounded-full bg-secondary text-muted-foreground border border-border font-bold text-[9px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-foreground">
                          {log.changedByName || log.changedBy}
                        </span>
                        {log.changedByDepartment && (
                          <span className="bg-secondary text-muted-foreground px-1.5 py-0.2 rounded text-[10px] font-semibold border border-border">
                            {log.changedByDepartment}
                          </span>
                        )}
                      </div>

                      {/* View Link Arrow */}
                      {onSelectRequest && (
                        <button
                          type="button"
                          onClick={() => onSelectRequest(log.requestId)}
                          className="p-1 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                          title="View Request"
                        >
                          <ChevronRight size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
