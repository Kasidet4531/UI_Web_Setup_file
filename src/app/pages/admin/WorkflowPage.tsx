import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { StatusDef } from "../../mock/mockStatuses";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Lock,
  Palette,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "../../components/requests/StatusBadge";

const CATEGORY_LABELS = {
  core: "Core",
  progress: "Progress",
  terminal: "Terminal",
};

const PRESET_COLORS: { bg: string; color: string; name: string }[] = [
  { bg: "#f3f4f6", color: "#6b7280", name: "Gray" },
  { bg: "#dbeafe", color: "#1d4ed8", name: "Blue" },
  { bg: "#fef3c7", color: "#b45309", name: "Amber" },
  { bg: "#d1fae5", color: "#065f46", name: "Emerald" },
  { bg: "#dcfce7", color: "#15803d", name: "Green" },
  { bg: "#fce7f3", color: "#be185d", name: "Pink" },
  { bg: "#fee2e2", color: "#991b1b", name: "Red" },
  { bg: "#ede9fe", color: "#5b21b6", name: "Violet" },
  { bg: "#e0f2fe", color: "#0369a1", name: "Sky" },
  { bg: "#fef9c3", color: "#854d0e", name: "Yellow" },
  { bg: "#f0fdf4", color: "#166534", name: "Lime" },
  { bg: "#fff7ed", color: "#c2410c", name: "Orange" },
];

interface StatusFormState {
  key: string;
  label: string;
  bg: string;
  color: string;
  category: StatusDef["category"];
  description: string;
}

const EMPTY_FORM: StatusFormState = {
  key: "",
  label: "",
  bg: "#dbeafe",
  color: "#1d4ed8",
  category: "core",
  description: "",
};

function slugify(label: string) {
  return label.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_%]/g, "");
}

const EXTENDED_PRESET_COLORS: { bg: string; color: string; name: string }[] = [
  { bg: "#f1f5f9", color: "#475569", name: "Slate" },
  { bg: "#dbeafe", color: "#1d4ed8", name: "Blue" },
  { bg: "#e0f2fe", color: "#0284c7", name: "Sky" },
  { bg: "#cffafe", color: "#0891b2", name: "Cyan" },
  { bg: "#ccfbf1", color: "#0d9488", name: "Teal" },
  { bg: "#d1fae5", color: "#059669", name: "Emerald" },
  { bg: "#dcfce7", color: "#16a34a", name: "Green" },
  { bg: "#ecfccb", color: "#65a30d", name: "Lime" },
  { bg: "#fef9c3", color: "#ca8a04", name: "Yellow" },
  { bg: "#fef3c7", color: "#d97706", name: "Amber" },
  { bg: "#ffedd5", color: "#ea580c", name: "Orange" },
  { bg: "#fee2e2", color: "#dc2626", name: "Red" },
  { bg: "#ffe4e6", color: "#e11d48", name: "Rose" },
  { bg: "#fce7f3", color: "#db2777", name: "Pink" },
  { bg: "#f3e8ff", color: "#9333ea", name: "Purple" },
  { bg: "#ede9fe", color: "#7c3aed", name: "Violet" },
];

