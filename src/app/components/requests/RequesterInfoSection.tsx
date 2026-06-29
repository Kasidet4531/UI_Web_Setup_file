import { useState, useEffect } from "react";
import { SectionDef, FieldDef } from "../../mock/mockFormSchema";
import { AutofillMeta, PSFRequest } from "../../mock/mockRequests";
import { AutofillBadge } from "./AutofillBadge";
import { useApp } from "../../context/AppContext";
import { Sparkles } from "lucide-react";

interface RequesterInfoSectionProps {
  section: SectionDef;
  data: Record<string, string>;
  readOnly: boolean;
  autofillMeta: AutofillMeta[];
  onChange: (key: string, value: string, autofillEdited?: boolean) => void;
  onAutofillApply?: (suggestions: Record<string, string>, sourceReqNo: string) => void;
}

const AUTOFILL_TRIGGER_FIELDS = ["reference_psf_name", "probecard_name"];

function getAutofillSuggestions(
  triggerKey: string,
  triggerValue: string,
  requests: PSFRequest[]
): { suggestions: Record<string, string>; sourceReqNo: string } | null {
  if (!triggerValue.trim()) return null;
  const completed = requests
    .filter((r) => r.status === "COMPLETED" || r.status === "PSF_CREATED")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const match = completed.find(
    (r) => r.requesterData[triggerKey] === triggerValue
  );
  if (!match) return null;
  return {
    sourceReqNo: match.requestNo,
    suggestions: {
      product: match.requesterData.product ?? "",
      wafer_fab: match.requesterData.wafer_fab ?? "",
      probecard_name: match.requesterData.probecard_name ?? "",
      description: match.requesterData.description ?? "",
    },
  };
}

export function RequesterInfoSection({
  section,
  data,
  readOnly,
  autofillMeta,
  onChange,
  onAutofillApply,
}: RequesterInfoSectionProps) {
  const { requests } = useApp();
  const [autofillSuggestion, setAutofillSuggestion] = useState<{
    suggestions: Record<string, string>;
    sourceReqNo: string;
    triggerKey: string;
  } | null>(null);

  const getFieldMeta = (fieldKey: string) =>
    autofillMeta.find((m) => m.fieldKey === fieldKey);

  const handleChange = (field: FieldDef, value: string) => {
    const meta = getFieldMeta(field.fieldKey);
    const wasAutofilled = !!meta && !meta.edited;
    onChange(field.fieldKey, value, wasAutofilled);

    if (AUTOFILL_TRIGGER_FIELDS.includes(field.fieldKey) && !readOnly) {
      const result = getAutofillSuggestions(field.fieldKey, value, requests);
      if (result) {
        setAutofillSuggestion({ ...result, triggerKey: field.fieldKey });
      } else {
        setAutofillSuggestion(null);
      }
    }
  };

  const applyAutofill = () => {
    if (!autofillSuggestion) return;
    onAutofillApply?.(autofillSuggestion.suggestions, autofillSuggestion.sourceReqNo);
    setAutofillSuggestion(null);
  };

  const renderField = (field: FieldDef) => {
    const value = data[field.fieldKey] ?? "";
    const meta = getFieldMeta(field.fieldKey);

    const inputStyle: React.CSSProperties = {
      width: "100%",
      padding: "8px 10px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      fontSize: 13,
      background: readOnly ? "var(--muted)" : "var(--input-background)",
      color: "var(--foreground)",
      boxSizing: "border-box",
      outline: "none",
    };

    let input: React.ReactNode;

    if (field.type === "radio" && field.options) {
      input = (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {field.options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: readOnly ? "default" : "pointer",
                fontSize: 13,
                fontWeight: value === opt.value ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name={field.fieldKey}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => !readOnly && handleChange(field, opt.value)}
                disabled={readOnly}
                style={{ accentColor: "var(--primary)" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    } else if (field.type === "select" && field.options) {
      input = (
        <select
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          disabled={readOnly}
          style={inputStyle}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    } else if (field.type === "textarea") {
      input = (
        <textarea
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          readOnly={readOnly}
          placeholder={field.placeholder}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );
    } else if (field.type === "date") {
      input = (
        <input
          type="date"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          readOnly={readOnly}
          style={inputStyle}
        />
      );
    } else {
      input = (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          readOnly={readOnly}
          placeholder={field.placeholder}
          style={inputStyle}
        />
      );
    }

    return (
      <div key={field.fieldKey} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
            {field.label}
            {field.required && (
              <span style={{ color: "var(--destructive)", marginLeft: 3 }}>*</span>
            )}
          </label>
          {meta && <AutofillBadge sourceRequestNo={meta.sourceRequestNo} edited={meta.edited} />}
        </div>
        {input}
      </div>
    );
  };

  const cols1 = ["product_type", "description", "title", "request_for"];
  const singleFields = section.fields.filter((f) => cols1.includes(f.fieldKey));
  const gridFields = section.fields.filter((f) => !cols1.includes(f.fieldKey));

  return (
    <div>
      {/* Autofill suggestion banner */}
      {autofillSuggestion && (
        <div
          style={{
            background: "#ede9fe",
            border: "1px solid #c4b5fd",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Sparkles size={16} color="#5b21b6" />
          <div style={{ flex: 1, fontSize: 13 }}>
            <span style={{ color: "#5b21b6", fontWeight: 500 }}>Auto-fill available</span>
            <span style={{ color: "#6d28d9", marginLeft: 8 }}>
              Matching data found from {autofillSuggestion.sourceReqNo}
            </span>
          </div>
          <button
            onClick={applyAutofill}
            style={{
              padding: "5px 12px",
              background: "#5b21b6",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Apply Auto-fill
          </button>
          <button
            onClick={() => setAutofillSuggestion(null)}
            style={{
              padding: "5px 8px",
              background: "none",
              color: "#6d28d9",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Product Type — full width at top */}
      {section.fields
        .filter((f) => f.fieldKey === "product_type")
        .map(renderField)}

      {/* Title, Request For — full width */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {section.fields
          .filter((f) => ["title", "request_for"].includes(f.fieldKey))
          .map(renderField)}
      </div>

      {/* Grid fields */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {section.fields
          .filter(
            (f) =>
              !["product_type", "title", "request_for", "description"].includes(f.fieldKey)
          )
          .map(renderField)}
      </div>

      {/* Description — full width at bottom */}
      <div style={{ marginTop: 14 }}>
        {section.fields
          .filter((f) => f.fieldKey === "description")
          .map(renderField)}
      </div>
    </div>
  );
}
