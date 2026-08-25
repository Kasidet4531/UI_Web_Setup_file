import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ACTIVE_SCHEMA,
  FormSchema,
  FieldDef,
} from "../../mock/mockFormSchema";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  Sliders,
  Code,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
  X,
} from "lucide-react";

type TabMode = "builder" | "preview" | "json";

interface FieldModalState {
  isOpen: boolean;
  isEdit: boolean;
  sectionIndex: number;
  fieldIndex: number;
  field: FieldDef;
}

const EMPTY_FIELD: FieldDef = {
  fieldKey: "",
  canonicalKey: "",
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  options: [],
};

export function FormConfigPage() {
  const { activeSchema, updateActiveSchema } = useApp();

  // Local working copy of the schema
  const [schema, setSchema] = useState<FormSchema>(() =>
    JSON.parse(JSON.stringify(activeSchema || ACTIVE_SCHEMA))
  );

  const [activeTab, setActiveTab] = useState<TabMode>("builder");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(schema, null, 2));
  const [jsonError, setJsonError] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Drag & Drop State for Fields
  const [draggedField, setDraggedField] = useState<{
    sectionIdx: number;
    fieldIdx: number;
  } | null>(null);
  const [dragOverField, setDragOverField] = useState<{
    sectionIdx: number;
    fieldIdx: number;
  } | null>(null);

  // Drag & Drop State for Sections
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<number | null>(null);

  // Field Edit / Add Modal State
  const [fieldModal, setFieldModal] = useState<FieldModalState>({
    isOpen: false,
    isEdit: false,
    sectionIndex: 0,
    fieldIndex: 0,
    field: { ...EMPTY_FIELD },
  });

  // Section Name Edit Modal State
  const [sectionModal, setSectionModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    sectionIndex: number;
    title: string;
  }>({
    isOpen: false,
    isEdit: false,
    sectionIndex: 0,
    title: "",
  });

  // Temp option input for modal
  const [newOptionValue, setNewOptionValue] = useState("");

  // Sync schema changes to JSON
  const handleSchemaUpdate = (newSchema: FormSchema) => {
    setSchema(newSchema);
    setJsonText(JSON.stringify(newSchema, null, 2));
    setJsonError("");
  };

  // ─── Save Draft vs Publish ──────────────────────────────────────────────────
  const handleSaveDraft = () => {
    updateActiveSchema(schema);
    setSaveStatus("Draft Saved Successfully!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePublish = () => {
    const nextVersion = schema.version + 1;
    const publishedSchema: FormSchema = {
      ...schema,
      version: nextVersion,
    };
    handleSchemaUpdate(publishedSchema);
    updateActiveSchema(publishedSchema);
    setSaveStatus(`Published as Schema Version v${nextVersion}!`);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleResetToDefault = () => {
    if (confirm("Reset form schema back to original default? Unsaved changes will be lost.")) {
      const resetSchema = JSON.parse(JSON.stringify(ACTIVE_SCHEMA));
      handleSchemaUpdate(resetSchema);
      updateActiveSchema(resetSchema);
      setSaveStatus("Reset to default schema.");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  // ─── JSON Sync Handler ──────────────────────────────────────────────────────
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setSchema(parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON syntax");
    }
  };

  // ─── Drag & Drop Handlers for Fields ────────────────────────────────────────
  const handleFieldDragStart = (
    e: React.DragEvent,
    sectionIdx: number,
    fieldIdx: number
  ) => {
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.effectAllowed = "move";
    setDraggedField({ sectionIdx, fieldIdx });
  };

  const handleFieldDragOver = (
    e: React.DragEvent,
    sectionIdx: number,
    fieldIdx: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      dragOverField?.sectionIdx !== sectionIdx ||
      dragOverField?.fieldIdx !== fieldIdx
    ) {
      setDragOverField({ sectionIdx, fieldIdx });
    }
  };

  const handleFieldDrop = (
    e: React.DragEvent,
    targetSectionIdx: number,
    targetFieldIdx: number
  ) => {
    e.preventDefault();
    if (!draggedField) return;

    const { sectionIdx: srcSecIdx, fieldIdx: srcFieldIdx } = draggedField;

    // If dropped on the same position, do nothing
    if (srcSecIdx === targetSectionIdx && srcFieldIdx === targetFieldIdx) {
      setDraggedField(null);
      setDragOverField(null);
      return;
    }

    const newSections = JSON.parse(JSON.stringify(schema.sections));
    const [movedItem] = newSections[srcSecIdx].fields.splice(srcFieldIdx, 1);
    newSections[targetSectionIdx].fields.splice(targetFieldIdx, 0, movedItem);

    handleSchemaUpdate({ ...schema, sections: newSections });
    setDraggedField(null);
    setDragOverField(null);
  };

  // ─── Drag & Drop Handlers for Sections ──────────────────────────────────────
  const handleSectionDragStart = (e: React.DragEvent, sectionIdx: number) => {
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.effectAllowed = "move";
    setDraggedSection(sectionIdx);
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverSection !== sectionIdx) {
      setDragOverSection(sectionIdx);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionIdx: number) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === targetSectionIdx) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const newSections = JSON.parse(JSON.stringify(schema.sections));
    const [movedSection] = newSections.splice(draggedSection, 1);
    newSections.splice(targetSectionIdx, 0, movedSection);

    handleSchemaUpdate({ ...schema, sections: newSections });
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // ─── Field CRUD Handlers ────────────────────────────────────────────────────
  const openAddField = (sectionIdx: number) => {
    setFieldModal({
      isOpen: true,
      isEdit: false,
      sectionIndex: sectionIdx,
      fieldIndex: -1,
      field: {
        fieldKey: "",
        canonicalKey: "",
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: [],
      },
    });
    setNewOptionValue("");
  };

  const openEditField = (sectionIdx: number, fieldIdx: number) => {
    const targetField = schema.sections[sectionIdx].fields[fieldIdx];
    setFieldModal({
      isOpen: true,
      isEdit: true,
      sectionIndex: sectionIdx,
      fieldIndex: fieldIdx,
      field: JSON.parse(JSON.stringify(targetField)),
    });
    setNewOptionValue("");
  };

  const handleSaveFieldModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldModal.field.label.trim()) return;

    const key =
      fieldModal.field.fieldKey.trim() ||
      fieldModal.field.label.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const finalField: FieldDef = {
      ...fieldModal.field,
      fieldKey: key,
      canonicalKey: key,
    };

    const newSections = [...schema.sections];
    if (fieldModal.isEdit) {
      newSections[fieldModal.sectionIndex].fields[fieldModal.fieldIndex] = finalField;
    } else {
      newSections[fieldModal.sectionIndex].fields.push(finalField);
    }

    handleSchemaUpdate({ ...schema, sections: newSections });
    setFieldModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteField = (sectionIdx: number, fieldIdx: number) => {
    if (confirm("Are you sure you want to delete this field?")) {
      const newSections = [...schema.sections];
      newSections[sectionIdx].fields.splice(fieldIdx, 1);
      handleSchemaUpdate({ ...schema, sections: newSections });
    }
  };

  // ─── Section CRUD Handlers ──────────────────────────────────────────────────
  const openAddSection = () => {
    setSectionModal({
      isOpen: true,
      isEdit: false,
      sectionIndex: -1,
      title: "",
    });
  };

  const openEditSection = (sectionIdx: number) => {
    setSectionModal({
      isOpen: true,
      isEdit: true,
      sectionIndex: sectionIdx,
      title: schema.sections[sectionIdx].title,
    });
  };

  const handleSaveSectionModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionModal.title.trim()) return;

    const newSections = [...schema.sections];
    if (sectionModal.isEdit) {
      newSections[sectionModal.sectionIndex].title = sectionModal.title.trim();
    } else {
      const key = sectionModal.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
      newSections.push({
        sectionKey: key,
        title: sectionModal.title.trim(),
        editableBy: ["requester", "admin"],
        visibleTo: ["requester", "setup_owner", "admin"],
        fields: [],
      });
    }

    handleSchemaUpdate({ ...schema, sections: newSections });
    setSectionModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteSection = (sectionIdx: number) => {
    if (confirm(`Delete section "${schema.sections[sectionIdx].title}" and all its fields?`)) {
      const newSections = [...schema.sections];
      newSections.splice(sectionIdx, 1);
      handleSchemaUpdate({ ...schema, sections: newSections });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-foreground">{schema.title}</h1>
            <span className="text-xs font-bold font-mono-code bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
              v{schema.version}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize form categories, input parameters, required validations, and dropdown options with Drag & Drop
          </p>
        </div>

        {/* Action Buttons: Save Draft & Publish */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDefault}
            className="btn-ghost text-xs py-1.5 px-2.5 text-muted-foreground hover:text-foreground"
            title="Reset to default schema"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="btn-secondary text-xs py-2 px-3 shadow-xs flex items-center gap-1.5"
          >
            <Save size={14} className="text-muted-foreground" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            className="btn-primary text-xs py-2 px-3.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>Publish Schema (v{schema.version + 1})</span>
          </button>
        </div>
      </div>

      {/* Save / Publish Toast Notification */}
      {saveStatus && (
        <div className="glass-panel p-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="font-semibold">{saveStatus}</span>
        </div>
      )}

      {/* Mode Switcher Tabs (Full Width) */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl border border-border">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "builder"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/30"
          }`}
        >
          <Sliders size={14} className="text-accent" />
          <span>Visual Form Builder (Drag & Drop)</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "preview"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/30"
          }`}
        >
          <Eye size={14} className="text-emerald-500" />
          <span>Live Form Preview</span>
        </button>

        <button
          onClick={() => setActiveTab("json")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "json"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/30"
          }`}
        >
          <Code size={14} className="text-purple-500" />
          <span>JSON Schema Code</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: VISUAL FORM BUILDER (DRAG & DROP)                              */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "builder" && (
        <div className="space-y-6">
          {schema.sections.map((section, sIdx) => {
            const isSectionDragged = draggedSection === sIdx;
            const isSectionDragOver = dragOverSection === sIdx && !isSectionDragged;

            return (
              <div
                key={section.sectionKey || sIdx}
                onDragOver={(e) => handleSectionDragOver(e, sIdx)}
                onDrop={(e) => handleSectionDrop(e, sIdx)}
                className={`glass-panel p-5 bg-card space-y-4 transition-all ${
                  isSectionDragOver
                    ? "ring-2 ring-accent border-accent shadow-md bg-accent/5"
                    : "border-border"
                } ${isSectionDragged ? "opacity-40 border-dashed" : ""}`}
              >
                {/* Section Header with Drag Handle */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      draggable={true}
                      onDragStart={(e) => handleSectionDragStart(e, sIdx)}
                      onDragEnd={() => {
                        setDraggedSection(null);
                        setDragOverSection(null);
                      }}
                      className="cursor-grab active:cursor-grabbing p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Drag to reorder section"
                    >
                      <GripVertical size={16} />
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                      {sIdx + 1}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-foreground truncate">
                        {section.title}
                      </h2>
                      <span className="text-[11px] font-mono-code text-muted-foreground">
                        section_key: {section.sectionKey} · {section.fields.length} fields
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditSection(sIdx)}
                      className="btn-ghost text-xs p-1.5 text-muted-foreground hover:text-foreground"
                      title="Edit Section Name"
                    >
                      <Edit2 size={13} />
                    </button>
                    {schema.sections.length > 1 && (
                      <button
                        onClick={() => handleDeleteSection(sIdx)}
                        className="btn-ghost text-xs p-1.5 text-rose-500 hover:text-rose-700"
                        title="Delete Section"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Fields List (Drag & Drop) */}
                {section.fields.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No fields in this section yet. Click "+ Add Field" below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map((field, fIdx) => {
                      const isFieldDragged =
                        draggedField?.sectionIdx === sIdx &&
                        draggedField?.fieldIdx === fIdx;
                      const isFieldDragOver =
                        dragOverField?.sectionIdx === sIdx &&
                        dragOverField?.fieldIdx === fIdx &&
                        !isFieldDragged;

                      return (
                        <div
                          key={field.fieldKey || fIdx}
                          draggable={true}
                          onDragStart={(e) => handleFieldDragStart(e, sIdx, fIdx)}
                          onDragOver={(e) => handleFieldDragOver(e, sIdx, fIdx)}
                          onDrop={(e) => handleFieldDrop(e, sIdx, fIdx)}
                          onDragEnd={() => {
                            setDraggedField(null);
                            setDragOverField(null);
                          }}
                          className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 group cursor-grab active:cursor-grabbing select-none ${
                            isFieldDragOver
                              ? "ring-2 ring-accent border-accent bg-accent/10 shadow-sm"
                              : "border-border bg-secondary/30 hover:bg-secondary/60 hover:border-accent/40"
                          } ${
                            isFieldDragged ? "opacity-30 border-dashed scale-98" : ""
                          }`}
                        >
                          {/* Grip Handle + Field Info */}
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="text-muted-foreground group-hover:text-accent pt-0.5 shrink-0">
                              <GripVertical size={15} />
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground truncate">
                                  {field.label}
                                </span>
                                {field.required && (
                                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded">
                                    Required *
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="font-mono-code bg-card px-1.5 py-0.5 rounded border border-border/80 uppercase text-[10px] font-semibold text-accent">
                                  {field.type}
                                </span>
                                {field.options && field.options.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ({field.options.length} options)
                                  </span>
                                )}
                                {field.placeholder && (
                                  <span className="text-[10px] truncate max-w-[120px] text-muted-foreground italic">
                                    "{field.placeholder}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => openEditField(sIdx, fIdx)}
                              className="p-1 rounded text-accent hover:text-accent-hover hover:bg-accent/10"
                              title="Edit Field"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(sIdx, fIdx)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                              title="Delete Field"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Field Button */}
                <button
                  type="button"
                  onClick={() => openAddField(sIdx)}
                  className="w-full py-2.5 border border-dashed border-accent/40 rounded-xl text-xs font-semibold text-accent hover:bg-accent-light/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Field to {section.title}</span>
                </button>
              </div>
            );
          })}

          {/* Add New Section Button */}
          <button
            type="button"
            onClick={openAddSection}
            className="w-full py-3.5 bg-card border-2 border-dashed border-border hover:border-accent rounded-2xl text-xs font-bold text-foreground hover:text-accent transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>Add New Form Section</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: LIVE FORM PREVIEW                                              */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="p-3 bg-secondary/60 rounded-xl border border-border text-xs text-muted-foreground flex items-center gap-2">
            <Eye size={14} className="text-emerald-500" />
            <span>
              Interactive test preview of the PSF Request form. You can test typing and selecting options below.
            </span>
          </div>

          {schema.sections.map((section) => (
            <div key={section.sectionKey} className="glass-panel p-5 bg-card space-y-4">
              <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">
                {section.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.fieldKey} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <span>{field.label}</span>
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === "select" ? (
                      <select className="input-base text-xs">
                        <option value="">{field.placeholder || "Select option..."}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "radio" ? (
                      <div className="flex items-center gap-3 pt-1">
                        {field.options?.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                            <input type="radio" name={field.fieldKey} value={opt.value} />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        className="input-base text-xs"
                      />
                    ) : field.type === "date" ? (
                      <input type="date" className="input-base text-xs" />
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="input-base text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: JSON CODE EDITOR                                               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "json" && (
        <div className="space-y-3">
          {jsonError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
              JSON Syntax Error: {jsonError}
            </div>
          )}

          <div className="glass-panel p-4 bg-card">
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={24}
              className="w-full font-mono-code text-xs p-3 bg-background border border-border rounded-lg outline-none focus:border-accent text-foreground leading-relaxed resize-y"
            />
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT FIELD DIALOG                                         */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {fieldModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h2 className="text-sm font-bold text-foreground">
                {fieldModal.isEdit ? "Edit Form Field" : "Add New Form Field"}
              </h2>
              <button
                onClick={() => setFieldModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveFieldModal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Field Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Probecard Model"
                  value={fieldModal.field.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const autoKey = label.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    setFieldModal((prev) => ({
                      ...prev,
                      field: {
                        ...prev.field,
                        label,
                        fieldKey: prev.isEdit ? prev.field.fieldKey : autoKey,
                      },
                    }));
                  }}
                  className="input-base text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Input Type</label>
                  <select
                    value={fieldModal.field.type}
                    onChange={(e) =>
                      setFieldModal((prev) => ({
                        ...prev,
                        field: { ...prev.field, type: e.target.value as any },
                      }))
                    }
                    className="input-base text-xs"
                  >
                    <option value="text">Text Input</option>
                    <option value="select">Dropdown (Select)</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="date">Date Picker</option>
                    <option value="textarea">Textarea (Multi-line)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Field Key (ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="probecard_model"
                    value={fieldModal.field.fieldKey}
                    onChange={(e) =>
                      setFieldModal((prev) => ({
                        ...prev,
                        field: { ...prev.field, fieldKey: e.target.value },
                      }))
                    }
                    className="input-base text-xs font-mono-code"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Placeholder / Example Hint</label>
                <input
                  type="text"
                  placeholder="e.g. PBC-2026-X"
                  value={fieldModal.field.placeholder || ""}
                  onChange={(e) =>
                    setFieldModal((prev) => ({
                      ...prev,
                      field: { ...prev.field, placeholder: e.target.value },
                    }))
                  }
                  className="input-base text-xs"
                />
              </div>

              {/* Required Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
                <div>
                  <div className="font-semibold text-foreground">Mandatory Field</div>
                  <div className="text-[11px] text-muted-foreground">
                    Must be filled before the requester can submit
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={fieldModal.field.required}
                  onChange={(e) =>
                    setFieldModal((prev) => ({
                      ...prev,
                      field: { ...prev.field, required: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-accent rounded cursor-pointer"
                />
              </div>

              {/* Dropdown Options Editor (Only if select or radio) */}
              {(fieldModal.field.type === "select" || fieldModal.field.type === "radio") && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="font-semibold text-foreground flex items-center justify-between">
                    <span>Dropdown / Radio Options</span>
                    <span className="text-[11px] text-muted-foreground">
                      {fieldModal.field.options?.length || 0} items
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type an option name..."
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newOptionValue.trim()) {
                            const val = newOptionValue.trim();
                            const current = fieldModal.field.options || [];
                            setFieldModal((prev) => ({
                              ...prev,
                              field: {
                                ...prev.field,
                                options: [...current, { value: val, label: val }],
                              },
                            }));
                            setNewOptionValue("");
                          }
                        }
                      }}
                      className="input-base text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newOptionValue.trim()) {
                          const val = newOptionValue.trim();
                          const current = fieldModal.field.options || [];
                          setFieldModal((prev) => ({
                            ...prev,
                            field: {
                              ...prev.field,
                              options: [...current, { value: val, label: val }],
                            },
                          }));
                          setNewOptionValue("");
                        }
                      }}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      Add
                    </button>
                  </div>

                  {/* Options Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                    {fieldModal.field.options?.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className="inline-flex items-center gap-1 bg-secondary text-foreground border border-border px-2 py-1 rounded-md text-[11px]"
                      >
                        <span>{opt.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = [...(fieldModal.field.options || [])];
                            newOpts.splice(oIdx, 1);
                            setFieldModal((prev) => ({
                              ...prev,
                              field: { ...prev.field, options: newOpts },
                            }));
                          }}
                          className="text-muted-foreground hover:text-rose-500 ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setFieldModal((prev) => ({ ...prev, isOpen: false }))}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-4 shadow-sm">
                  {fieldModal.isEdit ? "Update Field" : "Create Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT SECTION DIALOG                                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {sectionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h2 className="text-sm font-bold text-foreground">
                {sectionModal.isEdit ? "Edit Section Name" : "Add New Form Section"}
              </h2>
              <button
                onClick={() => setSectionModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSectionModal} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Section Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Probecard Parameters"
                  value={sectionModal.title}
                  onChange={(e) =>
                    setSectionModal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="input-base text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSectionModal((prev) => ({ ...prev, isOpen: false }))}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-4 shadow-sm">
                  {sectionModal.isEdit ? "Save Changes" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
