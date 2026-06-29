import { useState } from "react";
import { GripVertical, Eye, EyeOff } from "lucide-react";

interface Column {
  key: string;
  label: string;
  source: string;
  enabled: boolean;
  canonical: boolean;
}

const DEFAULT_COLUMNS: Column[] = [
  { key: "request_no", label: "Request No.", source: "system.request_id", enabled: true, canonical: false },
  { key: "product_type", label: "Product Type", source: "system.product_type", enabled: true, canonical: false },
  { key: "title", label: "Title", source: "canonical.title", enabled: true, canonical: true },
  { key: "reference_psf_name", label: "Reference PSF Name", source: "canonical.reference_psf_name", enabled: true, canonical: true },
  { key: "probecard_name", label: "Probecard Name", source: "canonical.probecard_name", enabled: true, canonical: true },
  { key: "psf_setup_file_name", label: "PSF Setup File Name", source: "canonical.psf_setup_file_name", enabled: true, canonical: true },
  { key: "status", label: "Status", source: "system.status", enabled: true, canonical: false },
  { key: "priority", label: "Priority", source: "canonical.priority", enabled: true, canonical: true },
  { key: "due_date", label: "Due Date", source: "canonical.due_date", enabled: true, canonical: true },
  { key: "requester", label: "Requester", source: "system.requester", enabled: true, canonical: false },
  { key: "setup_owner", label: "Setup Owner", source: "system.setup_owner", enabled: true, canonical: false },
  { key: "setup_owner_role", label: "Setup Owner Dept.", source: "system.setup_owner_role", enabled: true, canonical: false },
  { key: "product", label: "Product", source: "canonical.product", enabled: false, canonical: true },
  { key: "wafer_fab", label: "Wafer FAB", source: "canonical.wafer_fab", enabled: false, canonical: true },
];

export function ExportProfilePage() {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const toggleEnabled = (key: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleDragStart = (idx: number) => setDragging(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragging === null || dragging === idx) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const next = [...columns];
    const [removed] = next.splice(dragging, 1);
    next.splice(idx, 0, removed);
    setColumns(next);
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
        Configure export column order and visibility. Drag rows to reorder. Canonical key columns map across form versions.
      </p>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              <th style={{ width: 36, padding: "9px 8px" }}></th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>#</th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>Column Label</th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>Source</th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>Type</th>
              <th style={{ padding: "9px 14px", textAlign: "center", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => (
              <tr
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                style={{
                  borderBottom: "1px solid var(--border)",
                  background:
                    dragOver === idx
                      ? "var(--accent)"
                      : !col.enabled
                      ? "var(--muted)"
                      : "var(--card)",
                  opacity: dragging === idx ? 0.5 : 1,
                  cursor: "grab",
                }}
              >
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <GripVertical size={14} style={{ color: "var(--muted-foreground)" }} />
                </td>
                <td style={{ padding: "8px 14px", color: "var(--muted-foreground)", fontSize: 12 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "8px 14px", fontWeight: col.enabled ? 500 : 400, color: col.enabled ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {col.label}
                </td>
                <td style={{ padding: "8px 14px", fontSize: 11, fontFamily: "monospace", color: "var(--muted-foreground)" }}>
                  {col.source}
                </td>
                <td style={{ padding: "8px 14px" }}>
                  <span
                    style={{
                      padding: "1px 7px",
                      background: col.canonical ? "#ede9fe" : "var(--muted)",
                      color: col.canonical ? "#5b21b6" : "var(--muted-foreground)",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {col.canonical ? "canonical" : "system"}
                  </span>
                </td>
                <td style={{ padding: "8px 14px", textAlign: "center" }}>
                  <button
                    onClick={() => toggleEnabled(col.key)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: col.enabled ? "#059669" : "var(--muted-foreground)",
                      display: "flex",
                      alignItems: "center",
                      margin: "0 auto",
                    }}
                  >
                    {col.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        style={{
          padding: "8px 18px",
          background: saved ? "#d1fae5" : "var(--primary)",
          color: saved ? "#065f46" : "var(--primary-foreground)",
          border: "none",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {saved ? "✓ Profile Saved!" : "Save Export Profile"}
      </button>
    </div>
  );
}