function StatusManagementTab() {
  const { statuses, addStatus, updateStatus, removeStatus } = useApp();
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<StatusFormState>(EMPTY_FORM);
  const [editingOriginalKey, setEditingOriginalKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const openAddModal = () => {
    setModalForm(EMPTY_FORM);
    setEditingOriginalKey(null);
    setFormError("");
    setModalType("add");
  };

  const openEditModal = (s: StatusDef) => {
    setEditingOriginalKey(s.key);
    setModalForm({
      key: s.key,
      label: s.label,
      bg: s.bg,
      color: s.color,
      category: s.category,
      description: s.description ?? "",
    });
    setFormError("");
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
    setModalForm(EMPTY_FORM);
    setEditingOriginalKey(null);
    setFormError("");
  };

  const handleSaveModal = () => {
    if (!modalForm.label.trim()) {
      setFormError("Status label is required.");
      return;
    }

    if (modalType === "add") {
      const key = modalForm.key.trim() || slugify(modalForm.label);
      if (statuses.find((s) => s.key === key)) {
        setFormError(`Status key "${key}" already exists.`);
        return;
      }
      addStatus({
        key,
        label: modalForm.label.trim(),
        bg: modalForm.bg,
        color: modalForm.color,
        category: modalForm.category,
        description: modalForm.description,
      });
    } else if (modalType === "edit" && editingOriginalKey) {
      updateStatus(editingOriginalKey, {
        label: modalForm.label.trim(),
        bg: modalForm.bg,
        color: modalForm.color,
        category: modalForm.category,
        description: modalForm.description,
      });
    }

    closeModal();
  };

  const currentEditingStatus = editingOriginalKey
    ? statuses.find((s) => s.key === editingOriginalKey)
    : null;

  // Filtered statuses
  const filteredStatuses = useMemo(() => {
    let list = statuses;
    if (categoryFilter !== "all") {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (s) => s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q)
      );
    }
    return list;
  }, [statuses, categoryFilter, searchFilter]);

  const grouped = {
    core: filteredStatuses.filter((s) => s.category === "core"),
    progress: filteredStatuses.filter((s) => s.category === "progress"),
    terminal: filteredStatuses.filter((s) => s.category === "terminal"),
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Search, Category Filters, and Add Button */}
      <div className="glass-panel p-4 bg-card rounded-xl border border-border shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search status by label or key..."
              className="input-base text-xs h-10 w-full pl-3 pr-8 rounded-lg shadow-2xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action: Add Status Button */}
          <button
            onClick={openAddModal}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer font-semibold"
          >
            <Plus size={15} /> Add New Status
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border/70 text-xs">
          <span className="text-muted-foreground font-semibold mr-1">Filter:</span>
          {[
            { key: "all", label: "All Statuses", count: statuses.length },
            { key: "core", label: "Core Lifecycle", count: statuses.filter((s) => s.category === "core").length },
            { key: "progress", label: "Progress Stages", count: statuses.filter((s) => s.category === "progress").length },
            { key: "terminal", label: "Terminal States", count: statuses.filter((s) => s.category === "terminal").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                categoryFilter === tab.key
                  ? "bg-accent text-white shadow-2xs font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Status Groups */}
      {(["core", "progress", "terminal"] as const).map((cat) => {
        const group = cat === "core" ? grouped.core : cat === "progress" ? grouped.progress : grouped.terminal;
        if (group.length === 0 && categoryFilter !== "all" && categoryFilter !== cat) return null;

        const categoryTitle = CATEGORY_LABELS[cat];
        let categoryHeaderBadge = "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        if (cat === "progress") {
          categoryHeaderBadge = "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
        } else if (cat === "terminal") {
          categoryHeaderBadge = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
        }

        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryHeaderBadge}`}>
                  {categoryTitle}
                </span>
                <span className="text-xs text-muted-foreground font-mono">({group.length})</span>
              </div>
            </div>

            {group.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.map((s) => {
                  return (
                    <div
                      key={s.key}
                      className="p-4 rounded-xl border border-border hover:border-accent/40 transition-all shadow-2xs space-y-3 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={s.key} size="md" />
                        <div className="flex items-center gap-1">
                          {s.isBuiltIn ? (
                            <span
                              className="text-[10px] text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md border border-border/70"
                              title="Built-in system status (protected)"
                            >
                              <Lock size={10} /> Built-in
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(s.key)}
                              className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete status"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                          <span>Key: {s.key}</span>
                          <span
                            className="w-3 h-3 rounded-full border border-border inline-block shadow-2xs"
                            style={{ backgroundColor: s.color }}
                            title={`Color: ${s.color}`}
                          />
                        </div>
                        {s.description ? (
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {s.description}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground/50 italic">
                            No description provided
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/70 flex items-center justify-end">
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-xs text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={12} /> Edit Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground bg-secondary/20">
                No statuses found matching current filter.
              </div>
            )}
          </div>
        );
      })}

      {/* ─── ADD / EDIT POPUP MODAL DIALOG ─── */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-panel p-6 bg-card max-w-lg w-full rounded-2xl shadow-2xl border border-border space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                {modalType === "add" ? (
                  <>
                    <Plus size={16} className="text-accent" />
                    <span>Create New Workflow Status</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={16} className="text-accent" />
                    <span>Edit Status: {modalForm.label || editingOriginalKey}</span>
                    <StatusBadge
                      customLabel={modalForm.label || editingOriginalKey || ""}
                      customBg={modalForm.bg}
                      customColor={modalForm.color}
                      size="sm"
                    />
                  </>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Fields */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Display Label <span className="text-destructive">*</span></span>
                  <span className="text-[10px] text-muted-foreground font-normal">e.g. Under Review</span>
                </label>
                <input
                  type="text"
                  value={modalForm.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setModalForm((f) => ({
                      ...f,
                      label,
                      key: modalType === "add" ? slugify(label) : f.key,
                    }));
                  }}
                  placeholder="Enter status label"
                  className="input-base text-xs h-10 rounded-lg w-full"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Status Key (Machine Identifier)</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {modalType === "add" ? "Auto-generated" : "Immutable ID"}
                  </span>
                </label>
                <input
                  type="text"
                  value={modalForm.key || (modalType === "add" ? slugify(modalForm.label) : "")}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      key: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    }))
                  }
                  disabled={modalType === "edit"}
                  placeholder="e.g. UNDER_REVIEW"
                  className="input-base text-xs h-10 rounded-lg w-full font-mono font-semibold disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={modalForm.category}
                  onChange={(e) =>
                    setModalForm((f) => ({
                      ...f,
                      category: e.target.value as StatusDef["category"],
                    }))
                  }
                  disabled={Boolean(currentEditingStatus?.isBuiltIn)}
                  className="input-base text-xs h-10 rounded-lg w-full cursor-pointer disabled:opacity-60"
                >
                  <option value="core">Core — Active Progression State</option>
                  <option value="progress">Progress — Milestone / Testing Stage</option>
                  <option value="terminal">Terminal — Completion or End State</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                <input
                  type="text"
                  value={modalForm.description}
                  onChange={(e) => setModalForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description shown in tooltips"
                  className="input-base text-xs h-10 rounded-lg w-full"
                />
              </div>

              {/* Color Theme Swatches */}
              <div className="pt-2 border-t border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Palette size={13} className="text-accent" />
                    <span>Select Badge Color Theme</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: modalForm.color }}
                    />
                    <span>{modalForm.color}</span>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-2">
                  {EXTENDED_PRESET_COLORS.map((p) => {
                    const active = modalForm.bg === p.bg && modalForm.color === p.color;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        title={p.name}
                        onClick={() => setModalForm((f) => ({ ...f, bg: p.bg, color: p.color }))}
                        className={`h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                          active
                            ? "border-accent ring-2 ring-accent/30 scale-105 shadow-xs"
                            : "border-border hover:scale-105 hover:border-foreground/40"
                        }`}
                        style={{ backgroundColor: p.bg }}
                      >
                        <span
                          className="w-3 h-3 rounded-full shadow-2xs"
                          style={{ backgroundColor: p.color }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Live Preview Box with both size previews */}
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between mt-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs text-foreground font-semibold">Live Badge Preview</span>
                    <span className="text-[10px] text-muted-foreground">Preview in table and detail views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      customLabel={modalForm.label || "Status Label"}
                      customBg={modalForm.bg}
                      customColor={modalForm.color}
                      size="sm"
                    />
                    <StatusBadge
                      customLabel={modalForm.label || "Status Label"}
                      customBg={modalForm.bg}
                      customColor={modalForm.color}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-destructive text-xs font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-lg border border-border bg-secondary text-foreground text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="btn-primary text-xs py-2 px-4 font-semibold shadow-sm cursor-pointer"
              >
                {modalType === "add" ? "Create Status" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-panel p-6 bg-card max-w-sm w-full rounded-2xl shadow-2xl border border-border space-y-4">
            <div className="flex items-center gap-2.5 text-destructive font-bold text-sm">
              <Trash2 size={18} />
              <span>Remove Status Confirmation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove status <strong className="text-foreground">{deleteConfirm}</strong>? Existing requests with this status will retain their value, but it will no longer be available in dropdowns.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-2 rounded-lg border border-border bg-secondary text-foreground text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeStatus(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 rounded-lg bg-destructive text-white text-xs font-bold hover:bg-destructive/90 transition-colors shadow-sm cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main WorkflowPage ────────────────────────────────────────────────────────

export function WorkflowPage() {
  return (
    <div className="space-y-6">
      <StatusManagementTab />
    </div>
  );
}
