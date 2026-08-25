import React, { useState } from "react";
import { ChevronDown, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { StatusBadge, useAllStatuses } from "./StatusBadge";
import { useApp } from "../../context/AppContext";

interface StatusDropdownProps {
  requestId: string;
  currentStatus: string;
  onChanged?: () => void;
}

export function StatusDropdown({ requestId, currentStatus, onChanged }: StatusDropdownProps) {
  const { changeStatus } = useApp();
  const allStatuses = useAllStatuses();
  const [open, setOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleSelect = (key: string) => {
    if (key === currentStatus) {
      setOpen(false);
      return;
    }
    setConfirmTarget(key);
    setOpen(false);
    setReason("");
  };

  const handleConfirm = () => {
    if (!confirmTarget) return;
    changeStatus(requestId, confirmTarget, reason.trim() || undefined);
    setConfirmTarget(null);
    setReason("");
    onChanged?.();
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-secondary text-foreground border border-border rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
        >
          <StatusBadge status={currentStatus} size="sm" />
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute top-full mt-1.5 left-0 glass-panel p-1.5 z-50 min-w-[200px] shadow-xl animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                Change Status
              </div>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {allStatuses.map((s) => {
                  const isSelected = s.key === currentStatus;
                  return (
                    <button
                      key={s.key}
                      onClick={() => handleSelect(s.key)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors text-xs ${
                        isSelected
                          ? "bg-secondary font-semibold"
                          : "hover:bg-secondary/70 text-foreground cursor-pointer"
                      }`}
                    >
                      <StatusBadge status={s.key} size="sm" />
                      {isSelected && <CheckCircle2 size={13} className="text-accent ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="glass-panel bg-card p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-foreground font-semibold text-base">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <AlertCircle size={18} />
              </div>
              <span>Confirm Status Transition</span>
            </div>

            <div className="p-3 bg-secondary rounded-lg border border-border flex items-center justify-center gap-3 text-xs">
              <StatusBadge status={currentStatus} size="md" />
              <ArrowRight size={14} className="text-muted-foreground" />
              <StatusBadge status={confirmTarget} size="md" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Transition Note / Reason <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Setup file created in GNTC repository, verified pin maps..."
                rows={2}
                className="input-base text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmTarget(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn-primary"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
