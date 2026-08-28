import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { RequesterInfoSection } from "../components/requests/RequesterInfoSection";
import { PSFCreatedSection } from "../components/requests/PSFCreatedSection";
import { WorkflowStepper } from "../components/requests/WorkflowStepper";
import { StatusBadge } from "../components/requests/StatusBadge";
import { AutofillMeta } from "../mock/mockRequests";
import {
  ArrowLeft,
  Send,
  Save,
  CheckCircle2,
  FilePlus,
  Layers,
  Sparkles,
  User,
  Calendar,
  Clock,
  Info,
  ShieldAlert,
} from "lucide-react";

interface RequestFormPageProps {
  onNavigate: (path: string) => void;
}

export function RequestFormPage({ onNavigate }: RequestFormPageProps) {
  const { createRequest, updateRequest, changeStatus, currentUser, activeSchema } = useApp();
  const [data, setData] = useState<Record<string, string>>({
    request_date: new Date().toISOString().split("T")[0],
    product_type: "New Product",
    priority: "Medium",
  });
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta[]>([]);
  const [saved, setSaved] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const reqSection = activeSchema.sections.find(
    (s) => s.sectionKey === "requester_information"
  );
  const psfSection = activeSchema.sections.find(
    (s) => s.sectionKey === "psf_created_information" || s.sectionKey === "psf_created_section"
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
      formVersion: activeSchema.version,
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
      formVersion: activeSchema.version,
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
      formVersion: activeSchema.version,
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
    <div className="space-y-6 w-full">
      {/* Top Navigation Bar */}
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
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground leading-tight">
                  Create New PSF Request
                </h1>
                <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded font-mono border border-border">
                  v{activeSchema.version}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Follows 2-stage lifecycle: Requester Submission → Setup Owner Engineering
              </div>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary text-xs py-1.5"
          >
            <Save size={14} />
            <span>{saved ? "Draft Saved!" : "Save Draft"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary text-xs py-1.5 shadow-sm"
          >
            <Send size={14} />
            <span>Submit Request</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Stepper (Draft Mode) */}
      <WorkflowStepper
        status="DRAFT"
        submittedAt={null}
        psfCreatedAt={null}
        completedAt={null}
      />

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Header Summary Card */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-foreground">
                {data.title || "Untitled PSF Request"}
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-secondary px-2 py-0.5 rounded font-medium border border-border">
                  {data.product_type || "New Product"}
                </span>
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold border border-blue-200 dark:border-blue-800">
                  Priority: {data.priority || "Medium"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border text-xs">
              <div>
                <div className="text-muted-foreground text-[11px]">Probecard</div>
                <div className="font-semibold text-foreground mt-0.5">
                  {data.probecard_name || "— (Pending entry)"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11px]">Target Due Date</div>
                <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Calendar size={12} className="text-muted-foreground" />
                  <span>{data.due_date || "Not set"}</span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11px]">Requester</div>
                <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <User size={12} className="text-muted-foreground" />
                  <span>{currentUser?.name || "CurrentUser"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Requester Information */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  1. Requester Information & Specifications
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fill in test specifications and recipe requirements. Enter reference PSF to trigger smart auto-fill.
                </p>
              </div>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                Active Editable
              </span>
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
          </div>

          {/* Section 2: PSF Created Output Section (Placeholder in New Request) */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  2. PSF Setup Output & Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Assigned Setup File Owner (GNTC/MFG) will generate parameters upon submission.
                </p>
              </div>
              <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
                Setup Owner Stage
              </span>
            </div>

            {psfSection && (
              <PSFCreatedSection
                section={psfSection}
                data={{}}
                status="DRAFT"
                userRole="requester"
                readOnly={true}
                onChange={() => {}}
              />
            )}
          </div>
        </div>

        {/* Right Column (1/3): Action Center & Guidelines */}
        <div className="space-y-6">
          {/* Action Center Card */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Action Center
              </h3>
              <span className="text-[11px] text-accent font-medium">Ready to Submit</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Current Lifecycle Status</div>
                <StatusBadge status="DRAFT" size="md" />
              </div>

              {/* Assignment Information */}
              <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Role</span>
                  <span className="font-semibold text-foreground">
                    {data.request_to || "GNTC / MFG"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Request Date</span>
                  <span className="font-medium text-foreground">{data.request_date}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full btn-primary text-xs py-2.5 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                <span>Submit Request to Setup Owner</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                <span>{saved ? "Draft Saved Successfully!" : "Save Draft for Later"}</span>
              </button>
            </div>
          </div>

          {/* Submission Guidelines Card */}
          <div className="glass-panel p-5 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground pb-2 border-b border-border">
              <Sparkles size={14} className="text-accent" />
              <span>Smart Assistance</span>
            </div>
            <ul className="space-y-2 text-muted-foreground text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-accent font-bold">•</span>
                <span>
                  Entering an existing <strong>Reference PSF Name</strong> triggers auto-fill for Product, Wafer FAB, and Probecard.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-accent font-bold">•</span>
                <span>
                  Once submitted, the assigned setup owner will receive notification and start engineering verification.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-accent font-bold">•</span>
                <span>
                  The PSF Created section unlocks automatically for download once marked as <strong>PSF Created</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
