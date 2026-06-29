import { useState } from "react";
import { NavSidebar } from "./NavSidebar";
import { useApp } from "../../context/AppContext";
import { Menu, X, Bell, LogOut, Sun, Moon } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AppLayout({ children, currentPath, onNavigate }: AppLayoutProps) {
  const { currentUser, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate("/login");
  };

  const toggleDark = () => {
    setDarkMode((d) => {
      if (!d) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return !d;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "inherit",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          overflow: "hidden",
          transition: "width 0.2s ease, min-width 0.2s ease",
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <NavSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          role={currentUser?.role ?? "requester"}
        />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={toggleDark}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}
            >
              <Bell size={18} />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {currentUser?.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <div style={{ fontWeight: 500, lineHeight: 1.2 }}>{currentUser?.name}</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: 11, lineHeight: 1.2 }}>
                  {currentUser?.role === "setup_owner"
                    ? `Setup Owner · ${currentUser.department}`
                    : currentUser?.role === "admin"
                    ? "Admin"
                    : "Requester"}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: 24,
            background: "var(--background)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
