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
  { label: string; icon: React.ReactNode; badgeBg: string }
> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={11} />,
    badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={11} />,
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={11} />,
    badgeBg: "bg-secondary text-foreground border-border",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment",
    icon: <Upload size={11} />,
    badgeBg: "bg-secondary text-foreground border-border",
  },
  DELETE_ATTACHMENT: {
    label: "Deleted",
    icon: <Trash2 size={11} />,
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  USE_AUTOFILL: {
    label: "Auto-fill",
    icon: <Sparkles size={11} />,
    badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  MARK_PSF_CREATED: {
    label: "PSF Created",
    icon: <CheckCircle size={11} />,
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  EXPORT_EXCEL: {
    label: "Exported",
    icon: <FileDown size={11} />,
    badgeBg: "bg-secondary text-foreground border-border",
  },
  ADMIN_OVERRIDE: {
    label: "Override",
    icon: <Shield size={11} />,
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
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

export function AuditTimeline({ logs, compact = false, onSelectRequest }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
        No audit activity recorded yet.
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. COMPACT MODE: Specially optimized for sidebars in RequestDetailPage
  // ──────────────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border">
        {logs.map((log) => {
          const cfg = ACTION_CONFIG[log.actionType] ?? {
            label: log.actionType,
            icon: <Edit3 size={11} />,
            badgeBg: "bg-secondary text-foreground border-border",
          };

          const initials = (log.changedByName || log.changedBy || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div key={log.id} className="relative group text-xs">
              {/* Spine Dot */}
              <div className="absolute -left-5 top-2.5 w-4 h-4 rounded-full border border-border bg-card text-muted-foreground group-hover:text-accent group-hover:border-accent/40 flex items-center justify-center shadow-2xs z-10">
                {cfg.icon}
              </div>

              {/* Compact Card */}
              <div className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-secondary/20 transition-all space-y-1.5 shadow-2xs">
                {/* Header: Action Badge + Time */}
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${cfg.badgeBg}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>

                  <span className="text-[10px] text-muted-foreground font-mono-code flex items-center gap-0.5">
                    <Clock size={9} />
                    {formatTime(log.changedAt)}
                  </span>
                </div>

                {/* Body: Target Field & Diff */}
                {(log.fieldLabel || log.oldValue || log.newValue || log.reason) && (
                  <div className="space-y-1 text-[11px] pt-0.5">
                    {log.fieldLabel && (
                      <div className="text-muted-foreground leading-tight">
                        <span className="text-foreground font-medium">{log.fieldLabel}</span>
                      </div>
                    )}

                    {/* Diff Pills */}
                    {(log.oldValue || log.newValue) && (
                      <div className="flex items-center gap-1 flex-wrap text-[10px] pt-0.5">
                        {log.oldValue ? (
                          <span className="px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border font-mono-code line-through">
                            {log.oldValue}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}

                        <ArrowRight size={10} className="text-muted-foreground/60 shrink-0" />

                        {log.newValue ? (
                          <span className="px-1.5 py-0.2 rounded bg-accent/10 text-accent font-semibold border border-accent/20 font-mono-code">
                            {log.newValue}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Cleared</span>
                        )}
                      </div>
                    )}

                    {/* Reason Note */}
                    {log.reason && (
                      <div className="text-[10px] italic text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded border border-border/40">
                        "{log.reason}"
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: Actor Info */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/30 text-[10px]">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-secondary text-muted-foreground border border-border font-bold text-[8px] flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {log.changedByName || log.changedBy}
                    </span>
                  </div>

                  {log.changedByDepartment && (
                    <span className="bg-secondary text-muted-foreground px-1 py-0.2 rounded text-[9px] font-semibold border border-border shrink-0">
                      {log.changedByDepartment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. FULL MODE: Used in Global Audit History and Request History Pages
  // ──────────────────────────────────────────────────────────────────────────
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
                  icon: <Edit3 size={11} />,
                  badgeBg: "bg-secondary text-foreground border-border",
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
                            Modified
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
