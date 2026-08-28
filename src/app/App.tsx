import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RequestsListPage } from "./pages/RequestsListPage";
import { RequestFormPage } from "./pages/RequestFormPage";
import { RequestDetailPage } from "./pages/RequestDetailPage";
import { RequestHistoryPage } from "./pages/RequestHistoryPage";
import { GlobalHistoryPage } from "./pages/GlobalHistoryPage";
import { ExportPage } from "./pages/ExportPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { UsersPage } from "./pages/admin/UsersPage";
import { FormConfigPage } from "./pages/admin/FormConfigPage";
import { WorkflowPage } from "./pages/admin/WorkflowPage";
import { AutofillPage } from "./pages/admin/AutofillPage";
import { ExportProfilePage } from "./pages/admin/ExportProfilePage";

function Router() {
  const { currentUser } = useApp();
  const [path, setPath] = useState("/login");

  const navigate = (to: string) => setPath(to);

  if (!currentUser) {
    return <LoginPage onLogin={() => navigate("/dashboard")} />;
  }

  if (path === "/login") {
    return <LoginPage onLogin={() => navigate("/dashboard")} />;
  }

  const segments = path.split("/").filter(Boolean);

  const renderPage = () => {
    if (path === "/dashboard") {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (path === "/requests/new") {
      return <RequestFormPage onNavigate={navigate} />;
    }
    if (path === "/requests/export") {
      return <ExportPage onNavigate={navigate} />;
    }
    if (segments[0] === "requests" && segments[1] && segments[2] === "history") {
      return <RequestHistoryPage requestId={segments[1]} onNavigate={navigate} />;
    }
    if (segments[0] === "requests" && segments[1]) {
      return <RequestDetailPage requestId={segments[1]} onNavigate={navigate} />;
    }
    if (path === "/requests") {
      return <RequestsListPage onNavigate={navigate} />;
    }
    if (path === "/history") {
      return <GlobalHistoryPage onNavigate={navigate} />;
    }
    if (segments[0] === "admin") {
      const adminPage = (() => {
        if (currentUser.role !== "admin") {
          return (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted-foreground)" }}>
              Access denied. Admin role required.
            </div>
          );
        }
        if (path === "/admin" || path === "/admin/users") return <UsersPage />;
        if (path === "/admin/form-config") return <FormConfigPage />;
        if (path === "/admin/workflow") return <WorkflowPage />;
        if (path === "/admin/autofill") return <AutofillPage />;
        if (path === "/admin/export-profile") return <ExportProfilePage />;
        return <UsersPage />;
      })();
      return (
        <AdminLayout currentPath={path} onNavigate={navigate}>
          {adminPage}
        </AdminLayout>
      );
    }
    return <DashboardPage onNavigate={navigate} />;
  };

  return (
    <AppLayout currentPath={path} onNavigate={navigate}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}