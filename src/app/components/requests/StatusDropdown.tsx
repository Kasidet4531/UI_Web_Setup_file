import { useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
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
    if (key === currentStatus) { setOpen(false); return; }
    setConfirmTarget(key);
    setOpen(false);
    setReason("");
  };

  const handleConfirm = () => {
    if (!confirmTarget) return;
    changeStatus(requestId, confirmTarget, reason || undefined);
    setConfirmTarget(null);
    setReason("");
    onChanged?.();
  };

  return (
    <>
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--foreground)",
          }}
        >
          <StatusBadge status={currentStatus} size="sm" />
          <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
        </button>

        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                zIndex: 50,
                minWidth: 200,
                maxHeight: 320,
                overflowY: "auto",
                padding: "4px 0",
              }}
            >
              {allStatuses.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleSelect(s.key)}
                  style={{
                    width: "100%",
                    padding: "7px 12px",
                    background: s.key === currentStatus ? "var(--accent)" : "none",
                    border: "none",
                    cursor: s.key === currentStatus ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <StatusBadge status={s.key} size="sm" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {confirmTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              padding: 24,
              width: 420,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <AlertCircle size={20} color="var(--destructive)" />
              <span style={{ fontWeight: 600, fontSize: 16 }}>Confirm Status Change</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 16 }}>
              Change status from{" "}
              <StatusBadge status={currentStatus} size="sm" />{" "}
              to{" "}
              <StatusBadge status={confirmTarget} size="sm" />?
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  background: "var(--input-background)",
                  color: "var(--foreground)",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmTarget(null)}
                style={{
                  padding: "8px 16px",
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: "8px 16px",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
