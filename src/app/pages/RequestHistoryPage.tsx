import React from "react";
import { useApp } from "../context/AppContext";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { StatusBadge } from "../components/requests/StatusBadge";
import { ArrowLeft, History, FileText, User } from "lucide-react";

interface RequestHistoryPageProps {
  requestId: string;
  onNavigate: (path: string) => void;
}

export function RequestHistoryPage({ requestId, onNavigate }: RequestHistoryPageProps) {
  const { getRequest, getRequestLogs } = useApp();
  const req = getRequest(requestId);
  const logs = getRequestLogs(requestId);

  if (!req) {
    return (
      <div className="glass-panel text-center py-16 px-4 max-w-md mx-auto my-12 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Request not found</h3>
        <button
          onClick={() => onNavigate("/requests")}
          className="btn-primary text-xs"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <button
          onClick={() => onNavigate(`/requests/${req.id}`)}
          className="btn-ghost text-xs py-1.5 px-2.5"
        >
          <ArrowLeft size={15} />
          <span>Back to Request Details</span>
        </button>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-sm font-bold text-foreground">
            {req.requestNo}
          </span>
          <span className="text-xs text-muted-foreground">/ Audit History</span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="glass-panel p-4 flex items-center justify-between gap-4 flex-wrap bg-card">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText size={15} className="text-accent" />
            <span>{req.title || "Untitled PSF Request"}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-mono-code font-semibold">{req.requestNo}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <User size={11} /> {req.requesterName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={req.status} size="sm" />
          <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
            {logs.length} logged events
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="glass-panel p-6 bg-card space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border">
          <History size={14} className="text-accent" />
          <span>Chronological Timeline</span>
        </div>

        <AuditTimeline logs={logs} />
      </div>
    </div>
  );
}
