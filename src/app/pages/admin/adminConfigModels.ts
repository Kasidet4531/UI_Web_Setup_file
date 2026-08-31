import type { ExportColumn, ExportProfile } from "../../mock/mockExportProfile";

export interface AutofillRule {
  id: string;
  name: string;
  triggerField: string;
  targetFields: string[];
  status: "active" | "inactive";
}

export type { ExportProfile } from "../../mock/mockExportProfile";

export function findAutofillConflicts(rules: AutofillRule[]) {
  const conflicts: Record<string, string[]> = {};

  rules.forEach((rule, index) => {
    if (rule.status !== "active") return;

    rules.slice(index + 1).forEach((candidate) => {
      if (candidate.status !== "active" || candidate.triggerField !== rule.triggerField) return;

      const overlaps = rule.targetFields.filter((field) => candidate.targetFields.includes(field));
      if (overlaps.length === 0) return;

      conflicts[rule.id] = Array.from(new Set([...(conflicts[rule.id] ?? []), ...overlaps]));
      conflicts[candidate.id] = Array.from(
        new Set([...(conflicts[candidate.id] ?? []), ...overlaps]),
      );
    });
  });

  return conflicts;
}

export function setDefaultExportProfile(profiles: ExportProfile[], profileId: string) {
  if (!profiles.some((profile) => profile.id === profileId)) return profiles;
  return profiles.map((profile) => ({ ...profile, isDefault: profile.id === profileId }));
}

export function removeExportProfile(profiles: ExportProfile[], profileId: string) {
  const profile = profiles.find((candidate) => candidate.id === profileId);
  if (!profile || profile.isDefault) return profiles;
  return profiles.filter((candidate) => candidate.id !== profileId);
}

export function moveColumn(columns: ExportColumn[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= columns.length || to >= columns.length || from === to) {
    return columns;
  }

  const next = [...columns];
  const [column] = next.splice(from, 1);
  next.splice(to, 0, column);
  return next;
}

export function cloneProfiles(profiles: ExportProfile[]) {
  return profiles.map((profile) => ({
    ...profile,
    columns: profile.columns.map((column) => ({ ...column })),
  }));
}
