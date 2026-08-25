import React from "react";
import { Sparkles, Edit2 } from "lucide-react";

interface AutofillBadgeProps {
  sourceRequestNo: string;
  edited: boolean;
}

export function AutofillBadge({ sourceRequestNo, edited }: AutofillBadgeProps) {
  if (edited) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
        title="Auto-filled value was subsequently edited"
      >
        <Edit2 size={10} />
        Edited
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
      title={`Auto-filled from reference ${sourceRequestNo}`}
    >
      <Sparkles size={10} className="text-blue-500" />
      From {sourceRequestNo}
    </span>
  );
}
