import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DynamicFormRenderer } from "../components/requests/DynamicFormRenderer";
import { StatusDropdown } from "../components/requests/StatusDropdown";
import { StatusBadge } from "../components/requests/StatusBadge";
import { WorkflowStepper } from "../components/requests/WorkflowStepper";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { AutofillMeta } from "../mock/mockRequests";
import { ACTIVE_SCHEMA, ALL_SCHEMAS } from "../mock/mockFormSchema";
import {
  ArrowLeft,
  Save,
  Send,
  History,
  AlertTriangle,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

interface RequestDetailPageProps {
  requestId: string;
  onNavigate: (path: string) => void;
}

export function RequestDetailPage({ requestId, onNavigate }: RequestDetailPageProps) {
  const {
    getRequest,
    updateRequest,
    changeStatus,
    currentUser,
    getRequestLogs,
    addAuditLog,
    activeSchema,
  } = useApp();

  const req = getRequest(requestId);

  const [requesterData, setRequesterData] = useState(req?.requesterData ?? {});
  const [psfCreatedData, setPsfCreatedData] = useState(req?.psfCreatedData ?? {});
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta[]>(req?.autofillMeta ?? []);
  const [saved, setSaved] = useState(false);

  // Draft version upgrade dialog
  const [showVersionUpgrade, setShowVersionUpgrade] = useState(() => {
    if (!req) return false;
    return req.status === "DRAFT" && req.formVersion < ACTIVE_SCHEMA.version;
  });
  const [useOldVersion, setUseOldVersion] = useState(false);

  const logs = getRequestLogs(requestId);

  if (!req) {
    return (
      <div className="glass-panel text-center py-16 px-4 max-w-md mx-auto my-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-base font-semibold text-foreground">Request Not Found</h3>
        <p className="text-xs text-muted-foreground">
          The requested PSF request ID does not exist or may have been removed.
        </p>
        <button
          onClick={() => onNavigate("/requests")}
          className="btn-primary text-xs mt-2"
        >
          ← Back to Requests List
        </button>
      </div>
    );
  }

  const effectiveSchema = useOldVersion
    ? ALL_SCHEMAS.find((s) => s.version === req.formVersion) ?? activeSchema
    : activeSchema;

  const isRequester = currentUser?.role === "requester";
  const isSetupOwner = currentUser?.role === "setup_owner";
  const isAdmin = currentUser?.role === "admin";

  // Requester can edit only their own draft
  const requesterSectionReadOnly =
    !isAdmin &&
    !(isRequester && req.requester === currentUser?.username && req.status === "DRAFT");

  const psfSectionReadOnly = !(isSetupOwner || isAdmin);

  const handleRequesterChange = (key: string, value: string, autofillEdited = false) => {
    setRequesterData((d) => ({ ...d, [key]: value }));
    if (autofillEdited) {
      setAutofillMeta((prev) =>
        prev.map((m) => (m.fieldKey === key ? { ...m, edited: true } : m))
      );
    }
  };

  const handlePsfChange = (key: string, value: string) => {
    setPsfCreatedData((d) => ({ ...d, [key]: value }));
  };

  const handleAutofillApply = (suggestions: Record<string, string>, sourceReqNo: string) => {
    setRequesterData((d) => ({ ...d, ...suggestions }));
    const newMeta: AutofillMeta[] = Object.keys(suggestions).map((k) => ({
      fieldKey: k,
      sourceRequestNo: sourceReqNo,
      edited: false,
    }));
    setAutofillMeta((prev) => {
      const filtered = prev.filter((m) => !newMeta.find((n) => n.fieldKey === m.fieldKey));
      return [...filtered, ...newMeta];
    });
    addAuditLog({
      requestId: req.id,
      requestNo: req.requestNo,
      actionType: "USE_AUTOFILL",
      fieldKey: "multiple",
      fieldLabel: "Auto-fill Applied",
      oldValue: undefined,
      newValue: Object.keys(suggestions).join(", "),
      changedBy: currentUser?.username ?? "",
      changedByName: currentUser?.name ?? "",
      changedByRole: currentUser?.role ?? "requester",
      changedByDepartment: currentUser?.department ?? null,
      changedAt: new Date().toISOString(),
      reason: `Auto-filled ${Object.keys(suggestions).length} fields from ${sourceReqNo}`,
    });
  };

  const handleSave = () => {
    updateRequest(req.id, {
      requesterData,
      psfCreatedData,
      autofillMeta,
      productType: requesterData.product_type ?? req.productType,
      priority: (requesterData.priority as any) ?? req.priority,
      title: requesterData.title ?? req.title,
      dueDate: requesterData.due_date ?? req.dueDate,
    });
    addAuditLog({
      requestId: req.id,
      requestNo: req.requestNo,
      actionType: "UPDATE_FIELD",
      fieldKey: "form_data",
      fieldLabel: "Request Form Updated",
      changedBy: currentUser?.username ?? "",
      changedByName: currentUser?.name ?? "",
      changedByRole: currentUser?.role ?? "requester",
      changedByDepartment: currentUser?.department ?? null,
      changedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleSubmitDraft = () => {
    handleSave();
    changeStatus(req.id, "SUBMITTED");
  };

  const reqSection = effectiveSchema.sections.find(
    (s) => s.sectionKey === "requester_information"
  );
  const psfSection = effectiveSchema.sections.find(
    (s) => s.sectionKey === "psf_created_information" || s.sectionKey === "psf_created_section"
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("/requests")}
            className="btn-ghost text-xs py-1.5 px-2.5"
          >
            <ArrowLeft size={15} />
            <span>Back to Requests</span>
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-sm font-bold text-foreground">
              {req.requestNo}
            </span>
            <StatusBadge status={req.status} size="sm" />
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {req.status === "DRAFT" && (isRequester || isAdmin) && (
            <>
              <button
                onClick={handleSave}
                className="btn-secondary text-xs py-1.5"
              >
                <Save size={14} />
                <span>{saved ? "Saved!" : "Save Draft"}</span>
              </button>
              <button
                onClick={handleSubmitDraft}
                className="btn-primary text-xs py-1.5 shadow-sm"
              >
                <Send size={14} />
                <span>Submit Request</span>
              </button>
            </>
          )}

          {req.status !== "DRAFT" && (!requesterSectionReadOnly || !psfSectionReadOnly) && (
            <button
              onClick={handleSave}
              className="btn-primary text-xs py-1.5 shadow-sm"
            >
              <Save size={14} />
              <span>{saved ? "Saved Successfully!" : "Save Changes"}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate(`/requests/${req.id}/history`)}
            className="btn-secondary text-xs py-1.5"
          >
            <History size={14} />
            <span>Full History</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Stepper */}
      <WorkflowStepper
        status={req.status}
        submittedAt={req.submittedAt}
        psfCreatedAt={req.psfCreatedAt}
        completedAt={req.completedAt}
      />

      {/* Version Upgrade Banner if applicable */}
      {showVersionUpgrade && (
        <div className="glass-panel p-4 border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>Form Schema Update Available</span>
            </div>
            <p className="text-purple-700 dark:text-purple-400 text-[11px]">
              This draft was created with schema v{req.formVersion}. The active schema is now v
              {ACTIVE_SCHEMA.version}. You can upgrade seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setUseOldVersion(true);
                setShowVersionUpgrade(false);
              }}
              className="btn-secondary text-xs py-1"
            >
              Keep v{req.formVersion}
            </button>
            <button
              onClick={() => {
                updateRequest(req.id, { formVersion: ACTIVE_SCHEMA.version });
                setShowVersionUpgrade(false);
              }}
              className="btn-primary text-xs py-1"
            >
              Upgrade to v{ACTIVE_SCHEMA.version}
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Summary Card */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-foreground">
                {req.title || "Untitled PSF Request"}
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-secondary px-2 py-0.5 rounded font-medium border border-border">
                  {req.productType || "General Product"}
                </span>
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold border border-blue-200 dark:border-blue-800">
                  Priority: {req.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border text-xs">
              <div>
                <div className="text-muted-foreground text-[11px]">Probecard</div>
                <div className="font-semibold text-foreground mt-0.5">
                  {req.requesterData?.probecard_name || "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11px]">Due Date</div>
                <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Calendar size={12} className="text-muted-foreground" />
                  <span>{req.dueDate || "Not specified"}</span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11px]">Requester</div>
                <div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <User size={12} className="text-muted-foreground" />
                  <span>{req.requesterName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Form Sections from Effective Schema */}
          <DynamicFormRenderer
            schema={effectiveSchema}
            requesterData={requesterData}
            psfCreatedData={psfCreatedData}
            onRequesterChange={handleRequesterChange}
            onPsfChange={handlePsfChange}
            autofillMeta={autofillMeta}
            onAutofillApply={handleAutofillApply}
            status={req.status}
            userRole={currentUser?.role}
            isNewRequest={false}
          />
        </div>

        {/* Right Column (1/3): Action Center & Audit Timeline */}
        <div className="space-y-6">
          {/* Action Center Card */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Action Center
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-muted-foreground mb-1.5 font-medium">Current Status</div>
                <div className="flex items-center">
                  <StatusDropdown
                    requestId={req.id}
                    currentStatus={req.status}
                    onChanged={handleSave}
                  />
                </div>
              </div>

              {/* Assignment Information */}
              <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Setup Owner</span>
                  <span className="font-semibold text-foreground">
                    {req.setupOwnerName || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-semibold text-foreground">
                    {req.setupOwnerRole || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Request Date</span>
                  <span className="font-medium text-foreground">{req.requestDate || "—"}</span>
                </div>
              </div>

              {/* Quick Workflow Action Shortcuts */}
              {isSetupOwner && req.status === "SUBMITTED" && (
                <button
                  onClick={() => changeStatus(req.id, "SETUP_IN_PROGRESS", "Accepted request and started setup engineering")}
                  className="w-full btn-primary text-xs py-2 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Accept & Start Setup</span>
                </button>
              )}

              {isSetupOwner && req.status === "SETUP_IN_PROGRESS" && (
                <button
                  onClick={() => changeStatus(req.id, "PSF_CREATED", "PSF setup file generated and ready for requester review")}
                  className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 text-xs py-2 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark PSF Created</span>
                </button>
              )}

              {(isSetupOwner || isRequester || isAdmin) && req.status === "PSF_CREATED" && (
                <button
                  onClick={() => changeStatus(req.id, "COMPLETED", "Setup verified and request completed")}
                  className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Request Completed</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Activity & Audit Timeline Feed */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History size={13} />
                <span>Audit History</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate(`/requests/${req.id}/history`)}
                className="text-[11px] text-accent hover:underline font-semibold"
              >
                View Full ({logs.length})
              </button>
            </div>

            <AuditTimeline logs={logs} compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
