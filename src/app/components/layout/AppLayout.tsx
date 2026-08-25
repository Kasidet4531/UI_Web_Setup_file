import React, { useState, useEffect } from "react";
import { NavSidebar } from "./NavSidebar";
import { AppHeader } from "./AppHeader";
import { useApp } from "../../context/AppContext";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AppLayout({ children, currentPath, onNavigate }: AppLayoutProps) {
  const { currentUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from system or class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDark = () => {
    setDarkMode((d) => {
      const next = !d;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Sidebar with smooth collapse */}
      <div
        className={`h-full border-r border-sidebar-border overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? "w-60 min-w-[240px]" : "w-0 min-w-0 opacity-0 pointer-events-none"
        }`}
      >
        <NavSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          role={currentUser?.role ?? "requester"}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* App Header */}
        <AppHeader
          currentPath={currentPath}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
          onNavigate={onNavigate}
          darkMode={darkMode}
          onToggleDarkMode={toggleDark}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
