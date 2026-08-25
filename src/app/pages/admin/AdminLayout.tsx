import React from "react";
import { Users, Settings, GitBranch, Sparkles, FileDown, Shield } from "lucide-react";

const ADMIN_TABS = [
  { label: "Users & Roles", path: "/admin/users", icon: <Users size={15} /> },
  { label: "Form Schema", path: "/admin/form-config", icon: <Settings size={15} /> },
  { label: "Workflow Matrix", path: "/admin/workflow", icon: <GitBranch size={15} /> },
  { label: "Auto-fill Rules", path: "/admin/autofill", icon: <Sparkles size={15} /> },
  { label: "Export Profiles", path: "/admin/export-profile", icon: <FileDown size={15} /> },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AdminLayout({ children, currentPath, onNavigate }: AdminLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pb-3 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield size={22} className="text-amber-500" />
          <span>System Administration Console</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Configure security permissions, dynamic form schemas, workflow state transitions, and export rules
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-xl border border-border overflow-x-auto">
        {ADMIN_TABS.map((tab) => {
          const active = currentPath === tab.path || (tab.path === "/admin/users" && currentPath === "/admin");
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Viewport */}
      <div>{children}</div>
    </div>
  );
}
