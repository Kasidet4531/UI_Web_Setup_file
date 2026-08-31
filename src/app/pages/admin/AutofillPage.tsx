import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { findAutofillConflicts, type AutofillRule } from "./adminConfigModels";

const INITIAL_RULES: AutofillRule[] = [
  {
    id: "rule-1",
    name: "Reference PSF details",
    triggerField: "reference_psf_name",
    targetFields: ["product", "wafer_fab", "probecard_name", "description"],
    status: "active",
  },
  {
    id: "rule-2",
    name: "Probecard defaults",
    triggerField: "probecard_name",
    targetFields: ["product", "wafer_fab"],
    status: "active",
  },
];

const CANONICAL_FIELDS = [
  "product_type", "title", "request_for", "request_to", "reference_psf_name",
  "priority", "nc_12", "product", "wafer_fab", "probecard_name",
  "machine_type", "description", "first_die_ref", "probe_coordinate_quadrant",
  "wafer_id_format", "mirror_die_available", "prepare_fpc", "psf_setup_file_name",
  "job_file_name", "template", "layout",
];

const fieldLabel = (field: string) =>
  field
    .split("_")
    .map((part) => part === "psf" ? "PSF" : part === "nc" ? "NC" : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const cloneRules = (rules: AutofillRule[]) => rules.map((rule) => ({ ...rule, targetFields: [...rule.targetFields] }));

export function AutofillPage() {
  const [savedRules, setSavedRules] = useState<AutofillRule[]>(cloneRules(INITIAL_RULES));
  const [rules, setRules] = useState<AutofillRule[]>(cloneRules(INITIAL_RULES));
  const [selectedId, setSelectedId] = useState(INITIAL_RULES[0].id);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [targetQuery, setTargetQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  const selectedRule = rules.find((rule) => rule.id === selectedId) ?? rules[0];
  const conflicts = useMemo(() => findAutofillConflicts(rules), [rules]);
  const isDirty = JSON.stringify(rules) !== JSON.stringify(savedRules);
  const invalidRules = rules.filter((rule) => !rule.name.trim() || rule.targetFields.length === 0);
  const hasErrors = invalidRules.length > 0 || Object.keys(conflicts).length > 0;

  const filteredRules = rules.filter((rule) => {
    const matchesStatus = statusFilter === "all" || rule.status === statusFilter;
    const haystack = `${rule.name} ${rule.triggerField} ${rule.targetFields.join(" ")}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  });

  const availableTargets = CANONICAL_FIELDS.filter(
    (field) => field !== selectedRule?.triggerField && fieldLabel(field).toLowerCase().includes(targetQuery.toLowerCase()),
  );

  const updateRule = (id: string, changes: Partial<AutofillRule>) => {
    setRules((current) => current.map((rule) => rule.id === id ? { ...rule, ...changes } : rule));
  };

  const toggleTarget = (field: string) => {
    if (!selectedRule) return;
    updateRule(selectedRule.id, {
      targetFields: selectedRule.targetFields.includes(field)
        ? selectedRule.targetFields.filter((target) => target !== field)
        : [...selectedRule.targetFields, field],
    });
  };

  const addRule = () => {
    const id = `rule-${Date.now()}`;
    setRules((current) => [
      ...current,
      { id, name: "Untitled rule", triggerField: "reference_psf_name", targetFields: [], status: "active" },
    ]);
    setSelectedId(id);
    setTargetQuery("");
  };

  const deleteSelectedRule = () => {
    if (!selectedRule) return;
    const remaining = rules.filter((rule) => rule.id !== selectedRule.id);
    setRules(remaining);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const discardChanges = () => {
    const restored = cloneRules(savedRules);
    setRules(restored);
    setSelectedId(restored.some((rule) => rule.id === selectedId) ? selectedId : restored[0]?.id ?? "");
  };

  const saveChanges = () => {
    if (hasErrors) return;
    setSavedRules(cloneRules(rules));
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 2200);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-1 flex items-center gap-2 text-accent">
            <Sparkles size={16} aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Automation</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">Auto-fill rules</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Reuse values from the most recently completed matching request. Rules stay editable until you save.
          </p>
        </div>
        <button type="button" onClick={addRule} className="btn-primary min-h-9 self-start sm:self-auto">
          <Plus size={15} aria-hidden="true" /> Add rule
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.65fr)]">
        <section className="glass-panel overflow-hidden" aria-label="Auto-fill rule list">
          <div className="space-y-3 border-b border-border p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="input-base input-with-icon" placeholder="Search rules or fields" aria-label="Search auto-fill rules" />
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary/70 p-1" aria-label="Filter rules by status">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-md px-2 py-1.5 text-[11px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${statusFilter === status ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} aria-pressed={statusFilter === status}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto p-2">
            {filteredRules.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">No rules match this filter.</div>
            ) : filteredRules.map((rule) => {
              const selected = rule.id === selectedRule?.id;
              const conflictCount = conflicts[rule.id]?.length ?? 0;
              return (
                <button key={rule.id} type="button" onClick={() => { setSelectedId(rule.id); setTargetQuery(""); }} className={`mb-1 w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-accent bg-accent-light" : "border-transparent hover:border-border hover:bg-secondary/60"}`} aria-current={selected ? "true" : undefined}>
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${rule.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">{rule.name || "Untitled rule"}</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="truncate">{fieldLabel(rule.triggerField)}</span><ArrowRight size={11} aria-hidden="true" /><span className="shrink-0">{rule.targetFields.length} targets</span>
                      </span>
                      {conflictCount > 0 && <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-destructive"><AlertTriangle size={11} aria-hidden="true" /> {conflictCount} conflicts</span>}
                    </span>
                    <ChevronRight size={14} className="mt-1 text-muted-foreground" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel min-w-0 overflow-hidden" aria-label="Auto-fill rule editor">
          {selectedRule ? (
            <>
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Rule editor</p><h3 className="mt-1 text-sm font-bold text-foreground">{selectedRule.name || "Untitled rule"}</h3></div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateRule(selectedRule.id, { status: selectedRule.status === "active" ? "inactive" : "active" })} className={`min-h-8 rounded-full border px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedRule.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-border bg-secondary text-muted-foreground"}`} aria-pressed={selectedRule.status === "active"}>
                    {selectedRule.status === "active" ? "Active" : "Inactive"}
                  </button>
                  <button type="button" onClick={deleteSelectedRule} className="btn-ghost min-h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${selectedRule.name}`}><Trash2 size={14} aria-hidden="true" /> Delete</button>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-semibold text-foreground">
                    Rule name
                    <input value={selectedRule.name} onChange={(event) => updateRule(selectedRule.id, { name: event.target.value })} className="input-base font-normal" aria-invalid={!selectedRule.name.trim()} aria-describedby={!selectedRule.name.trim() ? "rule-name-error" : undefined} />
                    {!selectedRule.name.trim() && <span id="rule-name-error" className="block text-[11px] font-normal text-destructive">Enter a rule name.</span>}
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-foreground">
                    Trigger field
                    <select value={selectedRule.triggerField} onChange={(event) => updateRule(selectedRule.id, { triggerField: event.target.value, targetFields: selectedRule.targetFields.filter((field) => field !== event.target.value) })} className="input-base font-normal">
                      {CANONICAL_FIELDS.map((field) => <option key={field} value={field}>{fieldLabel(field)}</option>)}
                    </select>
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <div><h4 className="text-xs font-semibold text-foreground">Target fields</h4><p className="mt-0.5 text-[11px] text-muted-foreground">Choose every field this rule should populate.</p></div>
                    <span className="text-[11px] font-semibold text-accent">{selectedRule.targetFields.length} selected</span>
                  </div>
                  {selectedRule.targetFields.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5" aria-label="Selected target fields">
                      {selectedRule.targetFields.map((field) => (
                        <button key={field} type="button" onClick={() => toggleTarget(field)} className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${conflicts[selectedRule.id]?.includes(field) ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"}`} aria-label={`Remove ${fieldLabel(field)}`}>
                          {fieldLabel(field)} <X size={11} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="relative border-b border-border bg-secondary/35 p-2">
                      <Search size={14} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <input value={targetQuery} onChange={(event) => setTargetQuery(event.target.value)} className="input-base input-with-icon" placeholder="Find a canonical field" aria-label="Search target fields" />
                    </div>
                    <div className="grid max-h-52 overflow-y-auto sm:grid-cols-2">
                      {availableTargets.map((field) => {
                        const checked = selectedRule.targetFields.includes(field);
                        return (
                          <label key={field} className="flex min-h-10 cursor-pointer items-center gap-2 border-b border-border/60 px-3 text-xs hover:bg-secondary/50 sm:odd:border-r">
                            <input type="checkbox" checked={checked} onChange={() => toggleTarget(field)} className="size-4 accent-blue-600" />
                            <span className="min-w-0 flex-1 truncate text-foreground">{fieldLabel(field)}</span><span className="font-mono-code text-[10px] text-muted-foreground">{field}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {selectedRule.targetFields.length === 0 && <p className="mt-2 text-[11px] text-destructive">Select at least one target field.</p>}
                  {conflicts[selectedRule.id]?.length > 0 && (
                    <div className="mt-3 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-[11px] leading-4 text-destructive" role="alert">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Remove overlapping targets: {conflicts[selectedRule.id].map(fieldLabel).join(", ")}. Active rules with the same trigger cannot populate the same field.</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900 dark:bg-blue-950/50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">Rule preview</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-foreground">When <strong>{fieldLabel(selectedRule.triggerField)}</strong> matches a completed request <ArrowRight size={13} className="text-blue-600" aria-hidden="true" /> populate <strong>{selectedRule.targetFields.length} fields</strong> from the latest match.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center p-8 text-center"><div><Sparkles size={28} className="mx-auto text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-foreground">No rule selected</p><p className="mt-1 text-xs text-muted-foreground">Add a rule to start configuring auto-fill.</p></div></div>
          )}
        </section>
      </div>

      <div className={`sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between ${isDirty ? "border-amber-300 bg-amber-50/95 dark:border-amber-800 dark:bg-amber-950/95" : "border-border bg-card/95"}`}>
        <div aria-live="polite">
          <p className="text-xs font-semibold text-foreground">{savedMessage ? "Changes saved" : isDirty ? "Unsaved changes" : "All changes saved"}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hasErrors ? "Resolve validation issues before saving." : `${rules.filter((rule) => rule.status === "active").length} active rules · ${rules.length} total`}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={discardChanges} disabled={!isDirty} className="btn-secondary min-h-9 flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">Discard</button>
          <button type="button" onClick={saveChanges} disabled={!isDirty || hasErrors} className="btn-primary min-h-9 flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{savedMessage ? <Check size={14} aria-hidden="true" /> : null} Save changes</button>
        </div>
      </div>
    </div>
  );
}
