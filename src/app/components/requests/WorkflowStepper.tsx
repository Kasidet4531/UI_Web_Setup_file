import React from "react";
import {
  CheckCircle2,
  Clock,
  Wrench,
  Check,
  AlertCircle,
  XCircle,
  FileEdit,
  HelpCircle,
} from "lucide-react";

interface WorkflowStepperProps {
  status: string;
  submittedAt?: string | null;
  psfCreatedAt?: string | null;
  completedAt?: string | null;
}

export function WorkflowStepper({
  status,
  submittedAt,
  psfCreatedAt,
  completedAt,
}: WorkflowStepperProps) {
  const isRejected = status === "REJECTED";
  const isCancelled = status === "CANCELLED";
  const isNeedInfo = status === "NEED_MORE_INFO";

  // Define the standard linear stages
  const STAGES = [
    {
      id: "DRAFT",
      stepNum: 1,
      title: "1. Draft Request",
      subtitle: "Requester filling specs",
      icon: FileEdit,
    },
    {
      id: "SUBMITTED",
      stepNum: 2,
      title: "2. Submitted",
      subtitle: submittedAt ? `Sub: ${new Date(submittedAt).toLocaleDateString()}` : "Awaiting Assignment",
      icon: Clock,
    },
    {
      id: "SETUP_IN_PROGRESS",
      stepNum: 3,
      title: "3. PSF Setup",
      subtitle: psfCreatedAt ? "Parameters Created" : "Recipe in Progress",
      icon: Wrench,
    },
    {
      id: "COMPLETED",
      stepNum: 4,
      title: "4. Completed",
      subtitle: completedAt ? `Done: ${new Date(completedAt).toLocaleDateString()}` : "Signoff & Verified",
      icon: CheckCircle2,
    },
  ];

  // Determine stage progression level (0 to 3)
  const getStageIndex = (st: string) => {
    switch (st) {
      case "DRAFT":
        return 0;
      case "SUBMITTED":
      case "NEED_MORE_INFO":
        return 1;
      case "SETUP_IN_PROGRESS":
      case "PSF_CREATED":
        return 2;
      case "COMPLETED":
        return 3;
      case "REJECTED":
      case "CANCELLED":
        return 1;
      default:
        return 0;
    }
  };

  const activeStageIdx = getStageIndex(status);

  return (
    <div className="glass-panel p-4 sm:p-5 mb-6 space-y-4 bg-card border border-border">
      {/* Header bar with exception badges (Stage X of 4 removed) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Request Lifecycle & Progression
          </span>
        </div>

        {/* Exception State Badges */}
        {isRejected && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full">
            <XCircle size={14} className="shrink-0" />
            <span>Workflow Halted: Request Rejected</span>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-full">
            <AlertCircle size={14} className="shrink-0" />
            <span>Workflow Cancelled</span>
          </div>
        )}

        {isNeedInfo && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full animate-pulse">
            <HelpCircle size={14} className="shrink-0" />
            <span>Action Required: More Info Requested</span>
          </div>
        )}
      </div>

      {/* Stepper Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeStageIdx || status === "COMPLETED";
          const isCurrent = idx === activeStageIdx && status !== "COMPLETED";

          const IconComponent = stage.icon;

          let cardStyle = "bg-secondary/40 border-border/70 text-muted-foreground";
          let badgeStyle = "bg-muted text-muted-foreground border-border";
          let iconColor = "text-muted-foreground";

          if (isCompleted) {
            cardStyle =
              "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-foreground";
            badgeStyle =
              "bg-emerald-500 text-white border-emerald-600 shadow-xs";
            iconColor = "text-emerald-600 dark:text-emerald-400";
          } else if (isCurrent) {
            if (isRejected || isCancelled) {
              cardStyle =
                "bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-foreground ring-1 ring-rose-400/30";
              badgeStyle = "bg-rose-500 text-white border-rose-600";
              iconColor = "text-rose-600 dark:text-rose-400";
            } else if (isNeedInfo) {
              cardStyle =
                "bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-foreground ring-1 ring-purple-400/30";
              badgeStyle = "bg-purple-600 text-white border-purple-700";
              iconColor = "text-purple-600 dark:text-purple-400";
            } else {
              // Yellow-Orange theme for Current step
              cardStyle =
                "bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-foreground shadow-xs ring-1 ring-amber-400/30";
              badgeStyle = "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-xs";
              iconColor = "text-amber-600 dark:text-amber-400";
            }
          }

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${cardStyle}`}
            >
              {/* Left Stage Icon / Number Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${badgeStyle}`}
              >
                {isCompleted ? (
                  <Check size={14} className="stroke-[3]" />
                ) : isCurrent && (isRejected || isCancelled) ? (
                  <XCircle size={14} />
                ) : isCurrent && isNeedInfo ? (
                  <HelpCircle size={14} />
                ) : (
                  <span>{stage.stepNum}</span>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-xs font-bold truncate text-foreground">
                    {stage.title}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0 shadow-2xs">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      Done
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                  <IconComponent size={12} className={iconColor} />
                  <span>{stage.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
