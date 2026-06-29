import { useState } from "react";
import { useApp } from "../context/AppContext";
import { RequesterInfoSection } from "../components/requests/RequesterInfoSection";
import { AutofillMeta } from "../mock/mockRequests";
import { ACTIVE_SCHEMA } from "../mock/mockFormSchema";
import { ArrowLeft, Send, Save } from "lucide-react";

interface RequestFormPageProps {
  onNavigate: (path: string) => void;
}

export function RequestFormPage({ onNavigate }: RequestFormPageProps) {
  const { createRequest, updateRequest, changeStatus, currentUser, addAuditLog, requests } = useApp();
  const [data, setData] = useState<Record<string, string>>({
    request_date: new Date().toISOString().split("T")[0],
  });
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta[]>([]);
  const [saved, setSaved] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const reqSection = ACTIVE_SCHEMA.sections.find(
    (s) => s.sectionKey === "requester_information"
  );

  const handleChange = (key: string, value: string, autofillEdited = false) => {
    setData((d) => ({ ...d, [key]: value }));
    if (autofillEdited) {
      setAutofillMeta((prev) =>
        prev.map((m) => (m.fieldKey === key ? { ...m, edited: true } : m))
      );
    }
  };

  const handleAutofillApply = (suggestions: Record<string, string>, sourceReqNo: string) => {
    setData((d) => ({ ...d, ...suggestions }));
    const newMeta: AutofillMeta[] = Object.keys(suggestions).map((k) => ({
      fieldKey: k,
      sourceRequestNo: sourceReqNo,
      edited: false,
    }));
    setAutofillMeta((prev) => {
      const filtered = prev.filter((m) => !newMeta.find((n) => n.fieldKey === m.fieldKey));
      return [...filtered, ...newMeta];
    });
  };

  const ensureCreated = () => {
    if (createdId) return createdId;
    const req = createRequest({
      requesterData: data,
      productType: data.product_type ?? "",
      priority: data.priority ?? "Medium",
      title: data.title ?? "",
      dueDate: data.due_date ?? "",
      requestDate: data.request_date ?? "",
      autofillMeta,
    });
    setCreatedId(req.id);
    return req.id;
  };

  const handleSaveDraft = () => {
    const id = ensureCreated();
    updateRequest(id, {
      requesterData: data,
      productType: data.product_type ?? "",
      priority: data.priority ?? "Medium",
      title: data.title ?? "",
      dueDate: data.due_date ?? "",
      autofillMeta,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = () => {
    const id = ensureCreated();
    updateRequest(id, {
      requesterData: data,
      productType: data.product_type ?? "",
      priority: data.priority ?? "Medium",
      title: data.title ?? "",
      dueDate: data.due_date ?? "",
      autofillMeta,
    });
    changeStatus(id, "SUBMITTED");
    onNavigate(`/requests/${id}`);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onNavigate("/requests")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ color: "var(--border)" }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>New PSF Request</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSaveDraft}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 14px",
              background: saved ? "#d1fae5" : "var(--secondary)",
              color: saved ? "#065f46" : "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <Save size={14} /> {saved ? "Draft Saved!" : "Save as Draft"}
          </button>
          <button
            onClick={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
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
            <Send size={14} /> Submit Request
          </button>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 24,
          maxWidth: 860,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          Requester Information
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20 }}>
          Form Schema v{ACTIVE_SCHEMA.version} · Fill in all required fields before submitting.
        </p>
        {reqSection && (
          <RequesterInfoSection
            section={reqSection}
            data={data}
            readOnly={false}
            autofillMeta={autofillMeta}
            onChange={handleChange}
            onAutofillApply={handleAutofillApply}
          />
        )}
      </div>
    </div>
  );
}
