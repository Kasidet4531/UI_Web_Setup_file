import React, { useState } from "react";
import { FormSchema, SectionDef, FieldDef } from "../../mock/mockFormSchema";
import { AutofillMeta, PSFRequest, RequestStatus } from "../../mock/mockRequests";
import { AutofillBadge } from "./AutofillBadge";
import { FileUpload } from "../ui/FileUpload";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  Check,
  Lock,
  CheckCircle,
  FileCode,
  Layers,
  AlertCircle,
  Info,
} from "lucide-react";

interface DynamicFormRendererProps {
  schema: FormSchema;
  requesterData: Record<string, string>;
  psfCreatedData: Record<string, string>;
  onRequesterChange: (key: string, value: string, autofillEdited?: boolean) => void;
  onPsfChange: (key: string, value: string) => void;
  autofillMeta?: AutofillMeta[];
  onAutofillApply?: (suggestions: Record<string, string>, sourceReqNo: string) => void;
  status?: RequestStatus;
  userRole?: string;
  isNewRequest?: boolean;
}

const AUTOFILL_TRIGGER_FIELDS = ["reference_psf_name", "probecard_name"];
const REQUESTER_VISIBLE_STATUSES: RequestStatus[] = ["PSF_CREATED", "COMPLETED"];

function getAutofillSuggestions(
  triggerKey: string,
  triggerValue: string,
  requests: PSFRequest[]
): { suggestions: Record<string, string>; sourceReqNo: string } | null {
  if (!triggerValue.trim()) return null;
  const completed = requests
    .filter((r) => r.status === "COMPLETED" || r.status === "PSF_CREATED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const match = completed.find((r) => r.requesterData[triggerKey] === triggerValue);
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

export function DynamicFormRenderer({
  schema,
  requesterData,
  psfCreatedData,
  onRequesterChange,
  onPsfChange,
  autofillMeta = [],
  onAutofillApply,
  status = "DRAFT",
  userRole = "requester",
  isNewRequest = false,
}: DynamicFormRendererProps) {
  const { requests, currentUser } = useApp();
  const role = userRole || currentUser?.role || "requester";
  const isRequester = role === "requester";
  const isSetupOwner = role === "setup_owner";
  const isAdmin = role === "admin";

  const [autofillSuggestion, setAutofillSuggestion] = useState<{
    suggestions: Record<string, string>;
    sourceReqNo: string;
    triggerKey: string;
  } | null>(null);

  const getFieldMeta = (fieldKey: string) => autofillMeta.find((m) => m.fieldKey === fieldKey);

  const handleFieldChange = (
    section: SectionDef,
    field: FieldDef,
    value: string,
    isPsfSection: boolean
  ) => {
    if (isPsfSection) {
      onPsfChange(field.fieldKey, value);
    } else {
      const meta = getFieldMeta(field.fieldKey);
      const wasAutofilled = !!meta && !meta.edited;
      onRequesterChange(field.fieldKey, value, wasAutofilled);

      if (AUTOFILL_TRIGGER_FIELDS.includes(field.fieldKey) && (isNewRequest || status === "DRAFT")) {
        const result = getAutofillSuggestions(field.fieldKey, value, requests);
        if (result) {
          setAutofillSuggestion({ ...result, triggerKey: field.fieldKey });
        } else {
          setAutofillSuggestion(null);
        }
      }
    }
  };

  const applyAutofill = () => {
    if (!autofillSuggestion) return;
    onAutofillApply?.(autofillSuggestion.suggestions, autofillSuggestion.sourceReqNo);
    setAutofillSuggestion(null);
  };

  const renderFieldInput = (
    section: SectionDef,
    field: FieldDef,
    value: string,
    readOnly: boolean,
    isPsfSection: boolean
  ) => {
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
            onChange={(val) => handleFieldChange(section, field, val, isPsfSection)}
          />
        </div>
      );
    }

    let input: React.ReactNode;

    if (field.type === "radio" && field.options) {
      input = (
        <div className="flex gap-3 flex-wrap pt-1">
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                value === opt.value
                  ? "bg-accent-light border-accent text-accent font-semibold shadow-2xs ring-1 ring-accent/30"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              } ${readOnly ? "opacity-75 cursor-default pointer-events-none" : ""}`}
            >
              <input
                type="radio"
                name={`${section.sectionKey}_${field.fieldKey}`}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => !readOnly && handleFieldChange(section, field, opt.value, isPsfSection)}
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
          onChange={(e) => handleFieldChange(section, field, e.target.value, isPsfSection)}
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
          onChange={(e) => handleFieldChange(section, field, e.target.value, isPsfSection)}
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
          onChange={(e) => handleFieldChange(section, field, e.target.value, isPsfSection)}
          readOnly={readOnly}
          className="input-base text-xs"
        />
      );
    } else {
      input = (
        <input
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(section, field, e.target.value, isPsfSection)}
          readOnly={readOnly}
          placeholder={field.placeholder}
          className="input-base text-xs"
        />
      );
    }

    const isFullWidth = field.type === "textarea" || field.type === "radio";

    return (
      <div
        key={field.fieldKey}
        className={`space-y-1.5 ${isFullWidth ? "col-span-full" : ""}`}
      >
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
    <div className="space-y-6">
      {/* Smart Auto-fill suggestion banner */}
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
              type="button"
              onClick={() => setAutofillSuggestion(null)}
              className="btn-ghost text-xs text-indigo-700 dark:text-indigo-300 py-1"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={applyAutofill}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-xs py-1 shadow-sm"
            >
              <Check size={13} /> Apply Auto-fill
            </button>
          </div>
        </div>
      )}

      {/* Dynamically Render All Sections in Schema */}
      {schema.sections.map((section, sIdx) => {
        const isPsfSection =
          section.sectionKey === "psf_created_information" ||
          section.sectionKey === "psf_created_section";

        const sectionData = isPsfSection ? psfCreatedData : requesterData;

        // Determine if section is editable based on role & workflow status
        let isReadOnly = false;
        if (isNewRequest) {
          isReadOnly = isPsfSection; // In new request, PSF section is locked placeholder
        } else if (isPsfSection) {
          isReadOnly = !(isSetupOwner || isAdmin);
        } else {
          // Requester section in detail mode is read-only unless admin or requester on their own draft
          isReadOnly = !isAdmin && !(isRequester && status === "DRAFT");
        }

        // Determine if requester can see content or placeholder
        const canRequesterSeeContent =
          !isRequester || REQUESTER_VISIBLE_STATUSES.includes(status);

        const showLockedPlaceholder = isPsfSection && isRequester && !canRequesterSeeContent;

        return (
          <div key={section.sectionKey || sIdx} className="glass-panel p-5 space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{sIdx + 1}. {section.title}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPsfSection
                    ? isReadOnly
                      ? "Completed by Setup Owner (GNTC/MFG) during engineering workflow"
                      : "Provide generated PSF file name, coordinate quadrant, and template files"
                    : isReadOnly
                    ? "Read-only for current workflow stage"
                    : "Fill in recipe requirements and specifications"}
                </p>
              </div>

              <div>
                {isReadOnly ? (
                  <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
                    {isPsfSection ? "Setup Owner Only" : "Locked"}
                  </span>
                ) : (
                  <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                    Active Editable
                  </span>
                )}
              </div>
            </div>

            {/* Section Body */}
            {showLockedPlaceholder ? (
              <div className="p-8 rounded-xl border border-dashed border-border bg-secondary/30 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground mx-auto flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  PSF Setup Output Not Generated Yet
                </div>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  This section will be populated once the assigned Setup File Owner (GNTC/MFG) completes
                  engineering parameters and flags status as <strong>PSF Created</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isPsfSection && isRequester && REQUESTER_VISIBLE_STATUSES.includes(status) && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      PSF setup file is complete and verified. You may copy or download parameters below.
                    </span>
                  </div>
                )}

                <div className="p-4 bg-secondary/20 rounded-xl border border-border/70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.fields.map((field) =>
                      renderFieldInput(
                        section,
                        field,
                        sectionData[field.fieldKey] ?? "",
                        isReadOnly,
                        isPsfSection
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
