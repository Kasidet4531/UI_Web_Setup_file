import React from "react";
import { SectionDef, FieldDef } from "../../mock/mockFormSchema";
import { RequestStatus } from "../../mock/mockRequests";
import { FileUpload } from "../ui/FileUpload";
import { Lock, CheckCircle, FileCode, Check } from "lucide-react";

interface PSFCreatedSectionProps {
  section: SectionDef;
  data: Record<string, string>;
  status?: RequestStatus;
  userRole?: string;
  readOnly: boolean;
  onChange: (key: string, value: string) => void;
}

const REQUESTER_VISIBLE_STATUSES: RequestStatus[] = ["PSF_CREATED", "COMPLETED"];

export function PSFCreatedSection({
  section,
  data,
  status = "DRAFT",
  userRole = "requester",
  readOnly,
  onChange,
}: PSFCreatedSectionProps) {
  const isRequester = userRole === "requester";
  const canSeeContent =
    !isRequester || REQUESTER_VISIBLE_STATUSES.includes(status);

  if (isRequester && !canSeeContent) {
    return (
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
    );
  }

  const renderField = (field: FieldDef) => {
    const value = data[field.fieldKey] ?? "";

    if (field.type === "file" || field.fieldKey === "attachment") {
      return (
        <div key={field.fieldKey} className="space-y-1.5 col-span-full">
          <FileUpload
            label={field.label}
            hint={field.placeholder}
            value={value}
            readOnly={readOnly}
            required={field.required}
            onChange={(val) => onChange(field.fieldKey, val)}
          />
        </div>
      );
    }

    let input: React.ReactNode;
    if (field.type === "select" && field.options) {
      input = (
        <select
          value={value}
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          disabled={readOnly}
          className="input-base text-xs font-mono-code"
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
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          readOnly={readOnly}
          placeholder={field.placeholder}
          rows={2}
          className="input-base text-xs font-mono-code resize-y"
        />
      );
    } else {
      input = (
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          placeholder={field.placeholder}
          className="input-base text-xs font-mono-code"
        />
      );
    }

    return (
      <div key={field.fieldKey} className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
          <span>{field.label}</span>
          {field.required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {input}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isRequester && REQUESTER_VISIBLE_STATUSES.includes(status) && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>
            PSF setup file is complete and verified. You may copy the parameters below.
          </span>
        </div>
      )}

      <div className="p-4 bg-secondary/30 rounded-xl border border-border/70">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.fields.map(renderField)}
        </div>
      </div>
    </div>
  );
}
