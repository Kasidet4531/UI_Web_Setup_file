import test from "node:test";
import assert from "node:assert/strict";

import {
  findAutofillConflicts,
  moveColumn,
  removeExportProfile,
  setDefaultExportProfile,
  type AutofillRule,
  type ExportProfile,
} from "./adminConfigModels.ts";

const activeRule = (
  id: string,
  triggerField: string,
  targetFields: string[],
): AutofillRule => ({
  id,
  name: id,
  triggerField,
  targetFields,
  status: "active",
});

test("flags overlapping targets only when active rules share a trigger", () => {
  const rules: AutofillRule[] = [
    activeRule("rule-a", "reference_psf_name", ["product", "wafer_fab"]),
    activeRule("rule-b", "reference_psf_name", ["wafer_fab", "description"]),
    activeRule("rule-c", "probecard_name", ["wafer_fab"]),
    { ...activeRule("rule-d", "reference_psf_name", ["product"]), status: "inactive" },
  ];

  assert.deepEqual(findAutofillConflicts(rules), {
    "rule-a": ["wafer_fab"],
    "rule-b": ["wafer_fab"],
  });
});

test("setting a default profile leaves exactly one default", () => {
  const profiles: ExportProfile[] = [
    { id: "standard", name: "Standard", isDefault: true, columns: [] },
    { id: "engineering", name: "Engineering", isDefault: false, columns: [] },
  ];

  assert.deepEqual(
    setDefaultExportProfile(profiles, "engineering").map(({ id, isDefault }) => ({ id, isDefault })),
    [
      { id: "standard", isDefault: false },
      { id: "engineering", isDefault: true },
    ],
  );
});

test("refuses to remove the default export profile", () => {
  const profiles: ExportProfile[] = [
    { id: "standard", name: "Standard", isDefault: true, columns: [] },
    { id: "engineering", name: "Engineering", isDefault: false, columns: [] },
  ];

  assert.deepEqual(removeExportProfile(profiles, "standard"), profiles);
  assert.deepEqual(removeExportProfile(profiles, "engineering"), [profiles[0]]);
});

test("moves a column without losing its data", () => {
  const columns = [
    { key: "a", label: "A", source: "a", enabled: true, canonical: false },
    { key: "b", label: "B", source: "b", enabled: true, canonical: false },
    { key: "c", label: "C", source: "c", enabled: false, canonical: true },
  ];

  assert.deepEqual(moveColumn(columns, 2, 0).map((column) => column.key), ["c", "a", "b"]);
  assert.deepEqual(moveColumn(columns, 0, -1), columns);
});
