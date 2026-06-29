import { useState } from "react";
import { ACTIVE_SCHEMA, FormSchema } from "../../mock/mockFormSchema";
import { Eye, Code, Save, CheckCircle } from "lucide-react";

export function FormConfigPage() {
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(ACTIVE_SCHEMA, null, 2)
  );
  const [parseError, setParseError] = useState("");
  const [preview, setPreview] = useState<FormSchema | null>(ACTIVE_SCHEMA);
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [saved, setSaved] = useState(false);

  const handleSchemaChange = (text: string) => {
    setSchemaText(text);
    try {
      const parsed = JSON.parse(text);
      setPreview(parsed);
      setParseError("");
    } catch (e: unknown) {
      setParseError((e as Error).message);
      setPreview(null);
    }
  };

  const handleSave = () => {
    if (parseError || !preview) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "var(--muted)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <button
            onClick={() => setTab("editor")}
            style={{
              padding: "7px 14px",
              background: tab === "editor" ? "var(--primary)" : "none",
              color: tab === "editor" ? "var(--primary-foreground)" : "var(--muted-foreground)",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Code size={14} /> JSON Editor
          </button>
          <button
            onClick={() => setTab("preview")}
            style={{
              padding: "7px 14px",
              background: tab === "preview" ? "var(--primary)" : "none",
              color: tab === "preview" ? "var(--primary-foreground)" : "var(--muted-foreground)",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Eye size={14} /> Live Preview
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!!parseError || !preview}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 14px",
            background: saved ? "#d1fae5" : parseError ? "var(--muted)" : "var(--primary)",
            color: saved ? "#065f46" : parseError ? "var(--muted-foreground)" : "var(--primary-foreground)",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: parseError ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {saved ? <><CheckCircle size={14} /> Published!</> : <><Save size={14} /> Save & Publish</>}
        </button>
        {saved && (
          <span style={{ fontSize: 12, color: "#065f46" }}>
            Form schema v{(preview?.version ?? 0) + 1} would be published.
          </span>
        )}
      </div>

      {tab === "editor" ? (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {parseError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "8px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                JSON Error: {parseError}
              </div>
            )}
            <textarea
              value={schemaText}
              onChange={(e) => handleSchemaChange(e.target.value)}
              style={{
                width: "100%",
                height: 600,
                padding: 14,
                fontFamily: "monospace",
                fontSize: 12,
                border: `1px solid ${parseError ? "#ef4444" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                background: "var(--card)",
                color: "var(--foreground)",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
            />
          </div>
          <div
            style={{
              width: 280,
              background: "var(--muted)",
              borderRadius: "var(--radius)",
              padding: 14,
              fontSize: 12,
              color: "var(--muted-foreground)",
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>Schema Guide</div>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li><code>formKey</code> — unique form identifier</li>
              <li><code>version</code> — increment when publishing</li>
              <li><code>sections[]</code> — ordered form sections</li>
              <li><code>fields[].type</code> — text, select, radio, textarea, date</li>
              <li><code>fields[].required</code> — validation flag</li>
              <li><code>fields[].searchable</code> — index for search</li>
              <li><code>fields[].autofillTrigger</code> — triggers auto-fill lookup</li>
              <li><code>visibleWhenStatusIn</code> — section visibility by status</li>
              <li><code>editableBy</code> — roles that can edit</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {preview ? (
            <div>
              <div style={{ marginBottom: 12, fontSize: 13, color: "var(--muted-foreground)" }}>
                Form: <strong>{preview.title}</strong> · v{preview.version} · {preview.sections.length} sections
              </div>
              {preview.sections.map((section) => (
                <div
                  key={section.sectionKey}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: 20,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>{section.title}</h3>
                    {section.visibleWhenStatusIn && (
                      <span style={{ fontSize: 11, color: "#7c3aed", background: "#ede9fe", padding: "1px 7px", borderRadius: 10 }}>
                        Visible when: {section.visibleWhenStatusIn.join(", ")}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {section.fields.map((field) => (
                      <div
                        key={field.fieldKey}
                        style={{
                          border: "1px dashed var(--border)",
                          borderRadius: "var(--radius)",
                          padding: "8px 10px",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 3 }}>
                          {field.label}
                          {field.required && <span style={{ color: "var(--destructive)", marginLeft: 3 }}>*</span>}
                        </div>
                        <div style={{ color: "var(--muted-foreground)", display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ background: "var(--muted)", padding: "0 5px", borderRadius: 4 }}>{field.type}</span>
                          {field.searchable && <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "0 5px", borderRadius: 4 }}>searchable</span>}
                          {field.autofillTrigger && <span style={{ background: "#ede9fe", color: "#5b21b6", padding: "0 5px", borderRadius: 4 }}>autofill</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#991b1b", padding: 20 }}>
              Cannot preview — JSON is invalid. Fix errors in the editor first.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
