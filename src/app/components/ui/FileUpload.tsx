import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  X,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number; // bytes
  type?: string;
  uploadedAt?: string;
}

interface FileUploadProps {
  label?: string;
  hint?: string;
  value?: string; // Comma-separated or JSON string of file names/items
  readOnly?: boolean;
  required?: boolean;
  accept?: string;
  maxFiles?: number;
  onChange?: (value: string) => void;
}

function parseFilesFromValue(val?: string): UploadedFileItem[] {
  if (!val || !val.trim()) return [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) =>
        typeof item === "string"
          ? { id: `file-${idx}`, name: item, size: 1024 * 128 }
          : { id: item.id || `file-${idx}`, name: item.name || "attachment", size: item.size || 1024 * 128 }
      );
    }
  } catch {
    // Treat as comma separated strings
    return val.split(",").map((name, idx) => ({
      id: `file-${idx}`,
      name: name.trim(),
      size: 1024 * (45 + (idx * 37) % 250),
    })).filter((f) => f.name.length > 0);
  }
  return [];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "xlsx":
    case "xls":
    case "csv":
      return <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />;
    case "json":
    case "xml":
    case "psf":
    case "job":
      return <FileCode size={16} className="text-blue-600 dark:text-blue-400" />;
    case "zip":
    case "7z":
    case "tar":
    case "gz":
      return <FileArchive size={16} className="text-amber-600 dark:text-amber-400" />;
    case "pdf":
    case "doc":
    case "docx":
      return <FileText size={16} className="text-rose-600 dark:text-rose-400" />;
    default:
      return <File size={16} className="text-muted-foreground" />;
  }
}

export function FileUpload({
  label,
  hint,
  value,
  readOnly = false,
  required = false,
  accept = ".xlsx,.xls,.csv,.pdf,.zip,.json,.psf,.job,.txt",
  maxFiles = 5,
  onChange,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileList = parseFilesFromValue(value);

  const serializeAndTrigger = (files: UploadedFileItem[]) => {
    if (!onChange) return;
    if (files.length === 0) {
      onChange("");
    } else {
      onChange(files.map((f) => f.name).join(", "));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles: UploadedFileItem[] = Array.from(e.dataTransfer.files).map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        size: f.size || 1024 * 85,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      }));

      const combined = [...fileList, ...droppedFiles].slice(0, maxFiles);
      serializeAndTrigger(combined);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles: UploadedFileItem[] = Array.from(e.target.files).map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        size: f.size || 1024 * 85,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      }));

      const combined = [...fileList, ...selectedFiles].slice(0, maxFiles);
      serializeAndTrigger(combined);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const updated = fileList.filter((f) => f.id !== id);
    serializeAndTrigger(updated);
  };

  const handleSimulatedDownload = (file: UploadedFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate temporary download
    setDownloadNotice(`Downloading ${file.name}...`);
    setTimeout(() => setDownloadNotice(null), 2500);

    // Create a mock blob download
    const blob = new Blob([`PSF File Specification Mock Content for: ${file.name}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={readOnly}
      />

      {/* Drag and Drop Zone when editable */}
      {!readOnly && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-4 rounded-xl border border-dashed text-center transition-all cursor-pointer select-none ${
            isDragging
              ? "border-accent bg-accent-light/50 ring-2 ring-accent/30"
              : "border-border hover:border-accent/80 bg-card hover:bg-secondary/40"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center group-hover:text-accent transition-colors">
              <UploadCloud size={18} />
            </div>
            <div className="text-xs font-medium text-foreground">
              <span className="text-accent font-semibold">Click to upload</span> or drag and drop
            </div>
            <div className="text-[11px] text-muted-foreground">
              Supports .xlsx, .pdf, .zip, .psf, .job, .json (max {maxFiles} files)
            </div>
          </div>
        </div>
      )}

      {/* Uploaded File List */}
      {fileList.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-secondary/50 hover:bg-secondary/80 border border-border/80 rounded-lg text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="p-1.5 rounded-md bg-card border border-border shrink-0">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0">
                  <div className="font-mono-code font-semibold text-foreground truncate max-w-[220px] sm:max-w-[320px]">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleSimulatedDownload(file, e)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-colors cursor-pointer"
                  title="Download / View Attachment"
                >
                  <Download size={13} />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(file.id, e)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Remove File"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : readOnly ? (
        <div className="p-3 rounded-lg border border-border bg-secondary/20 text-xs text-muted-foreground italic flex items-center gap-2">
          <File size={14} className="opacity-60" />
          <span>No attachment uploaded</span>
        </div>
      ) : null}

      {/* Download toast notice */}
      {downloadNotice && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={13} />
          <span>{downloadNotice}</span>
        </div>
      )}
    </div>
  );
}
