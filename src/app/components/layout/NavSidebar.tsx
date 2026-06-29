import { LayoutDashboard, FileText, History, Settings, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["requester", "setup_owner", "admin"],
  },
  {
    label: "PSF Requests",
    path: "/requests",
    icon: <FileText size={18} />,
    roles: ["requester", "setup_owner", "admin"],
  },
  {
    label: "History",
    path: "/history",
    icon: <History size={18} />,
    roles: ["requester", "setup_owner", "admin"],
  },
  {
    label: "Admin",
    path: "/admin",
    icon: <Settings size={18} />,
    roles: ["admin"],
    children: [
      { label: "Users & Roles", path: "/admin/users" },
      { label: "Form Config", path: "/admin/form-config" },
      { label: "Workflow", path: "/admin/workflow" },
      { label: "Auto-fill Rules", path: "/admin/autofill" },
      { label: "Export Profile", path: "/admin/export-profile" },
    ],
  },
];

interface NavSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  role: string;
}

export function NavSidebar({ currentPath, onNavigate, role }: NavSidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 0 16px 0" }}>
      {/* Logo */}
      <div
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid var(--sidebar-border)",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--sidebar-foreground)" }}>
          PSF Request
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
          Setup File Management
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 8px" }}>
        {visibleItems.map((item) => {
          const isActive =
            currentPath === item.path || currentPath.startsWith(item.path + "/");
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.path}>
              <button
                onClick={() => onNavigate(item.path)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "var(--sidebar-accent)" : "none",
                  color: isActive
                    ? "var(--sidebar-accent-foreground)"
                    : "var(--sidebar-foreground)",
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  textAlign: "left",
                  marginBottom: 2,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {hasChildren && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>

              {/* Sub-nav for Admin */}
              {hasChildren && isActive && (
                <div style={{ marginLeft: 16, marginBottom: 4 }}>
                  {item.children!.map((child) => {
                    const childActive = currentPath === child.path;
                    return (
                      <button
                        key={child.path}
                        onClick={() => onNavigate(child.path)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          padding: "7px 12px",
                          borderRadius: "var(--radius)",
                          border: "none",
                          cursor: "pointer",
                          background: childActive ? "var(--sidebar-accent)" : "none",
                          color: childActive
                            ? "var(--sidebar-accent-foreground)"
                            : "var(--muted-foreground)",
                          fontSize: 13,
                          fontWeight: childActive ? 500 : 400,
                          textAlign: "left",
                          marginBottom: 2,
                        }}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom version */}
      <div style={{ padding: "0 20px", fontSize: 11, color: "var(--muted-foreground)" }}>
        v2.0 · Form Schema v{2}
      </div>
    </div>
  );
}
