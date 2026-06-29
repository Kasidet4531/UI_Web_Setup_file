export interface FieldDef {
  fieldKey: string;
  canonicalKey: string;
  label: string;
  type: "text" | "select" | "radio" | "textarea" | "date" | "file";
  required: boolean;
  searchable?: boolean;
  exportable?: boolean;
  autofillTrigger?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SectionDef {
  sectionKey: string;
  title: string;
  editableBy: string[];
  visibleTo: string[];
  visibleWhenStatusIn?: string[];
  fields: FieldDef[];
}

export interface FormSchema {
  formKey: string;
  version: number;
  title: string;
  sections: SectionDef[];
}

export const FORM_SCHEMA_V1: FormSchema = {
  formKey: "psf-request-form",
  version: 1,
  title: "PSF Request Form",
  sections: [
    {
      sectionKey: "requester_information",
      title: "Requester Information",
      editableBy: ["requester", "admin"],
      visibleTo: ["requester", "setup_owner", "admin"],
      fields: [
        {
          fieldKey: "product_type",
          canonicalKey: "product_type",
          label: "Product Type",
          type: "radio",
          required: true,
          searchable: true,
          exportable: true,
          options: [
            { value: "New Product", label: "New Product" },
            { value: "Transfer Product", label: "Transfer Product" },
            { value: "Existing Product", label: "Existing Product" },
          ],
        },
        {
          fieldKey: "title",
          canonicalKey: "title",
          label: "Title",
          type: "text",
          required: true,
          searchable: true,
          exportable: true,
          placeholder: "Enter request title",
        },
        {
          fieldKey: "request_for",
          canonicalKey: "request_for",
          label: "Request For",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "Enter request purpose",
        },
        {
          fieldKey: "request_to",
          canonicalKey: "request_to",
          label: "Request To",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "GNTC", label: "GNTC" },
            { value: "MFG", label: "MFG" },
          ],
        },
        {
          fieldKey: "reference_psf_name",
          canonicalKey: "reference_psf_name",
          label: "Reference PSF Name",
          type: "text",
          required: false,
          searchable: true,
          exportable: true,
          autofillTrigger: true,
          placeholder: "e.g. PSF-001",
        },
        {
          fieldKey: "request_date",
          canonicalKey: "request_date",
          label: "Request Date",
          type: "date",
          required: true,
          exportable: true,
        },
        {
          fieldKey: "priority",
          canonicalKey: "priority",
          label: "Priority",
          type: "select",
          required: true,
          searchable: true,
          exportable: true,
          options: [
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
            { value: "Critical", label: "Critical" },
          ],
        },
        {
          fieldKey: "due_date",
          canonicalKey: "due_date",
          label: "Due Date",
          type: "date",
          required: true,
          exportable: true,
        },
        {
          fieldKey: "nc_12",
          canonicalKey: "nc_12",
          label: "12 NC",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "12 NC number",
        },
        {
          fieldKey: "product",
          canonicalKey: "product",
          label: "Product",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "PRODUCT-A", label: "PRODUCT-A" },
            { value: "PRODUCT-B", label: "PRODUCT-B" },
            { value: "PRODUCT-C", label: "PRODUCT-C" },
          ],
        },
        {
          fieldKey: "wafer_fab",
          canonicalKey: "wafer_fab",
          label: "Wafer FAB",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "FAB-A", label: "FAB-A" },
            { value: "FAB-B", label: "FAB-B" },
            { value: "FAB-C", label: "FAB-C" },
          ],
        },
        {
          fieldKey: "probecard_name",
          canonicalKey: "probecard_name",
          label: "Probecard Name",
          type: "text",
          required: true,
          searchable: true,
          exportable: true,
          autofillTrigger: true,
          placeholder: "e.g. PC-001",
        },
        {
          fieldKey: "description",
          canonicalKey: "description",
          label: "Description",
          type: "textarea",
          required: false,
          exportable: false,
          placeholder: "Describe your request in detail",
        },
      ],
    },
    {
      sectionKey: "psf_created_information",
      title: "PSF Created Information",
      editableBy: ["setup_owner", "admin"],
      visibleTo: ["setup_owner", "admin"],
      visibleWhenStatusIn: ["PSF_CREATED", "COMPLETED"],
      fields: [
        {
          fieldKey: "first_die_ref",
          canonicalKey: "first_die_ref",
          label: "First Die Ref. (X,Y)",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "e.g. (3,5)",
        },
        {
          fieldKey: "probe_coordinate_quadrant",
          canonicalKey: "probe_coordinate_quadrant",
          label: "Probe & Coordinate Quadrant",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "Q1", label: "Q1 (+X, +Y)" },
            { value: "Q2", label: "Q2 (-X, +Y)" },
            { value: "Q3", label: "Q3 (-X, -Y)" },
            { value: "Q4", label: "Q4 (+X, -Y)" },
          ],
        },
        {
          fieldKey: "wafer_id_format",
          canonicalKey: "wafer_id_format",
          label: "Wafer ID Format",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "e.g. WID-YYYYMMDD",
        },
        {
          fieldKey: "mirror_die_available",
          canonicalKey: "mirror_die_available",
          label: "Mirror Die Available",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ],
        },
        {
          fieldKey: "prepare_fpc",
          canonicalKey: "prepare_fpc",
          label: "Prepare FPC & Physical Wafer to PSF Cabinet E2",
          type: "select",
          required: false,
          exportable: true,
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
            { value: "N/A", label: "N/A" },
          ],
        },
        {
          fieldKey: "psf_setup_file_name",
          canonicalKey: "psf_setup_file_name",
          label: "PSF Setup File Name",
          type: "text",
          required: true,
          searchable: true,
          exportable: true,
          autofillTrigger: true,
          placeholder: "e.g. PSF_ABC_001",
        },
        {
          fieldKey: "job_file_name",
          canonicalKey: "job_file_name",
          label: "Job File Name",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "e.g. JOB_ABC_001",
        },
        {
          fieldKey: "template",
          canonicalKey: "template",
          label: "Template",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "Template name",
        },
        {
          fieldKey: "layout",
          canonicalKey: "layout",
          label: "Layout",
          type: "text",
          required: false,
          exportable: true,
          placeholder: "Layout name",
        },
      ],
    },
  ],
};

export const FORM_SCHEMA_V2: FormSchema = {
  ...FORM_SCHEMA_V1,
  version: 2,
  sections: FORM_SCHEMA_V1.sections.map((s) =>
    s.sectionKey === "requester_information"
      ? {
          ...s,
          fields: [
            ...s.fields,
            {
              fieldKey: "machine_type",
              canonicalKey: "machine_type",
              label: "Machine Type",
              type: "select" as const,
              required: false,
              exportable: true,
              options: [
                { value: "Type-A", label: "Type-A" },
                { value: "Type-B", label: "Type-B" },
              ],
            },
          ],
        }
      : s
  ),
};

export const ACTIVE_SCHEMA = FORM_SCHEMA_V2;
export const ALL_SCHEMAS = [FORM_SCHEMA_V1, FORM_SCHEMA_V2];
