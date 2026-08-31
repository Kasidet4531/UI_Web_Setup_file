import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  Shield,
  UserCheck,
  LogOut,
  Layers,
} from "lucide-react";

interface AppHeaderProps {
  currentPath: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AppHeader({
  currentPath,
  sidebarOpen,
  onToggleSidebar,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}: AppHeaderProps) {
  const { currentUser, logout, users, login, requests } = useApp();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Generate breadcrumbs from currentPath
  const getBreadcrumbs = () => {
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length === 0 || segments[0] === "dashboard") {
      return [{ label: "Dashboard", path: "/dashboard" }];
    }

    if (segments[0] === "requests") {
      const items = [{ label: "PSF Requests", path: "/requests" }];
      if (segments[1] === "new") {
        items.push({ label: "Create New Request", path: "/requests/new" });
      } else if (segments[1] === "export") {
        items.push({ label: "Export to Excel", path: "/requests/export" });
      } else if (segments[1]) {
        const req = requests.find((r) => r.id === segments[1]);
        const label = req ? req.requestNo : segments[1];
        items.push({ label, path: `/requests/${segments[1]}` });
        if (segments[2] === "history") {
          items.push({ label: "Audit History", path: `/requests/${segments[1]}/history` });
        }
      }
      return items;
    }

    if (segments[0] === "history") {
      return [{ label: "Global Audit History", path: "/history" }];
    }

    if (segments[0] === "admin") {
      const items = [{ label: "Admin Console", path: "/admin" }];
      if (segments[1] === "users") items.push({ label: "Users & Roles", path: "/admin/users" });
      if (segments[1] === "form-config") items.push({ label: "Form Configuration", path: "/admin/form-config" });
      if (segments[1] === "workflow") items.push({ label: "Status Management", path: "/admin/workflow" });
      if (segments[1] === "autofill") items.push({ label: "Auto-fill Rules", path: "/admin/autofill" });
      if (segments[1] === "export-profile") items.push({ label: "Export Profiles", path: "/admin/export-profile" });
      return items;
    }

    return [{ label: "Dashboard", path: "/dashboard" }];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSwitchPersona = (username: string) => {
    login(username, "password");
    setShowPersonaMenu(false);
  };

  const pendingApprovalsCount = requests.filter((r) => {
    if (currentUser?.role === "setup_owner") {
      return r.status === "SUBMITTED" || (r.status === "SETUP_IN_PROGRESS" && r.setupOwner === currentUser.username);
    }
    if (currentUser?.role === "requester") {
      return r.requester === currentUser.username && (r.status === "PSF_CREATED" || r.status === "DRAFT");
    }
    return r.status === "SUBMITTED";
  }).length;

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left section: Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight size={13} className="text-muted-foreground opacity-60" />}
                {isLast ? (
                  <span className="text-foreground font-semibold px-1 py-0.5 rounded">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate(crumb.path)}
                    className="text-muted-foreground hover:text-foreground hover:underline transition-colors px-1 py-0.5 rounded"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right section: Actions, Theme, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Request CTA for requesters / admin */}
        {(currentUser?.role === "requester" || currentUser?.role === "admin") && (
          <button
            onClick={() => onNavigate("/requests/new")}
            className="btn-primary text-xs py-1.5 px-3 hidden md:inline-flex shadow-sm"
          >
            <Plus size={14} /> New Request
          </button>
        )}

        {/* Dark Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationPopup((v) => !v)}
            aria-label="Notifications"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
          >
            <Bell size={17} />
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-2 w-72 glass-panel p-3 z-50 shadow-lg text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2 font-semibold">
                <span>Notifications</span>
                <span className="text-[11px] text-accent font-normal">{pendingApprovalsCount} pending</span>
              </div>
              <p className="text-muted-foreground py-2 text-center">
                {pendingApprovalsCount > 0
                  ? `You have ${pendingApprovalsCount} request(s) requiring your attention.`
                  : "All caught up! No pending notifications."}
              </p>
              <button
                onClick={() => {
                  setShowNotificationPopup(false);
                  onNavigate("/dashboard");
                }}
                className="w-full text-center text-accent hover:underline pt-2 border-t border-border font-medium"
              >
                View Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Persona / Role Fast Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu((v) => !v)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all"
            title="Switch user persona for testing"
          >
            <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-[11px]">
              {currentUser?.name?.charAt(0) ?? "?"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold leading-none">{currentUser?.name}</div>
              <div className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1 mt-0.5">
                {currentUser?.role === "admin" && <Shield size={10} className="text-amber-500" />}
                {currentUser?.role === "setup_owner" && <Layers size={10} className="text-blue-500" />}
                {currentUser?.role === "requester" && <UserCheck size={10} className="text-emerald-500" />}
                <span>
                  {currentUser?.role === "setup_owner"
                    ? `Setup · ${currentUser.department}`
                    : currentUser?.role === "admin"
                    ? "Admin"
                    : "Requester"}
                </span>
              </div>
            </div>
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-panel p-2 z-50 shadow-xl text-xs animate-in fade-in">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                Switch Role / Persona
              </div>
              <div className="space-y-1">
                {users.map((u) => {
                  const isSelected = u.username === currentUser?.username;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchPersona(u.username)}
                      className={`w-full flex items-center justify-between p-2 rounded-md transition-colors text-left ${
                        isSelected
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className={`text-[10px] ${isSelected ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                          {u.role === "setup_owner" ? `Setup (${u.department})` : u.role}
                        </div>
                      </div>
                      {isSelected && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border mt-2 pt-1.5">
                <button
                  onClick={() => {
                    setShowPersonaMenu(false);
                    logout();
                    onNavigate("/login");
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={13} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
