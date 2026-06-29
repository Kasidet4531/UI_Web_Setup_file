import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { StatusDef, TransitionRule } from "../../mock/mockStatuses";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  ListChecks,
  GitBranch,
  Lock,
  Palette,
} from "lucide-react";
import { StatusBadge } from "../../components/requests/StatusBadge";

type WorkflowTab = "status-management" | "transition-flow";

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

// ─── Status Management Tab ────────────────────────────────────────────────────

function StatusManagementTab() {
  const { statuses, addStatus, updateStatus, removeStatus } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<StatusFormState>(EMPTY_FORM);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StatusFormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const inputStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const validateAndAdd = () => {
    if (!form.label.trim()) { setFormError("Label is required."); return; }
    const key = form.key.trim() || slugify(form.label);
    if (statuses.find((s) => s.key === key)) { setFormError(`Status key "${key}" already exists.`); return; }
    addStatus({ key, label: form.label.trim(), bg: form.bg, color: form.color, category: form.category, description: form.description });
    setForm(EMPTY_FORM);
    setShowAddForm(false);
    setFormError("");
  };

  const startEdit = (s: StatusDef) => {
    setEditingKey(s.key);
    setEditForm({ key: s.key, label: s.label, bg: s.bg, color: s.color, category: s.category, description: s.description ?? "" });
  };

  const saveEdit = () => {
    if (!editingKey) return;
    updateStatus(editingKey, {
      label: editForm.label,
      bg: editForm.bg,
      color: editForm.color,
      category: editForm.category,
      description: editForm.description,
    });
    setEditingKey(null);
  };

  const ColorPicker = ({
    form,
    setForm,
  }: {
    form: StatusFormState;
    setForm: React.Dispatch<React.SetStateAction<StatusFormState>>;
  }) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
        <Palette size={13} /> Color Theme
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PRESET_COLORS.map((p) => {
          const active = form.bg === p.bg && form.color === p.color;
          return (
            <button
              key={p.name}
              title={p.name}
              onClick={() => setForm((f) => ({ ...f, bg: p.bg, color: p.color }))}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: p.bg,
                border: active ? `3px solid ${p.color}` : "2px solid transparent",
                cursor: "pointer",
                outline: active ? `2px solid ${p.color}` : "none",
                outlineOffset: 1,
              }}
            />
          );
        })}
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Preview: </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 10px",
            borderRadius: 20,
            background: form.bg,
            color: form.color,
            fontSize: 12,
            fontWeight: 600,
            marginLeft: 6,
          }}
        >
          {form.label || "Status Label"}
        </span>
      </div>
    </div>
  );

  const grouped = {
    core: statuses.filter((s) => s.category === "core"),
    progress: statuses.filter((s) => s.category === "progress"),
    terminal: statuses.filter((s) => s.category === "terminal"),
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 560 }}>
            Manage the list of available statuses. Add custom statuses such as <strong>11%</strong>, <strong>77%</strong>, <strong>100%</strong>, or any label your workflow requires. Built-in statuses cannot be deleted.
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setForm(EMPTY_FORM); setFormError(""); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Plus size={15} /> Add Status
        </button>
      </div>

      {/* Add status form */}
      {showAddForm && (
        <div
          style={{
            background: "var(--card)",
            border: "2px dashed var(--primary)",
            borderRadius: "var(--radius)",
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} /> New Status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Label <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setForm((f) => ({ ...f, label, key: slugify(label) }));
                }}
                placeholder="e.g. 77%, Under Review, In QA"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Key (auto-generated)
              </label>
              <input
                type="text"
                value={form.key || slugify(form.label)}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.toUpperCase().replace(/\s+/g, "_") }))}
                placeholder="e.g. 77_PERCENT"
                style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as StatusDef["category"] }))}
                style={inputStyle}
              >
                <option value="core">Core — active workflow state</option>
                <option value="progress">Progress — percentage / stage</option>
                <option value="terminal">Terminal — end state</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description shown in tooltips"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <ColorPicker form={form} setForm={setForm} />
          </div>
          {formError && (
            <div style={{ color: "var(--destructive)", fontSize: 12, marginBottom: 10 }}>{formError}</div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={validateAndAdd} style={{ padding: "7px 14px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Add Status
            </button>
            <button onClick={() => { setShowAddForm(false); setFormError(""); }} style={{ padding: "7px 12px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status groups */}
      {(["core", "progress", "terminal"] as const).map((cat) => {
        const group = cat === "core" ? grouped.core : cat === "progress" ? grouped.progress : grouped.terminal;
        if (group.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
              {CATEGORY_LABELS[cat]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.map((s) => {
                const isEditing = editingKey === s.key;
                return (
                  <div
                    key={s.key}
                    style={{
                      background: "var(--card)",
                      border: `1px solid ${isEditing ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius)",
                      padding: isEditing ? 16 : "10px 14px",
                    }}
                  >
                    {isEditing ? (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Label</label>
                            <input type="text" value={editForm.label} onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Category</label>
                            <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as StatusDef["category"] }))} style={inputStyle} disabled={s.isBuiltIn}>
                              <option value="core">Core</option>
                              <option value="progress">Progress</option>
                              <option value="terminal">Terminal</option>
                            </select>
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Description</label>
                            <input type="text" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" style={inputStyle} />
                          </div>
                        </div>
                        <ColorPicker form={editForm} setForm={setEditForm} />
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={saveEdit} style={{ padding: "6px 12px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                            <Check size={13} /> Save
                          </button>
                          <button onClick={() => setEditingKey(null)} style={{ padding: "6px 10px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <StatusBadge status={s.key} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted-foreground)", background: "var(--muted)", padding: "1px 6px", borderRadius: 4 }}>
                              {s.key}
                            </span>
                            {s.isBuiltIn && (
                              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted-foreground)" }}>
                                <Lock size={10} /> built-in
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{s.description}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => startEdit(s)}
                            style={{ padding: "4px 10px", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          {!s.isBuiltIn && (
                            <button
                              onClick={() => setDeleteConfirm(s.key)}
                              style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "var(--radius)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* No progress statuses placeholder */}
      {grouped.progress.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Progress</div>
          <div style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius)", padding: "20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
            No progress statuses yet. Add statuses like <strong>11%</strong>, <strong>77%</strong>, or <strong>100%</strong> using the button above.
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--card)", borderRadius: "var(--radius)", padding: 24, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#991b1b", fontWeight: 600 }}>
              <Trash2 size={18} /> Remove Status
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
              Remove status <StatusBadge status={deleteConfirm} size="sm" />? Existing requests with this status will retain their current value but the status will no longer appear in dropdowns.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "7px 14px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={() => { removeStatus(deleteConfirm!); setDeleteConfirm(null); }} style={{ padding: "7px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Transition Flow Tab ──────────────────────────────────────────────────────

function TransitionFlowTab() {
  const { statuses, transitions, setTransitions } = useApp();
  const [saved, setSaved] = useState(false);
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [newFrom, setNewFrom] = useState(statuses[0]?.key ?? "");
  const [newTo, setNewTo] = useState(statuses[1]?.key ?? "");
  const [newRoles, setNewRoles] = useState<string[]>(["admin"]);

  const ALL_ROLES = ["requester", "setup_owner", "admin"];

  const toggleRole = (id: string, role: string) => {
    setTransitions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, roles: t.roles.includes(role) ? t.roles.filter((r) => r !== role) : [...t.roles, role] }
          : t
      )
    );
  };

  const removeTransition = (id: string) => {
    setTransitions((prev) => prev.filter((t) => t.id !== id));
  };

  const addTransition = () => {
    if (!newFrom || !newTo || newRoles.length === 0) return;
    setTransitions((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, from: newFrom, to: newTo, roles: newRoles },
    ]);
    setShowAddTransition(false);
    setNewRoles(["admin"]);
  };

  const selectStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
        Define which roles are allowed to perform each transition. Users can still manually pick any status from the status dropdown — these rules are used for workflow automation and validation.
      </p>

      {/* Add transition */}
      {showAddTransition && (
        <div style={{ background: "var(--card)", border: "2px dashed var(--primary)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>From Status</label>
              <select value={newFrom} onChange={(e) => setNewFrom(e.target.value)} style={selectStyle}>
                {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <ArrowRight size={16} style={{ color: "var(--muted-foreground)", marginBottom: 10 }} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>To Status</label>
              <select value={newTo} onChange={(e) => setNewTo(e.target.value)} style={selectStyle}>
                {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Allowed Roles</label>
              <div style={{ display: "flex", gap: 6 }}>
                {ALL_ROLES.map((r) => {
                  const on = newRoles.includes(r);
                  return (
                    <button key={r} onClick={() => setNewRoles((prev) => on ? prev.filter((x) => x !== r) : [...prev, r])}
                      style={{ padding: "5px 10px", background: on ? "var(--primary)" : "var(--muted)", color: on ? "var(--primary-foreground)" : "var(--muted-foreground)", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: on ? 600 : 400 }}>
                      {r.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={addTransition} style={{ padding: "7px 14px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Add</button>
            <button onClick={() => setShowAddTransition(false)} style={{ padding: "7px 10px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>From</th>
              <th style={{ padding: "9px 6px", width: 24 }}></th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>To</th>
              <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>Allowed Roles</th>
              <th style={{ padding: "9px 14px", width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {transitions.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "9px 14px" }}><StatusBadge status={t.from} size="sm" /></td>
                <td style={{ padding: "9px 6px", textAlign: "center" }}><ArrowRight size={13} style={{ color: "var(--muted-foreground)" }} /></td>
                <td style={{ padding: "9px 14px" }}><StatusBadge status={t.to} size="sm" /></td>
                <td style={{ padding: "9px 14px" }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {ALL_ROLES.map((role) => {
                      const has = t.roles.includes(role);
                      return (
                        <button key={role} onClick={() => toggleRole(t.id, role)}
                          style={{ padding: "2px 9px", background: has ? "var(--primary)" : "var(--muted)", color: has ? "var(--primary-foreground)" : "var(--muted-foreground)", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
                          {has ? <Check size={9} /> : <X size={9} />} {role.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td style={{ padding: "9px 14px", textAlign: "center" }}>
                  <button onClick={() => removeTransition(t.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "var(--radius)", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowAddTransition(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>
          <Plus size={14} /> Add Transition
        </button>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          style={{ padding: "7px 16px", background: saved ? "#d1fae5" : "var(--primary)", color: saved ? "#065f46" : "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
        >
          {saved ? "✓ Saved!" : "Save Transitions"}
        </button>
      </div>
    </div>
  );
}

// ─── Main WorkflowPage ────────────────────────────────────────────────────────

export function WorkflowPage() {
  const [tab, setTab] = useState<WorkflowTab>("status-management");

  const tabs: { key: WorkflowTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: "status-management",
      label: "Status Management",
      icon: <ListChecks size={16} />,
      desc: "Add, remove, and configure available status values",
    },
    {
      key: "transition-flow",
      label: "Transition Flow",
      icon: <GitBranch size={16} />,
      desc: "Define which roles can perform which status transitions",
    },
  ];

  return (
    <div>
      {/* Tab switcher — card style to clearly separate the two areas */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
              padding: "14px 20px",
              background: tab === t.key ? "var(--primary)" : "var(--card)",
              color: tab === t.key ? "var(--primary-foreground)" : "var(--foreground)",
              border: `2px solid ${tab === t.key ? "var(--primary)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              cursor: "pointer",
              textAlign: "left",
              minWidth: 220,
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: 14 }}>
              {t.icon} {t.label}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {tab === "status-management" && <StatusManagementTab />}
      {tab === "transition-flow" && <TransitionFlowTab />}
    </div>
  );
}
