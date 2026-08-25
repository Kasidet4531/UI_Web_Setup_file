import { useApp } from "../../context/AppContext";

export function StatusBadge({
  status,
  size = "md",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const { statuses } = useApp();
  const def = statuses.find((s) => s.key === status);

  // Modern Semantic status styles with dark-mode safe colors
  const getStatusStyles = (key: string) => {
    switch (key) {
      case "DRAFT":
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-300 dark:border-slate-700",
          dot: "bg-slate-400",
        };
      case "SUBMITTED":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-300 dark:border-amber-800/60",
          dot: "bg-amber-500",
        };
      case "SETUP_IN_PROGRESS":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-300 dark:border-blue-800/60",
          dot: "bg-blue-500 animate-pulse",
        };
      case "PSF_CREATED":
        return {
          bg: "bg-teal-50 dark:bg-teal-950/40",
          text: "text-teal-700 dark:text-teal-300",
          border: "border-teal-300 dark:border-teal-800/60",
          dot: "bg-teal-500",
        };
      case "COMPLETED":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-300 dark:border-emerald-800/60",
          dot: "bg-emerald-500",
        };
      case "NEED_MORE_INFO":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40",
          text: "text-purple-700 dark:text-purple-300",
          border: "border-purple-300 dark:border-purple-800/60",
          dot: "bg-purple-500",
        };
      case "REJECTED":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-300 dark:border-rose-800/60",
          dot: "bg-rose-500",
        };
      case "CANCELLED":
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-300 dark:border-gray-700",
          dot: "bg-gray-400",
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-300 dark:border-slate-700",
          dot: "bg-slate-400",
        };
    }
  };

  const style = getStatusStyles(status);
  const label = def?.label ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors ${
        style.bg
      } ${style.text} ${style.border} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
}

export function useAllStatuses() {
  const { statuses } = useApp();
  return statuses;
}
