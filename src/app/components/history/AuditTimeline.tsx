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
  { label: string; icon: React.ReactNode; color: string; badgeBg: string }
> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={12} />,
    color: "text-accent",
    badgeBg: "bg-accent/10 text-accent border-accent/20",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={12} />,
    color: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={12} />,
    color: "text-muted-foreground",
    badgeBg: "bg-secondary text-foreground border-border",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment Uploaded",
    icon: <Upload size={12} />,
    color: "text-muted-foreground",
    badgeBg: "bg-secondary text-foreground border-border",
  },
  DELETE_ATTACHMENT: {
    label: "Attachment Deleted",
    icon: <Trash2 size={12} />,
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  USE_AUTOFILL: {
    label: "Auto-fill Applied",
    icon: <Sparkles size={12} />,
    color: "text-accent",
    badgeBg: "bg-accent/10 text-accent border-accent/20",
  },
  MARK_PSF_CREATED: {
    label: "PSF Marked Created",
    icon: <CheckCircle size={12} />,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  EXPORT_EXCEL: {
    label: "Excel Exported",
    icon: <FileDown size={12} />,
    color: "text-muted-foreground",
    badgeBg: "bg-secondary text-foreground border-border",
  },
  ADMIN_OVERRIDE: {
    label: "Admin Override",
    icon: <Shield size={12} />,
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
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
    <div className="relative pl-6 sm:pl-7 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border">
      {logs.map((log) => {
        const cfg = ACTION_CONFIG[log.actionType] ?? {
          label: log.actionType,
          icon: <Edit3 size={12} />,
          color: "text-muted-foreground",
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
            {/* Timeline Dot Node */}
            <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full border border-border bg-card text-muted-foreground group-hover:text-accent group-hover:border-accent/40 flex items-center justify-center shadow-2xs z-10 transition-colors">
              {cfg.icon}
            </div>

            {/* Stream Card */}
            <div className="p-3.5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-border-strong transition-all shadow-2xs space-y-2">
              {/* Top Row: Action Badge + Request No + Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Action Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.badgeBg}`}
                  >
                    <span>{cfg.label}</span>
                  </span>

                  {/* Request No Link */}
                  {log.requestNo && (
                    <button
                      type="button"
                      onClick={() => onSelectRequest && onSelectRequest(log.requestId)}
                      className={`inline-flex items-center gap-1 font-mono-code text-[11px] px-2 py-0.5 rounded bg-secondary text-foreground border border-border font-medium ${
                        onSelectRequest ? "hover:border-accent hover:text-accent cursor-pointer" : ""
                      }`}
                      title={onSelectRequest ? "View Request Details" : undefined}
                    >
                      <span>{log.requestNo}</span>
                      {onSelectRequest && <ExternalLink size={10} className="opacity-60" />}
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
                  <Clock size={11} className="text-muted-foreground/80" />
                  <span>{formatDate(log.changedAt)}</span>
                </div>
              </div>

              {/* Middle Section: Change Details */}
              {(log.fieldLabel || log.oldValue || log.newValue || log.reason) && (
                <div className="space-y-1.5 pt-0.5">
                  {/* Field Label */}
                  {log.fieldLabel && (
                    <div className="text-xs text-muted-foreground">
                      Field: <span className="font-semibold text-foreground">{log.fieldLabel}</span>
                    </div>
                  )}

                  {/* Value Diff (Before -> After) - Clean Minimal Palette */}
                  {!compact && (log.oldValue || log.newValue) && (
                    <div className="flex items-center gap-2 flex-wrap text-xs bg-secondary/30 px-2.5 py-1.5 rounded-lg border border-border/60">
                      {log.oldValue ? (
                        <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-mono-code line-through text-[11px]">
                          {log.oldValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">None</span>
                      )}

                      <ArrowRight size={11} className="text-muted-foreground/60 shrink-0" />

                      {log.newValue ? (
                        <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold border border-accent/20 font-mono-code text-[11px]">
                          {log.newValue}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Cleared</span>
                      )}
                    </div>
                  )}

                  {/* Note / Reason */}
                  {log.reason && (
                    <div className="text-[11px] text-muted-foreground italic bg-secondary/20 px-2.5 py-1 rounded border border-border/40">
                      Note: "{log.reason}"
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Row: Actor info */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-secondary text-muted-foreground border border-border font-bold text-[9px] flex items-center justify-center shrink-0">
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
