import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ExportColumn } from "../../mock/mockExportProfile";
import { GripVertical, Eye, EyeOff, Check, RotateCcw, ShieldCheck } from "lucide-react";

export function ExportProfilePage() {
  const { exportColumns, updateExportColumns, resetExportColumns } = useApp();
  const [columns, setColumns] = useState<ExportColumn[]>(exportColumns);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    setColumns(exportColumns);
  }, [exportColumns]);

  const toggleEnabled = (key: string) => {
    const updated = columns.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c));
    setColumns(updated);
    updateExportColumns(updated);
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
    updateExportColumns(next);
    setDragging(null);
    setDragOver(null);
  };

  const handleSave = () => {
    updateExportColumns(columns);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetExportColumns();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" />
            <span>Default Export Profile Configuration</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system-wide export column order and visibility for all users. Drag rows with the grip handle to reorder.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Reset to default columns"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary text-xs py-1.5 px-4 shadow-sm flex items-center gap-1.5"
          >
            {saved ? (
              <>
                <Check size={14} />
                <span>Profile Saved!</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-card border border-border rounded-lg shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider select-none">
              <th className="w-10 py-3 px-2 text-center"></th>
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">Column Label</th>
              <th className="py-3 px-3">Source Field</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-center">Export Visibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {columns.map((col, idx) => (
              <tr
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => {
                  setDragging(null);
                  setDragOver(null);
                }}
                className={`transition-colors cursor-grab active:cursor-grabbing select-none ${
                  dragOver === idx
                    ? "bg-accent/20 border-accent"
                    : !col.enabled
                    ? "bg-muted/40 text-muted-foreground opacity-60"
                    : "table-row-hover bg-card"
                } ${dragging === idx ? "opacity-30" : ""}`}
              >
                <td className="py-3 px-2 text-center">
                  <GripVertical size={14} className="text-muted-foreground hover:text-foreground mx-auto" />
                </td>
                <td className="py-3 px-3 font-mono-code text-muted-foreground text-xs">
                  {idx + 1}
                </td>
                <td className="py-3 px-3 font-semibold text-foreground">
                  {col.label}
                </td>
                <td className="py-3 px-3 font-mono-code text-[11px] text-muted-foreground">
                  {col.source}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      col.canonical
                        ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {col.canonical ? "canonical" : "system"}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleEnabled(col.key)}
                    className={`p-1.5 rounded-md transition-colors ${
                      col.enabled
                        ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                    title={col.enabled ? "Enabled in export" : "Disabled from export"}
                  >
                    {col.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
