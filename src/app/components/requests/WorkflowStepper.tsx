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

interface StepItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
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

  const STEPS: StepItem[] = [
    {
      key: "DRAFT",
      title: "Draft Created",
      description: "Requester filling specifications",
      icon: <FileEdit size={16} />,
    },
    {
      key: "SUBMITTED",
      title: "Submitted",
      description: submittedAt ? "Waiting for setup owner" : "Awaiting submission",
      icon: <Clock size={16} />,
    },
    {
      key: "SETUP_IN_PROGRESS",
      title: "Setup In Progress",
      description: psfCreatedAt ? "PSF parameters created" : "Setup owner configuring recipe",
      icon: <Wrench size={16} />,
    },
    {
      key: "COMPLETED",
      title: "Completed",
      description: completedAt ? "Verified and ready for test" : "Final verification & signoff",
      icon: <CheckCircle2 size={16} />,
    },
  ];

  // Map status to active index (0 to 3)
  const getActiveStepIndex = (st: string) => {
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
      default:
        return 1;
    }
  };

  const currentStepIdx = getActiveStepIndex(status);

  return (
    <div className="glass-panel p-4 sm:p-5 mb-6">
      {/* Header with exception banner if rejected/cancelled */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span>Request Lifecycle & Progression</span>
        </div>

        {isRejected && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full">
            <XCircle size={13} /> Request Rejected
          </span>
        )}

        {isCancelled && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-full">
            <AlertCircle size={13} /> Request Cancelled
          </span>
        )}

        {isNeedInfo && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full animate-pulse">
            <HelpCircle size={13} /> Action Needed: Requester Input
          </span>
        )}
      </div>

      {/* Progress Timeline Bar */}
      <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIdx || status === "COMPLETED";
          const isCurrent = idx === currentStepIdx && !isDone;
          const isFuture = idx > currentStepIdx;

          let circleBg = "bg-secondary text-muted-foreground border-border";
          let textColor = "text-muted-foreground";

          if (isDone) {
            circleBg = "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20";
            textColor = "text-foreground font-semibold";
          } else if (isCurrent) {
            circleBg =
              isRejected || isCancelled
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : isNeedInfo
                ? "bg-purple-600 text-white border-purple-700 shadow-sm animate-pulse"
                : "bg-accent text-white border-accent shadow-md shadow-accent/30 ring-4 ring-accent/20";
            textColor = "text-accent font-bold";
          }

          return (
            <div key={step.key} className="relative flex sm:flex-col items-start gap-3 sm:gap-2">
              {/* Connector line on desktop */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-1/2 w-full h-[2px] -z-0 transition-colors ${
                    idx < currentStepIdx ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              )}

              {/* Step Circle */}
              <div className="flex items-center gap-3 sm:block z-10">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${circleBg}`}
                >
                  {isDone ? <Check size={14} className="stroke-[2.5]" /> : step.icon}
                </div>
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className={`text-xs ${textColor}`}>
                  {step.title}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
