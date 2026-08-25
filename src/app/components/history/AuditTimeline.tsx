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
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; badgeBg: string; lineBorder: string }
> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={13} />,
    color: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    lineBorder: "border-blue-500/40",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={13} />,
    color: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    lineBorder: "border-amber-500/40",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={13} />,
    color: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    lineBorder: "border-sky-500/40",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment Uploaded",
    icon: <Upload size={13} />,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    lineBorder: "border-emerald-500/40",
  },
  DELETE_ATTACHMENT: {
    label: "Attachment Deleted",
    icon: <Trash2 size={13} />,
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    lineBorder: "border-rose-500/40",
  },
  USE_AUTOFILL: {
    label: "Auto-fill Applied",
    icon: <Sparkles size={13} />,
    color: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    lineBorder: "border-purple-500/40",
  },
  MARK_PSF_CREATED: {
    label: "PSF Marked Created",
    icon: <CheckCircle size={13} />,
    color: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    lineBorder: "border-teal-500/40",
  },
  EXPORT_EXCEL: {
    label: "Excel Exported",
    icon: <FileDown size={13} />,
    color: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    lineBorder: "border-cyan-500/40",
  },
  ADMIN_OVERRIDE: {
    label: "Admin Override",
    icon: <Shield size={13} />,
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    lineBorder: "border-rose-500/40",
  },
};

interface AuditTimelineProps {
  logs: AuditLog[];
  compact?: boolean;
  onSelectRequest?: (requestId: string) => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return iso;
  }
}

export function AuditTimeline({ logs, compact = false, onSelectRequest }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
        No audit activity found matching your filters.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-3.5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
      {logs.map((log) => {
        const cfg = ACTION_CONFIG[log.actionType] ?? {
          label: log.actionType,
          icon: <Edit3 size={13} />,
          color: "text-foreground",
          badgeBg: "bg-secondary text-foreground border-border",
          lineBorder: "border-border",
        };

        const initials = (log.changedByName || log.changedBy || "U")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={log.id} className="relative group text-xs">
            {/* Timeline Dot Node */}
            <div
              className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full border bg-card flex items-center justify-center ${cfg.color} shadow-xs z-10 group-hover:scale-110 transition-transform`}
            >
              {cfg.icon}
            </div>

            {/* Stream Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:bg-secondary/30 hover:border-accent/30 transition-all shadow-2xs space-y-2.5">
              {/* Top Row: Action Badge + Request No + Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Action Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badgeBg}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>

                  {/* Request No Link */}
                  {log.requestNo && (
                    <button
                      type="button"
                      onClick={() => onSelectRequest && onSelectRequest(log.requestId)}
                      className={`inline-flex items-center gap-1 font-mono-code text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border ${
                        onSelectRequest ? "hover:border-accent hover:text-accent cursor-pointer" : ""
                      }`}
                      title={onSelectRequest ? "View Request Details" : undefined}
                    >
                      <span>{log.requestNo}</span>
                      {onSelectRequest && <ExternalLink size={10} className="opacity-70" />}
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>{formatDate(log.changedAt)}</span>
                </div>
              </div>

              {/* Middle Section: Change Details */}
              {(log.fieldLabel || log.oldValue || log.newValue || log.reason) && (
                <div className="space-y-1.5 pt-0.5">
                  {/* Field Label */}
                  {log.fieldLabel && (
                    <div className="text-xs text-muted-foreground">
                      Target Field: <span className="font-semibold text-foreground">{log.fieldLabel}</span>
                    </div>
                  )}

                  {/* Value Diff (Before -> After) */}
                  {!compact && (log.oldValue || log.newValue) && (
                    <div className="flex items-center gap-2 flex-wrap text-xs bg-secondary/40 p-2 rounded-lg border border-border/50">
                      {log.oldValue ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-mono-code line-through text-[11px]">
                          {log.oldValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">None</span>
                      )}

                      <ArrowRight size={12} className="text-muted-foreground shrink-0" />

                      {log.newValue ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold font-mono-code text-[11px]">
                          {log.newValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Cleared</span>
                      )}
                    </div>
                  )}

                  {/* Note / Reason */}
                  {log.reason && (
                    <div className="text-[11px] text-muted-foreground italic bg-secondary/30 px-2.5 py-1.5 rounded-md border border-border/40">
                      "{log.reason}"
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Row: Actor info */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <span className="font-semibold text-foreground">
                    {log.changedByName || log.changedBy}
                  </span>
                  {log.changedByDepartment && (
                    <span className="bg-secondary text-muted-foreground px-1.5 py-0.2 rounded text-[10px] font-bold border border-border">
                      {log.changedByDepartment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
