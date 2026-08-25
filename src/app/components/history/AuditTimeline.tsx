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
} from "lucide-react";

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  CREATE_REQUEST: {
    label: "Request Created",
    icon: <Plus size={13} />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
  },
  CHANGE_STATUS: {
    label: "Status Changed",
    icon: <ArrowRightLeft size={13} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
  },
  UPDATE_FIELD: {
    label: "Field Updated",
    icon: <Edit3 size={13} />,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
  },
  UPLOAD_ATTACHMENT: {
    label: "Attachment Uploaded",
    icon: <Upload size={13} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
  },
  DELETE_ATTACHMENT: {
    label: "Attachment Deleted",
    icon: <Trash2 size={13} />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
  },
  USE_AUTOFILL: {
    label: "Auto-fill Applied",
    icon: <Sparkles size={13} />,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
  },
  MARK_PSF_CREATED: {
    label: "PSF Marked Created",
    icon: <CheckCircle size={13} />,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800",
  },
  EXPORT_EXCEL: {
    label: "Excel Exported",
    icon: <FileDown size={13} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
  },
  ADMIN_OVERRIDE: {
    label: "Admin Override",
    icon: <Shield size={13} />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
  },
};

interface AuditTimelineProps {
  logs: AuditLog[];
  compact?: boolean;
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

export function AuditTimeline({ logs, compact = false }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        No audit activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
      {logs.map((log) => {
        const cfg = ACTION_CONFIG[log.actionType] ?? {
          label: log.actionType,
          icon: <Edit3 size={13} />,
          color: "text-slate-600 dark:text-slate-400",
          bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
        };

        return (
          <div key={log.id} className="relative group text-xs">
            {/* Timeline Dot Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${cfg.bg} ${cfg.color} shadow-xs z-10`}
            >
              {cfg.icon}
            </div>

            {/* Content Container */}
            <div className="bg-secondary/40 rounded-lg p-3 border border-border/70 space-y-1.5 transition-colors group-hover:border-border">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`font-semibold ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock size={11} /> {formatDate(log.changedAt)}
                </span>
              </div>

              {/* Field affected */}
              {log.fieldLabel && (
                <div className="text-[11px] text-muted-foreground">
                  Field: <span className="font-medium text-foreground">{log.fieldLabel}</span>
                </div>
              )}

              {/* Value Diff */}
              {!compact && (log.oldValue || log.newValue) && (
                <div className="flex items-center gap-2 flex-wrap text-[11px] pt-0.5">
                  {log.oldValue && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 line-through">
                      {log.oldValue}
                    </span>
                  )}
                  {log.oldValue && log.newValue && (
                    <ArrowRightLeft size={11} className="text-muted-foreground" />
                  )}
                  {log.newValue && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                      {log.newValue}
                    </span>
                  )}
                </div>
              )}

              {/* Reason note */}
              {log.reason && (
                <div className="text-[11px] text-muted-foreground italic bg-background/60 p-1.5 rounded border border-border">
                  Note: "{log.reason}"
                </div>
              )}

              {/* Performed by actor info */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40 mt-1">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <User size={11} /> {log.changedByName || log.changedBy}
                </span>
                {log.changedByDepartment && (
                  <span className="bg-secondary px-1.5 rounded text-[10px] font-semibold border border-border">
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
