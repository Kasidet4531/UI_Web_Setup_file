import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { RequesterInfoSection } from "../components/requests/RequesterInfoSection";
import { PSFCreatedSection } from "../components/requests/PSFCreatedSection";
import { StatusDropdown } from "../components/requests/StatusDropdown";
import { StatusBadge } from "../components/requests/StatusBadge";
import { AuditTimeline } from "../components/history/AuditTimeline";
import { AutofillMeta } from "../mock/mockRequests";
import { ACTIVE_SCHEMA, FORM_SCHEMA_V1, ALL_SCHEMAS } from "../mock/mockFormSchema";
import { ArrowLeft, Save, Send, History, AlertTriangle } from "lucide-react";

interface RequestDetailPageProps {
  requestId: string;
  onNavigate: (path: string) => void;
}

export function RequestDetailPage({ requestId, onNavigate }: RequestDetailPageProps) {
  const { getRequest, updateRequest, changeStatus, currentUser, getRequestLogs, addAuditLog, activeSchema } = useApp();

  const req = getRequest(requestId);

  const [requesterData, setRequesterData] = useState(req?.requesterData ?? {});
  const [psfCreatedData, setPsfCreatedData] = useState(req?.psfCreatedData ?? {});
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta[]>(req?.autofillMeta ?? []);
  const [saved, setSaved] = useState(false);

  // Draft version upgrade dialog
  const [showVersionUpgrade, setShowVersionUpgrade] = useState(() => {
    if (!req) return false;
    return (
      req.status === "DRAFT" &&
      req.formVersion < ACTIVE_SCHEMA.version
    );
  });
  const [useOldVersion, setUseOldVersion] = useState(false);

  const logs = getRequestLogs(requestId);

  if (!req) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--muted-foreground)" }}>
        Request not found.
        <button
          onClick={() => onNavigate("/requests")}
          style={{ display: "block", margin: "12px auto 0", cursor: "pointer", background: "none", border: "none", color: "var(--primary)", fontSize: 14, textDecoration: "underline" }}
        >
          ← Back to requests
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
    !(isAdmin) &&
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
      changedByRole: currentUser?.role ?? "",
      changedByDepartment: currentUser?.department,
      changedAt: new Date().toISOString(),
      reason: `Auto-filled from ${sourceReqNo}`,
    });
  };

  const handleSave = () => {
    updateRequest(req.id, { requesterData, psfCreatedData, autofillMeta });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = () => {
    updateRequest(req.id, { requesterData, psfCreatedData, autofillMeta });
    changeStatus(req.id, "SUBMITTED");
  };

  const handleVersionUpgrade = (upgrade: boolean) => {
    setShowVersionUpgrade(false);
    if (upgrade) {
      updateRequest(req.id, { formVersion: ACTIVE_SCHEMA.version });
      setUseOldVersion(false);
    } else {
      setUseOldVersion(true);
    }
  };

  const reqSection = effectiveSchema.sections.find(
    (s) => s.sectionKey === "requester_information"
  );
  const psfSection = effectiveSchema.sections.find(
    (s) => s.sectionKey === "psf_created_information"
  );

  return (
    <div>
      {/* Draft version upgrade dialog */}
      {showVersionUpgrade && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius)",
              padding: 28,
              width: 440,
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
              <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                  Form Version Update Available
                </h2>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                  This draft was created with Form Schema <strong>v{req.formVersion}</strong>, but the active schema
                  is <strong>v{ACTIVE_SCHEMA.version}</strong>. Would you like to upgrade to the latest version?
                </p>
                <ul style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 8, paddingLeft: 16, lineHeight: 1.8 }}>
                  <li><strong>Upgrade</strong>: Apply latest schema. Matching fields are preserved; new fields are added.</li>
                  <li><strong>Keep Old Version</strong>: Continue filling in the original form version.</li>
                </ul>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => handleVersionUpgrade(false)}
                style={{
                  padding: "8px 16px",
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Keep Old Version (v{req.formVersion})
              </button>
              <button
                onClick={() => handleVersionUpgrade(true)}
                style={{
                  padding: "8px 16px",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Upgrade to v{ACTIVE_SCHEMA.version}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + actions */}
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
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>PSF Requests</span>
          <span style={{ color: "var(--muted-foreground)" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{req.requestNo}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatusDropdown requestId={req.id} currentStatus={req.status} />
          <button
            onClick={() => onNavigate(`/requests/${req.id}/history`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 12px",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <History size={14} /> History
          </button>
          {!requesterSectionReadOnly && (
            <>
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 14px",
                  background: saved ? "#d1fae5" : "var(--secondary)",
                  color: saved ? "#065f46" : "var(--secondary-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <Save size={14} /> {saved ? "Saved!" : "Save Draft"}
              </button>
              {req.status === "DRAFT" && (
                <button
                  onClick={handleSubmit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 14px",
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
              )}
            </>
          )}
          {!psfSectionReadOnly && req.status !== "DRAFT" && (
            <button
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                background: saved ? "#d1fae5" : "var(--primary)",
                color: saved ? "#065f46" : "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Save size={14} /> {saved ? "Saved!" : "Save PSF Info"}
            </button>
          )}
        </div>
      </div>

      {/* Title row */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{req.title || "Untitled Request"}</h1>
          <StatusBadge status={req.status} />
          {req.setupOwnerRole && (
            <span
              style={{
                padding: "2px 10px",
                background: req.setupOwnerRole === "GNTC" ? "#dbeafe" : "#fce7f3",
                color: req.setupOwnerRole === "GNTC" ? "#1d4ed8" : "#be185d",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {req.setupOwnerRole}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>Request No: <strong>{req.requestNo}</strong></span>
          <span>Form Schema: <strong>v{useOldVersion ? req.formVersion : (req.formVersion < ACTIVE_SCHEMA.version ? ACTIVE_SCHEMA.version : req.formVersion)}</strong></span>
          <span>Requester: <strong>{req.requesterName}</strong></span>
          {req.setupOwnerName && <span>Setup Owner: <strong>{req.setupOwnerName} ({req.setupOwnerRole})</strong></span>}
          <span>Due: <strong>{req.dueDate}</strong></span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Main form */}
        <div style={{ flex: "1 1 600px", minWidth: 0 }}>
          {/* Section 1 - Requester Information */}
          {reqSection && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                1. Requester Information
              </h2>
              <RequesterInfoSection
                section={reqSection}
                data={requesterData}
                readOnly={requesterSectionReadOnly}
                autofillMeta={autofillMeta}
                onChange={handleRequesterChange}
                onAutofillApply={handleAutofillApply}
              />
            </div>
          )}

          {/* Section 2 - PSF Created Information */}
          {psfSection && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                2. PSF Created Information
              </h2>
              <PSFCreatedSection
                section={psfSection}
                data={psfCreatedData}
                status={req.status}
                userRole={currentUser?.role ?? "requester"}
                readOnly={psfSectionReadOnly}
                onChange={handlePsfChange}
              />
            </div>
          )}
        </div>

        {/* Sidebar - recent history */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>Recent Activity</h3>
            <button
              onClick={() => onNavigate(`/requests/${req.id}/history`)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: 12 }}
            >
              View all
            </button>
          </div>
          <AuditTimeline logs={logs.slice(0, 5)} compact />
        </div>
      </div>
    </div>
  );
}
