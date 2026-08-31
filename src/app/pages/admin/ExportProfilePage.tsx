import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  GripVertical,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { DEFAULT_EXPORT_COLUMNS, type ExportProfile } from "../../mock/mockExportProfile";
import {
  cloneProfiles,
  moveColumn,
  removeExportProfile,
  setDefaultExportProfile,
} from "./adminConfigModels";

export function ExportProfilePage() {
  const { exportProfiles, updateExportProfiles } = useApp();
  const [savedProfiles, setSavedProfiles] = useState<ExportProfile[]>(cloneProfiles(exportProfiles));
  const [profiles, setProfiles] = useState<ExportProfile[]>(cloneProfiles(exportProfiles));
  const [selectedId, setSelectedId] = useState(exportProfiles.find((profile) => profile.isDefault)?.id ?? exportProfiles[0]?.id ?? "");
  const [profileQuery, setProfileQuery] = useState("");
  const [columnQuery, setColumnQuery] = useState("");
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const selectedProfile = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];
  const selectedIndex = profiles.findIndex((profile) => profile.id === selectedProfile?.id);
  const isDirty = JSON.stringify(profiles) !== JSON.stringify(savedProfiles);
  const hasErrors = profiles.some((profile) => !profile.name.trim()) || !profiles.some((profile) => profile.isDefault);

  const filteredProfiles = profiles.filter((profile) =>
    `${profile.name} ${profile.description ?? ""}`.toLowerCase().includes(profileQuery.toLowerCase()),
  );

  const filteredColumns = useMemo(() => {
    if (!selectedProfile) return [];
    const normalized = columnQuery.toLowerCase();
    return selectedProfile.columns
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => `${column.label} ${column.source} ${column.key}`.toLowerCase().includes(normalized));
  }, [selectedProfile, columnQuery]);

  const updateSelectedProfile = (changes: Partial<ExportProfile>) => {
    if (!selectedProfile) return;
    setProfiles((current) => current.map((profile) => profile.id === selectedProfile.id ? { ...profile, ...changes } : profile));
  };

  const addProfile = () => {
    const id = `profile-${Date.now()}`;
    setProfiles((current) => [
      ...current,
      {
        id,
        name: "Untitled profile",
        description: "",
        isDefault: false,
        columns: DEFAULT_EXPORT_COLUMNS.map((column) => ({ ...column })),
      },
    ]);
    setSelectedId(id);
    setColumnQuery("");
  };

  const duplicateProfile = () => {
    if (!selectedProfile) return;
    const id = `profile-${Date.now()}`;
    const duplicate: ExportProfile = {
      ...selectedProfile,
      id,
      name: `${selectedProfile.name} copy`,
      isDefault: false,
      columns: selectedProfile.columns.map((column) => ({ ...column })),
    };
    setProfiles((current) => [...current, duplicate]);
    setSelectedId(id);
  };

  const setAsDefault = () => {
    if (!selectedProfile) return;
    setProfiles((current) => setDefaultExportProfile(current, selectedProfile.id));
  };

  const deleteProfile = () => {
    if (!selectedProfile || selectedProfile.isDefault) return;
    const next = removeExportProfile(profiles, selectedProfile.id);
    setProfiles(next);
    setSelectedId(next[Math.max(0, selectedIndex - 1)]?.id ?? next[0]?.id ?? "");
  };

  const toggleEnabled = (key: string) => {
    if (!selectedProfile) return;
    updateSelectedProfile({
      columns: selectedProfile.columns.map((column) => column.key === key ? { ...column, enabled: !column.enabled } : column),
    });
  };

  const reorderColumns = (from: number, to: number) => {
    if (!selectedProfile) return;
    updateSelectedProfile({ columns: moveColumn(selectedProfile.columns, from, to) });
  };

  const handleDrop = (to: number) => {
    if (dragging !== null) reorderColumns(dragging, to);
    setDragging(null);
    setDragOver(null);
  };

  const resetColumns = () => {
    updateSelectedProfile({ columns: DEFAULT_EXPORT_COLUMNS.map((column) => ({ ...column })) });
  };

  const discardChanges = () => {
    const restored = cloneProfiles(savedProfiles);
    setProfiles(restored);
    setSelectedId(restored.some((profile) => profile.id === selectedId) ? selectedId : restored.find((profile) => profile.isDefault)?.id ?? restored[0]?.id ?? "");
  };

  const saveChanges = () => {
    if (hasErrors) return;
    const saved = cloneProfiles(profiles);
    setSavedProfiles(saved);
    updateExportProfiles(cloneProfiles(saved));
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 2200);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-1 flex items-center gap-2 text-accent"><FileDown size={16} aria-hidden="true" /><span className="text-[11px] font-bold uppercase tracking-[0.14em]">Data delivery</span></div>
          <h2 className="text-lg font-bold text-foreground">Export profiles</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Create reusable column sets for different teams. The default profile drives exports across the portal.</p>
        </div>
        <button type="button" onClick={addProfile} className="btn-primary min-h-9 self-start sm:self-auto"><Plus size={15} aria-hidden="true" /> New profile</button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.65fr)]">
        <section className="glass-panel overflow-hidden" aria-label="Export profile list">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input value={profileQuery} onChange={(event) => setProfileQuery(event.target.value)} className="input-base input-with-icon" placeholder="Search profiles" aria-label="Search export profiles" />
            </div>
          </div>
          <div className="max-h-[620px] overflow-y-auto p-2">
            {filteredProfiles.map((profile) => {
              const selected = profile.id === selectedProfile?.id;
              const enabledCount = profile.columns.filter((column) => column.enabled).length;
              return (
                <button key={profile.id} type="button" onClick={() => { setSelectedId(profile.id); setColumnQuery(""); }} className={`mb-1 w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-accent bg-accent-light" : "border-transparent hover:border-border hover:bg-secondary/60"}`} aria-current={selected ? "true" : undefined}>
                  <span className="flex items-start gap-2.5">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-blue-600 text-white" : "bg-secondary text-muted-foreground"}`}><FileDown size={14} aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5"><span className="truncate text-xs font-semibold text-foreground">{profile.name || "Untitled profile"}</span>{profile.isDefault && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"><Star size={9} fill="currentColor" aria-hidden="true" /> Default</span>}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{enabledCount} of {profile.columns.length} columns enabled</span>
                    </span>
                  </span>
                </button>
              );
            })}
            {filteredProfiles.length === 0 && <div className="px-4 py-10 text-center text-xs text-muted-foreground">No profiles match your search.</div>}
          </div>
        </section>

        <section className="glass-panel min-w-0 overflow-hidden" aria-label="Export profile editor">
          {selectedProfile ? (
            <>
              <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-start xl:justify-between">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Profile editor</p><h3 className="mt-1 text-sm font-bold text-foreground">{selectedProfile.name || "Untitled profile"}</h3></div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={duplicateProfile} className="btn-ghost min-h-8"><Copy size={13} aria-hidden="true" /> Duplicate</button>
                  <button type="button" onClick={setAsDefault} disabled={selectedProfile.isDefault} className="btn-ghost min-h-8 disabled:cursor-not-allowed disabled:opacity-50"><Star size={13} aria-hidden="true" /> {selectedProfile.isDefault ? "Default profile" : "Set as default"}</button>
                  <button type="button" onClick={deleteProfile} disabled={selectedProfile.isDefault} className="btn-ghost min-h-8 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40" title={selectedProfile.isDefault ? "Set another profile as default before deleting this one" : "Delete profile"}><Trash2 size={13} aria-hidden="true" /> Delete</button>
                </div>
              </div>

              <div className="grid gap-4 border-b border-border p-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-foreground">Profile name<input value={selectedProfile.name} onChange={(event) => updateSelectedProfile({ name: event.target.value })} className="input-base font-normal" aria-invalid={!selectedProfile.name.trim()} aria-describedby={!selectedProfile.name.trim() ? "profile-name-error" : undefined} />{!selectedProfile.name.trim() && <span id="profile-name-error" className="block text-[11px] font-normal text-destructive">Enter a profile name.</span>}</label>
                <label className="space-y-1.5 text-xs font-semibold text-foreground">Description<input value={selectedProfile.description ?? ""} onChange={(event) => updateSelectedProfile({ description: event.target.value })} className="input-base font-normal" placeholder="Who should use this profile?" /></label>
              </div>

              <div className="flex flex-col gap-3 border-b border-border bg-secondary/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-0 flex-1 sm:max-w-xs">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input value={columnQuery} onChange={(event) => setColumnQuery(event.target.value)} className="input-base input-with-icon" placeholder="Find a column" aria-label="Search export columns" />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-[11px] text-muted-foreground"><strong className="text-foreground">{selectedProfile.columns.filter((column) => column.enabled).length}</strong> enabled</span>
                  <button type="button" onClick={resetColumns} className="btn-ghost min-h-8"><RotateCcw size={13} aria-hidden="true" /> Reset columns</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[690px] border-collapse text-left text-xs">
                  <thead><tr className="border-b border-border bg-secondary/45 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground"><th className="w-10 px-2 py-2.5"><span className="sr-only">Drag</span></th><th className="w-12 px-2 py-2.5">Order</th><th className="px-3 py-2.5">Column</th><th className="px-3 py-2.5">Source field</th><th className="w-24 px-3 py-2.5">Type</th><th className="w-28 px-3 py-2.5 text-center">Visibility</th><th className="w-24 px-2 py-2.5 text-center">Move</th></tr></thead>
                  <tbody className="divide-y divide-border/70">
                    {filteredColumns.map(({ column, index }) => (
                      <tr key={column.key} draggable={!columnQuery} onDragStart={() => setDragging(index)} onDragOver={(event) => { event.preventDefault(); setDragOver(index); }} onDrop={() => handleDrop(index)} onDragEnd={() => { setDragging(null); setDragOver(null); }} className={`transition-colors ${dragOver === index ? "bg-blue-50 dark:bg-blue-950/60" : column.enabled ? "bg-card hover:bg-secondary/35" : "bg-muted/40 text-muted-foreground"} ${dragging === index ? "opacity-40" : ""}`}>
                        <td className="px-2 py-2.5 text-center"><GripVertical size={14} className={`mx-auto ${columnQuery ? "cursor-not-allowed opacity-30" : "cursor-grab text-muted-foreground"}`} aria-hidden="true" /></td>
                        <td className="px-2 py-2.5 font-mono-code text-[11px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-2.5 font-semibold text-foreground">{column.label}</td>
                        <td className="px-3 py-2.5 font-mono-code text-[10px] text-muted-foreground">{column.source}</td>
                        <td className="px-3 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${column.canonical ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300" : "border-border bg-secondary text-muted-foreground"}`}>{column.canonical ? "Canonical" : "System"}</span></td>
                        <td className="px-3 py-2.5 text-center"><button type="button" onClick={() => toggleEnabled(column.key)} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${column.enabled ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300" : "bg-secondary text-muted-foreground hover:text-foreground"}`} aria-pressed={column.enabled} aria-label={`${column.enabled ? "Hide" : "Show"} ${column.label}`}>
                          {column.enabled ? <Eye size={13} aria-hidden="true" /> : <EyeOff size={13} aria-hidden="true" />}{column.enabled ? "Shown" : "Hidden"}
                        </button></td>
                        <td className="px-2 py-2.5"><div className="flex justify-center gap-1"><button type="button" onClick={() => reorderColumns(index, index - 1)} disabled={index === 0 || !!columnQuery} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Move ${column.label} up`}><ArrowUp size={13} aria-hidden="true" /></button><button type="button" onClick={() => reorderColumns(index, index + 1)} disabled={index === selectedProfile.columns.length - 1 || !!columnQuery} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Move ${column.label} down`}><ArrowDown size={13} aria-hidden="true" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredColumns.length === 0 && <div className="px-6 py-12 text-center text-xs text-muted-foreground">No columns match your search.</div>}
              </div>
            </>
          ) : <div className="grid min-h-72 place-items-center p-8 text-center"><div><FileDown size={28} className="mx-auto text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-foreground">No profile selected</p><p className="mt-1 text-xs text-muted-foreground">Create a profile to configure exports.</p></div></div>}
        </section>
      </div>

      <div className={`sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between ${isDirty ? "border-amber-300 bg-amber-50/95 dark:border-amber-800 dark:bg-amber-950/95" : "border-border bg-card/95"}`}>
        <div aria-live="polite"><p className="text-xs font-semibold text-foreground">{savedMessage ? "Profiles saved" : isDirty ? "Unsaved changes" : "All changes saved"}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{hasErrors ? "Every profile needs a name and one profile must be default." : `${profiles.length} profiles · Default: ${profiles.find((profile) => profile.isDefault)?.name}`}</p></div>
        <div className="flex gap-2"><button type="button" onClick={discardChanges} disabled={!isDirty} className="btn-secondary min-h-9 flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">Discard</button><button type="button" onClick={saveChanges} disabled={!isDirty || hasErrors} className="btn-primary min-h-9 flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{savedMessage ? <Check size={14} aria-hidden="true" /> : null} Save changes</button></div>
      </div>
    </div>
  );
}
