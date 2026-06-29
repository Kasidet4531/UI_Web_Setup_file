import { useApp } from "../../context/AppContext";

// Fallback palette for unknown/custom statuses
const FALLBACK_PALETTES = [
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fee2e2", color: "#991b1b" },
];

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

export function StatusBadge({
  status,
  size = "md",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const { statuses } = useApp();
  const def = statuses.find((s) => s.key === status);

  const bg = def?.bg ?? FALLBACK_PALETTES[hashKey(status) % FALLBACK_PALETTES.length].bg;
  const color = def?.color ?? FALLBACK_PALETTES[hashKey(status) % FALLBACK_PALETTES.length].color;
  const label = def?.label ?? status.replace(/_/g, " ");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        borderRadius: 20,
        background: bg,
        color,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function useAllStatuses() {
  const { statuses } = useApp();
  return statuses;
}
