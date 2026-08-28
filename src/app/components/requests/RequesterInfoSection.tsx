import React, { useState } from "react";
import { SectionDef, FieldDef } from "../../mock/mockFormSchema";
import { AutofillMeta, PSFRequest } from "../../mock/mockRequests";
import { AutofillBadge } from "./AutofillBadge";
import { FileUpload } from "../ui/FileUpload";
import { useApp } from "../../context/AppContext";
import { Sparkles, Check, X, Info } from "lucide-react";

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

    if (field.type === "file" || field.fieldKey === "attachment") {
      return (
        <div key={field.fieldKey} className="space-y-1.5 col-span-full">
          <FileUpload
            label={field.label}
            hint={field.placeholder}
            value={value}
            readOnly={readOnly}
            required={field.required}
            onChange={(val) => handleChange(field, val)}
          />
        </div>
      );
    }

    let input: React.ReactNode;

    if (field.type === "radio" && field.options) {
      input = (
        <div className="flex gap-4 flex-wrap pt-1">
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                value === opt.value
                  ? "bg-accent-light border-accent text-accent font-semibold shadow-2xs"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              } ${readOnly ? "opacity-75 cursor-default pointer-events-none" : ""}`}
            >
              <input
                type="radio"
                name={field.fieldKey}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => !readOnly && handleChange(field, opt.value)}
                disabled={readOnly}
                className="accent-accent"
              />
              <span>{opt.label}</span>
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
          className="input-base text-xs"
        >
          <option value="">Select option...</option>
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
          className="input-base text-xs resize-y"
        />
      );
    } else if (field.type === "date") {
      input = (
        <input
          type="date"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          readOnly={readOnly}
          className="input-base text-xs"
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
          className="input-base text-xs"
        />
      );
    }

    return (
      <div key={field.fieldKey} className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>{field.label}</span>
            {field.required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {meta && <AutofillBadge sourceRequestNo={meta.sourceRequestNo} edited={meta.edited} />}
        </div>
        {input}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Autofill suggestion banner */}
      {autofillSuggestion && (
        <div className="glass-panel p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={15} />
            </div>
            <div>
              <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                Auto-fill Reference Detected
              </div>
              <p className="text-indigo-700 dark:text-indigo-400 text-[11px]">
                Matching historical specs found from{" "}
                <strong className="font-mono">{autofillSuggestion.sourceReqNo}</strong>. Apply to
                prefill wafer fab, probecard, and description?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setAutofillSuggestion(null)}
              className="btn-ghost text-xs text-indigo-700 dark:text-indigo-300 py-1"
            >
              Dismiss
            </button>
            <button
              onClick={applyAutofill}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-xs py-1 shadow-sm"
            >
              <Check size={13} /> Apply Auto-fill
            </button>
          </div>
        </div>
      )}

      {/* Primary Category: Product Selection */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border/70 space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          1. Product Classification
        </div>
        {section.fields
          .filter((f) => f.fieldKey === "product_type")
          .map(renderField)}
      </div>

      {/* General Information */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border/70 space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          2. General Specifications
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.fields
            .filter((f) => ["title", "request_for", "request_to", "priority", "request_date", "due_date"].includes(f.fieldKey))
            .map(renderField)}
        </div>
      </div>

      {/* Probecard & Engineering Data Grid */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border/70 space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          3. Probecard & Test Parameters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.fields
            .filter(
              (f) =>
                ![
                  "product_type",
                  "title",
                  "request_for",
                  "request_to",
                  "priority",
                  "request_date",
                  "due_date",
                  "description",
                  "attachment",
                ].includes(f.fieldKey)
            )
            .map(renderField)}
        </div>
      </div>

      {/* Notes / Description & Attachments */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border/70 space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          4. Special Instructions & Attachments
        </div>
        <div className="space-y-4">
          {section.fields
            .filter((f) => ["description", "attachment"].includes(f.fieldKey) || f.type === "file")
            .map(renderField)}
        </div>
      </div>
    </div>
  );
}
