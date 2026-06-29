import { Sparkles, Pencil } from "lucide-react";

interface AutofillBadgeProps {
  sourceRequestNo: string;
  edited: boolean;
}

export function AutofillBadge({ sourceRequestNo, edited }: AutofillBadgeProps) {
  if (edited) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          background: "#fef9c3",
          color: "#854d0e",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        <Pencil size={10} />
        Edited by user
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        background: "#ede9fe",
        color: "#5b21b6",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
      }}
      title={`Auto-filled from ${sourceRequestNo}`}
    >
      <Sparkles size={10} />
      Auto-filled from {sourceRequestNo}
    </span>
  );
}
