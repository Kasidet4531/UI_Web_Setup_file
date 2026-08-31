import { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";

interface AutofillRule {
  id: string;
  triggerField: string;
  targetFields: string[];
  status: "active" | "inactive";
}

const DEFAULT_RULES: AutofillRule[] = [
  {
    id: "rule-1",
    triggerField: "reference_psf_name",
    targetFields: ["product", "wafer_fab", "probecard_name", "description"],
    status: "active",
  },
  {
    id: "rule-2",
    triggerField: "probecard_name",
    targetFields: ["product", "wafer_fab"],
    status: "active",
  },
];

const CANONICAL_FIELDS = [
  "product_type", "title", "request_for", "request_to", "reference_psf_name",
  "priority", "nc_12", "product", "wafer_fab", "probecard_name",
  "machine_type", "description",
  "first_die_ref", "probe_coordinate_quadrant", "wafer_id_format",
  "mirror_die_available", "prepare_fpc", "psf_setup_file_name",
  "job_file_name", "template", "layout",
];

export function AutofillPage() {
  const [rules, setRules] = useState<AutofillRule[]>(DEFAULT_RULES);
  const [saved, setSaved] = useState(false);

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, triggerField: "reference_psf_name", targetFields: [], status: "active" },
    ]);
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r
      )
    );
  };

  const updateTrigger = (id: string, field: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, triggerField: field } : r)));
  };

  const toggleTarget = (id: string, field: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              targetFields: r.targetFields.includes(field)
                ? r.targetFields.filter((f) => f !== field)
                : [...r.targetFields, field],
            }
          : r
      )
    );
  };

  const selectStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 12,
    background: "var(--input-background)",
    color: "var(--foreground)",
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
        Define which fields trigger auto-fill and which target fields are populated from the most recently completed matching request.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              background: "var(--card)",
              border: `1px solid ${rule.status === "active" ? "var(--border)" : "#e5e7eb"}`,
              borderRadius: "var(--radius)",
              padding: 16,
              opacity: rule.status === "active" ? 1 : 0.6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <Sparkles size={15} color="#7c3aed" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Auto-fill Rule</span>
              <span
                style={{
                  padding: "2px 8px",
                  background: rule.status === "active" ? "#d1fae5" : "#f3f4f6",
                  color: rule.status === "active" ? "#065f46" : "#6b7280",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {rule.status}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button
                  onClick={() => toggleStatus(rule.id)}
                  style={{
                    padding: "4px 10px",
                    background: "var(--secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {rule.status === "active" ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  style={{
                    padding: "4px 8px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "none",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 5, color: "var(--muted-foreground)" }}>
                  TRIGGER FIELD
                </div>
                <select
                  value={rule.triggerField}
                  onChange={(e) => updateTrigger(rule.id, e.target.value)}
                  style={selectStyle}
                >
                  {CANONICAL_FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: 20, color: "var(--muted-foreground)", alignSelf: "flex-end", paddingBottom: 4 }}>→</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 5, color: "var(--muted-foreground)" }}>
                  TARGET FIELDS (auto-populated)
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CANONICAL_FIELDS.filter((f) => f !== rule.triggerField).map((f) => {
                    const selected = rule.targetFields.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleTarget(rule.id, f)}
                        style={{
                          padding: "3px 9px",
                          background: selected ? "#ede9fe" : "var(--muted)",
                          color: selected ? "#5b21b6" : "var(--muted-foreground)",
                          border: selected ? "1px solid #c4b5fd" : "1px solid var(--border)",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={addRule}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 14px",
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <Plus size={14} /> Add Rule
        </button>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          style={{
            padding: "8px 16px",
            background: saved ? "#d1fae5" : "var(--primary)",
            color: saved ? "#065f46" : "var(--primary-foreground)",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {saved ? "✓ Saved!" : "Save Rules"}
        </button>
      </div>
    </div>
  );
}
