import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { RequesterInfoSection } from "../components/requests/RequesterInfoSection";
import { AutofillMeta } from "../mock/mockRequests";
import { ACTIVE_SCHEMA } from "../mock/mockFormSchema";
import {
  ArrowLeft,
  Send,
  Save,
  CheckCircle2,
  FilePlus,
  Layers,
  Sparkles,
} from "lucide-react";

interface RequestFormPageProps {
  onNavigate: (path: string) => void;
}

export function RequestFormPage({ onNavigate }: RequestFormPageProps) {
  const { createRequest, updateRequest, changeStatus, currentUser, addAuditLog } = useApp();
  const [data, setData] = useState<Record<string, string>>({
    request_date: new Date().toISOString().split("T")[0],
    product_type: "New Product",
    priority: "Medium",
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
      productType: data.product_type ?? "New Product",
      priority: (data.priority as any) ?? "Medium",
      title: data.title ?? "New PSF Request",
      dueDate: data.due_date ?? "",
      requestDate: data.request_date ?? new Date().toISOString().split("T")[0],
      autofillMeta,
    });
    setCreatedId(req.id);
    return req.id;
  };

  const handleSaveDraft = () => {
    const id = ensureCreated();
    updateRequest(id, {
      requesterData: data,
      productType: data.product_type ?? "New Product",
      priority: (data.priority as any) ?? "Medium",
      title: data.title ?? "New PSF Request",
      dueDate: data.due_date ?? "",
      autofillMeta,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleSubmit = () => {
    const id = ensureCreated();
    updateRequest(id, {
      requesterData: data,
      productType: data.product_type ?? "New Product",
      priority: (data.priority as any) ?? "Medium",
      title: data.title ?? "New PSF Request",
      dueDate: data.due_date ?? "",
      autofillMeta,
    });
    changeStatus(id, "SUBMITTED", "Submitted new request for PSF setup");
    onNavigate(`/requests/${id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("/requests")}
            className="btn-ghost text-xs py-1.5 px-2.5"
          >
            <ArrowLeft size={15} />
            <span>Cancel</span>
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center">
              <FilePlus size={16} />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Create New PSF Request
              </h1>
              <div className="text-[11px] text-muted-foreground">
                Active Form Schema v{ACTIVE_SCHEMA.version}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            className="btn-secondary text-xs py-1.5"
          >
            <Save size={14} />
            <span>{saved ? "Draft Saved!" : "Save Draft"}</span>
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary text-xs py-1.5 shadow-sm"
          >
            <Send size={14} />
            <span>Submit Request</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="glass-panel p-6 space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-sm font-bold text-foreground">
            Requester Specification Form
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in required probecard details and recipe specifications. Enter a reference PSF name
            to trigger automatic auto-fill suggestions.
          </p>
        </div>

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

        {/* Bottom Form Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles size={13} className="text-accent" />
            <span>Smart Auto-fill is active for historical matching probe cards</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveDraft}
              className="btn-secondary"
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary shadow-sm"
            >
              <Send size={14} /> Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
