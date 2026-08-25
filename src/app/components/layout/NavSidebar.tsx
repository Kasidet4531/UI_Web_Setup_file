import React from "react";
import nxpLogo from "../../../../NXP.png";
import {
  LayoutDashboard,
  FileText,
  History,
  Settings,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Sliders,
  GitBranch,
  Wand2,
  Download,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface NavSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  role: string;
}

export function NavSidebar({ currentPath, onNavigate, role }: NavSidebarProps) {
  const { requests, currentUser } = useApp();

  // Count active requests for badges
  const myOpenCount = requests.filter((r) => {
    const isClosed = ["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status);
    if (isClosed) return false;
    if (role === "admin") return true;
    if (role === "setup_owner") {
      return r.setupOwner === currentUser?.username || r.requester === currentUser?.username;
    }
    return r.requester === currentUser?.username;
  }).length;

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-sidebar-border space-y-2.5">
        <div className="flex items-center justify-between">
          <img src={nxpLogo} alt="NXP Semiconductors" className="h-10 w-auto object-contain" />
          <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
            v2.0
          </span>
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-white">
            PSF Request Portal
          </div>
          <div className="text-[11px] text-sidebar-muted font-normal">
            Setup File Management
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-muted">
            Overview
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate("/dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentPath === "/dashboard"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              {myOpenCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    currentPath === "/dashboard"
                      ? "bg-white text-accent"
                      : "bg-sidebar-accent text-sidebar-muted"
                  }`}
                >
                  {myOpenCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Requests Management Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-muted">
            Requests & Workflow
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate("/requests")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentPath === "/requests"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} />
                <span>All PSF Requests</span>
              </div>
              <span className="text-[10px] text-sidebar-muted">{requests.length}</span>
            </button>

            {(role === "requester" || role === "admin") && (
              <button
                onClick={() => onNavigate("/requests/new")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/requests/new"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <PlusCircle size={16} />
                <span>Create Request</span>
              </button>
            )}

            <button
              onClick={() => onNavigate("/requests/export")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentPath === "/requests/export"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Export to Excel</span>
            </button>

            <button
              onClick={() => onNavigate("/history")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentPath === "/history"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <History size={16} />
              <span>Audit History</span>
            </button>
          </nav>
        </div>

        {/* Administration Section */}
        {role === "admin" && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-muted">
              Administration
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => onNavigate("/admin/users")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/admin/users" || currentPath === "/admin"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Users size={16} />
                <span>Users & Roles</span>
              </button>

              <button
                onClick={() => onNavigate("/admin/form-config")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/admin/form-config"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Sliders size={16} />
                <span>Form Schema Config</span>
              </button>

              <button
                onClick={() => onNavigate("/admin/workflow")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/admin/workflow"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <GitBranch size={16} />
                <span>Workflow Transitions</span>
              </button>

              <button
                onClick={() => onNavigate("/admin/autofill")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/admin/autofill"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Wand2 size={16} />
                <span>Auto-fill Rules</span>
              </button>

              <button
                onClick={() => onNavigate("/admin/export-profile")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPath === "/admin/export-profile"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Download size={16} />
                <span>Export Profiles</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom info footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
        <div className="text-[11px] text-sidebar-muted flex items-center justify-between px-1">
          <span>Schema v2.0 Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected & Live" />
        </div>
      </div>
    </aside>
  );
}
