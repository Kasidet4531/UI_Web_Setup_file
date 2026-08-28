export interface ExportColumn {
  key: string;
  label: string;
  source: string;
  enabled: boolean;
  canonical: boolean;
}

export const DEFAULT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "request_no", label: "Request No.", source: "system.request_id", enabled: true, canonical: false },
  { key: "product_type", label: "Product Type", source: "system.product_type", enabled: true, canonical: false },
  { key: "title", label: "Title", source: "canonical.title", enabled: true, canonical: true },
  { key: "product", label: "Product Name", source: "canonical.product", enabled: true, canonical: true },
  { key: "wafer_fab", label: "Wafer FAB", source: "canonical.wafer_fab", enabled: true, canonical: true },
  { key: "reference_psf_name", label: "Reference PSF Name", source: "canonical.reference_psf_name", enabled: true, canonical: true },
  { key: "probecard_name", label: "Probecard Name", source: "canonical.probecard_name", enabled: true, canonical: true },
  { key: "psf_setup_file_name", label: "PSF Setup File Name", source: "canonical.psf_setup_file_name", enabled: true, canonical: true },
  { key: "status", label: "Status", source: "system.status", enabled: true, canonical: false },
  { key: "priority", label: "Priority", source: "canonical.priority", enabled: true, canonical: true },
  { key: "due_date", label: "Due Date", source: "canonical.due_date", enabled: true, canonical: true },
  { key: "requester", label: "Requester", source: "system.requester", enabled: true, canonical: false },
  { key: "setup_owner", label: "Setup Owner", source: "system.setup_owner", enabled: true, canonical: false },
  { key: "setup_owner_role", label: "Setup Owner Dept.", source: "system.setup_owner_role", enabled: true, canonical: false },
];
