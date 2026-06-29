import { Users, Settings, GitBranch, Sparkles, FileDown } from "lucide-react";

const ADMIN_TABS = [
  { label: "Users & Roles", path: "/admin/users", icon: <Users size={15} /> },
  { label: "Form Config", path: "/admin/form-config", icon: <Settings size={15} /> },
  { label: "Workflow", path: "/admin/workflow", icon: <GitBranch size={15} /> },
  { label: "Auto-fill Rules", path: "/admin/autofill", icon: <Sparkles size={15} /> },
  { label: "Export Profile", path: "/admin/export-profile", icon: <FileDown size={15} /> },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AdminLayout({ children, currentPath, onNavigate }: AdminLayoutProps) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Panel</h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
          Manage users, form configuration, workflow, and export settings
        </p>
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {ADMIN_TABS.map((tab) => {
          const active = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--primary)" : "var(--muted-foreground)",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}
