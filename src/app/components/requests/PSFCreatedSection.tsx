import { SectionDef, FieldDef } from "../../mock/mockFormSchema";
import { RequestStatus } from "../../mock/mockRequests";
import { Lock, CheckCircle } from "lucide-react";

interface PSFCreatedSectionProps {
  section: SectionDef;
  data: Record<string, string>;
  status: RequestStatus;
  userRole: string;
  readOnly: boolean;
  onChange: (key: string, value: string) => void;
}

const REQUESTER_VISIBLE_STATUSES: RequestStatus[] = ["PSF_CREATED", "COMPLETED"];

export function PSFCreatedSection({
  section,
  data,
  status,
  userRole,
  readOnly,
  onChange,
}: PSFCreatedSectionProps) {
  const isRequester = userRole === "requester";
  const canSeeContent =
    !isRequester || REQUESTER_VISIBLE_STATUSES.includes(status);

  if (isRequester && !canSeeContent) {
    return (
      <div
        style={{
          background: "var(--muted)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius)",
          padding: 32,
          textAlign: "center",
          color: "var(--muted-foreground)",
        }}
      >
        <Lock
          size={32}
          style={{ margin: "0 auto 12px", opacity: 0.4 }}
        />
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          PSF setup information is not available yet.
        </p>
        <p style={{ fontSize: 13 }}>
          This section will be visible after the Setup File Owner completes the PSF setup and updates the status to{" "}
          <strong>PSF Created</strong>.
        </p>
      </div>
    );
  }

  const inputStyle = (readOnly: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "8px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: readOnly ? "var(--muted)" : "var(--input-background)",
    color: "var(--foreground)",
    boxSizing: "border-box",
    outline: "none",
  });

  const renderField = (field: FieldDef) => {
    const value = data[field.fieldKey] ?? "";

    let input: React.ReactNode;
    if (field.type === "select" && field.options) {
      input = (
        <select
          value={value}
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          disabled={readOnly}
          style={inputStyle(readOnly)}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    } else {
      input = (
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          placeholder={field.placeholder}
          style={inputStyle(readOnly)}
        />
      );
    }

    return (
      <div key={field.fieldKey} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>
          {field.label}
          {field.required && (
            <span style={{ color: "var(--destructive)", marginLeft: 3 }}>*</span>
          )}
        </label>
        {input}
      </div>
    );
  };

  return (
    <div>
      {isRequester && REQUESTER_VISIBLE_STATUSES.includes(status) && (
        <div
          style={{
            background: "#d1fae5",
            border: "1px solid #6ee7b7",
            borderRadius: "var(--radius)",
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#065f46",
          }}
        >
          <CheckCircle size={16} />
          PSF setup has been completed. You can now view the setup information below (read-only).
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {section.fields.map(renderField)}
      </div>
    </div>
  );
}
