import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { MockUser, UserRole, Department, MOCK_CORPORATE_DIRECTORY } from "../../mock/mockUsers";
import { UserLog } from "../../mock/mockUserLogs";
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Building2,
  IdCard,
  Mail,
  UserCheck,
  AlertCircle,
  History,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Briefcase,
  KeyRound,
  Filter,
} from "lucide-react";

const ROLE_INFO: Record<
  UserRole,
  { label: string; description: string; badgeClass: string; cardBorder: string }
> = {
  requester: {
    label: "Requester",
    description: "Can create PSF requests, submit test specifications, and track workflow status.",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    cardBorder: "hover:border-slate-400 dark:hover:border-slate-600",
  },
  setup_owner: {
    label: "Setup File Owner",
    description: "Can claim requests, input engineering parameters, and publish PSF setup files (GNTC / MFG).",
    badgeClass: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    cardBorder: "hover:border-blue-400 dark:hover:border-blue-600",
  },
  admin: {
    label: "Admin",
    description: "Full administrative access: user roles, dynamic form schemas, workflow rules, and export profiles.",
    badgeClass: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    cardBorder: "hover:border-purple-400 dark:hover:border-purple-600",
  },
};

const DEPT_BADGES: Record<string, string> = {
  GNTC: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  MFG: "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
};

function formatBangkokDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });
  } catch {
    return iso;
  }
}

// ─── Assign Corporate User Modal ──────────────────────────────────────────────

interface AssignUserDialogProps {
  onClose: () => void;
}

function AssignUserDialog({ onClose }: AssignUserDialogProps) {
  const { addUser, users } = useApp();
  const [selectedDirectoryUser, setSelectedDirectoryUser] = useState<string>("");
  const [userQuery, setUserQuery] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [employeeType, setEmployeeType] = useState("Employee");
  const [manager, setManager] = useState("");
  const [company, setCompany] = useState("NXP Semiconductors");
  const [role, setRole] = useState<UserRole>("requester");
  const [department, setDepartment] = useState<Department>(null);
  const [error, setError] = useState("");

  // Directory search suggestions
  const directorySuggestions = useMemo(() => {
    if (!userQuery.trim()) return MOCK_CORPORATE_DIRECTORY;
    const q = userQuery.toLowerCase();
    return MOCK_CORPORATE_DIRECTORY.filter(
      (d) =>
        d.user.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.employeeId.toLowerCase().includes(q)
    );
  }, [userQuery]);

  const handleSelectDirectory = (entry: (typeof MOCK_CORPORATE_DIRECTORY)[0]) => {
    setSelectedDirectoryUser(entry.user);
    setUsername(entry.user);
    setName(entry.name);
    setEmail(entry.email);
    setEmployeeId(entry.employeeId);
    setTitle(entry.title);
    setEmployeeType(entry.employeeType);
    setManager(entry.manager);
    setCompany(entry.company);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Employee full name is required.");
      return;
    }
    if (!username.trim()) {
      setError("Corporate username is required.");
      return;
    }
    if (!email.trim()) {
      setError("Corporate email address is required.");
      return;
    }
    if (users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setError(`User @${username.trim()} is already assigned in the system.`);
      return;
    }
    if (role === "setup_owner" && !department) {
      setError("Please select a department (GNTC or MFG) for Setup File Owner.");
      return;
    }

    addUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      role,
      department: role === "setup_owner" ? department : null,
      employeeId: employeeId.trim() || `NXP-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeType,
      title: title.trim() || "Technical Specialist",
      manager: manager.trim() || "Department Manager",
      company: company.trim() || "NXP Semiconductors",
      password: "password", // mock auth fallback
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="glass-panel bg-card p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Assign Corporate User Access</h2>
              <p className="text-xs text-muted-foreground">
                Grant role and department permissions to corporate employees (SSO / Active Directory)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner: SSO Auth Notice */}
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Corporate SSO Managed:</span> Authentication is handled by
            the company directory server. No local passwords are required or stored.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Quick Corporate Directory Lookup */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Search size={13} className="text-accent" />
              <span>Search Corporate Directory (Mock API)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {directorySuggestions.map((entry) => (
                <button
                  key={entry.user}
                  type="button"
                  onClick={() => handleSelectDirectory(entry)}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedDirectoryUser === entry.user
                      ? "bg-accent-light border-accent text-foreground ring-1 ring-accent"
                      : "bg-secondary/40 border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{entry.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">@{entry.user}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{entry.title}</div>
                  <div className="text-[10px] text-accent font-mono mt-0.5">{entry.employeeId}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Employee Profile Details (Read/Editable) */}
          <div className="p-4 bg-secondary/30 rounded-xl border border-border/80 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IdCard size={13} />
              <span>Employee Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasidet N."
                  className="input-base text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Corporate Username (@) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. nxg22301"
                  className="input-base text-xs font-mono-code h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kasidet.n@nxp.com"
                  className="input-base text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. NXP-50821"
                  className="input-base text-xs font-mono-code h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. STUDENT INTERN TECHNICAL-SP"
                  className="input-base text-xs h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Direct Manager</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="e.g. David Wright"
                  className="input-base text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Role & Department Assignment */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>System Role & Permissions <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-muted-foreground font-normal">Select one role</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(["requester", "setup_owner", "admin"] as const).map((rKey) => {
                const info = ROLE_INFO[rKey];
                const isSelected = role === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => {
                      setRole(rKey);
                      if (rKey !== "setup_owner") setDepartment(null);
                    }}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-card border-accent ring-2 ring-accent/20 shadow-sm"
                        : `bg-card border-border ${info.cardBorder}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-foreground">{info.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                      {info.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Department Selection when Setup Owner is selected */}
            {role === "setup_owner" && (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2 animate-in fade-in">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Assigned Department <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (Determines export tracking & task routing)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  {(["GNTC", "MFG"] as const).map((dept) => (
                    <label
                      key={dept}
                      className={`flex-1 inline-flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        department === dept
                          ? "bg-accent-light border-accent text-accent ring-1 ring-accent"
                          : "bg-card border-border hover:bg-secondary text-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="assign_dept"
                        value={dept}
                        checked={department === dept}
                        onChange={() => setDepartment(dept)}
                        className="accent-accent"
                      />
                      <span>{dept} Department</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs shadow-sm">
              <UserCheck size={14} />
              <span>Assign User Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Role & Permissions Modal ───────────────────────────────────────────

interface EditRoleDialogProps {
  user: MockUser;
  onClose: () => void;
}

function EditRoleDialog({ user, onClose }: EditRoleDialogProps) {
  const { updateUser } = useApp();
  const [role, setRole] = useState<UserRole>(user.role);
  const [department, setDepartment] = useState<Department>(user.department);
  const [error, setError] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "setup_owner" && !department) {
      setError("Please select a department (GNTC or MFG) for Setup File Owner.");
      return;
    }

    updateUser(user.id, {
      role,
      department: role === "setup_owner" ? department : null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="glass-panel bg-card p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Edit Role & Permissions</h2>
              <p className="text-xs text-muted-foreground">
                Manage authorization and operational department for @{user.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Employee Summary Card */}
        <div className="p-4 bg-secondary/40 rounded-xl border border-border/80 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground truncate">{user.name}</span>
              <span className="text-[11px] font-mono text-muted-foreground">@{user.username}</span>
            </div>
            <div className="text-xs text-muted-foreground truncate">{user.title || "Corporate Employee"}</div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <IdCard size={11} className="text-accent" />
                <span className="font-mono">{user.employeeId || "NXP-00000"}</span>
              </span>
              <span>•</span>
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Select User Role <span className="text-rose-500">*</span>
            </label>

            <div className="space-y-2">
              {(["requester", "setup_owner", "admin"] as const).map((rKey) => {
                const info = ROLE_INFO[rKey];
                const isSelected = role === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => {
                      setRole(rKey);
                      if (rKey !== "setup_owner") setDepartment(null);
                    }}
                    className={`w-full p-3 text-left rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-accent-light/30 border-accent ring-1 ring-accent/30 shadow-xs"
                        : "bg-card border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-accent border-accent text-white" : "border-muted-foreground/40 bg-card"
                      }`}
                    >
                      {isSelected && <Check size={10} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-foreground">{info.label}</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {info.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Selection (if Setup Owner) */}
          {role === "setup_owner" && (
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2 animate-in fade-in">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Setup Owner Department <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-muted-foreground font-normal">GNTC or MFG</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(["GNTC", "MFG"] as const).map((dept) => (
                  <label
                    key={dept}
                    className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      department === dept
                        ? "bg-accent-light border-accent text-accent ring-1 ring-accent"
                        : "bg-card border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_dept"
                      value={dept}
                      checked={department === dept}
                      onChange={() => setDepartment(dept)}
                      className="accent-accent"
                    />
                    <span>{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs shadow-sm">
              <Check size={14} />
              <span>Save Role & Permissions</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main UsersPage Component ─────────────────────────────────────────────────

export function UsersPage() {
  const { users, removeUser, userLogs, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MockUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEmail = (e: React.MouseEvent, emailText: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(emailText);
    setCopiedId(emailText);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (
        search &&
        !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.username.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase()) &&
        !(u.title ?? "").toLowerCase().includes(search.toLowerCase()) &&
        !(u.employeeId ?? "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (roleFilter && u.role !== roleFilter) return false;
      if (deptFilter && u.department !== deptFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, deptFilter]);

  return (
    <div className="space-y-5">
      {showAssignDialog && <AssignUserDialog onClose={() => setShowAssignDialog(false)} />}
      {editingUser && <EditRoleDialog user={editingUser} onClose={() => setEditingUser(null)} />}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="glass-panel bg-card p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-semibold text-base">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <Trash2 size={16} />
              </div>
              <span>Revoke Portal Access</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to revoke portal permissions for{" "}
              <strong className="text-foreground">{deleteConfirm.name}</strong> (@{deleteConfirm.username})?
              This action will be recorded in the security audit log.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  removeUser(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="btn-primary bg-rose-600 hover:bg-rose-700 text-xs shadow-sm"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation & Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-accent text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Shield size={14} />
            <span>Corporate Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-accent text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <History size={14} />
            <span>Security Audit Log ({userLogs.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 self-end sm:self-auto">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>SSO / Corporate Identity Active</span>
        </div>
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Toolbar: Search, Filters & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 max-w-lg flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, @user, title, employee ID..."
                  className="input-base pl-8 text-xs h-9 w-full"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-base text-xs h-9 w-auto shrink-0"
              >
                <option value="">All Roles</option>
                <option value="requester">Requester</option>
                <option value="setup_owner">Setup File Owner</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="input-base text-xs h-9 w-auto shrink-0"
              >
                <option value="">All Depts</option>
                <option value="GNTC">GNTC</option>
                <option value="MFG">MFG</option>
              </select>
            </div>

            <button
              onClick={() => setShowAssignDialog(true)}
              className="btn-primary text-xs py-2 shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>Assign Corporate User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="glass-panel overflow-hidden bg-card border border-border rounded-xl shadow-xs">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider select-none">
                    <th className="py-3 px-3.5">Employee & Identity</th>
                    <th className="py-3 px-3.5">Employee ID / Org</th>
                    <th className="py-3 px-3.5">Corporate Email</th>
                    <th className="py-3 px-3.5">Assigned Role</th>
                    <th className="py-3 px-3.5">Department</th>
                    <th className="py-3 px-3.5 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground mx-auto flex items-center justify-center mb-2">
                          <Search size={18} />
                        </div>
                        <div className="font-semibold text-foreground text-xs">No corporate users found</div>
                        <div className="text-[11px] mt-0.5">Try clearing filters or search terms.</div>
                      </td>
                    </tr>
                  )}

                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const roleInfo = ROLE_INFO[u.role];
                    const deptClass = u.department ? DEPT_BADGES[u.department] : "";

                    return (
                      <tr key={u.id} className="table-row-hover transition-colors">
                        {/* Employee & Title */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/90 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground truncate max-w-[180px]">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                {u.title || "Corporate User"}
                              </div>
                              <div className="text-[10px] font-mono text-accent">@{u.username}</div>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID & Org */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-mono-code font-bold text-foreground text-xs">
                            {u.employeeId || "NXP-00000"}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 size={10} />
                            <span>{u.company || "NXP"}</span>
                          </div>
                        </td>

                        {/* Corporate Email */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                            <span className="font-mono-code text-[11px]">{u.email}</span>
                            <button
                              onClick={(e) => handleCopyEmail(e, u.email)}
                              title="Copy email address"
                              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copiedId === u.email ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleInfo.badgeClass}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Department Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {u.department ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${deptClass}`}
                            >
                              {u.department}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5"
                              title="Edit Role & Permissions"
                            >
                              <Edit3 size={12} />
                              <span>Edit Role</span>
                            </button>

                            <button
                              onClick={() => setDeleteConfirm(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot revoke your own active account" : "Revoke Access"}
                              className={`p-1.5 rounded-md transition-colors ${
                                isSelf
                                  ? "opacity-30 cursor-not-allowed text-muted-foreground"
                                  : "text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing {filteredUsers.length} of {users.length} corporate users
              </div>
              <div className="text-[11px]">
                Role changes are audited automatically with GMT+7 timestamps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOG */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="p-3 bg-secondary/30 rounded-xl border border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>Security audit trail for all role assignments, department shifts, and access changes.</span>
            <span className="font-mono text-[11px]">{userLogs.length} total entries</span>
          </div>

          <div className="glass-panel overflow-hidden bg-card border border-border rounded-xl shadow-xs">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider select-none">
                    <th className="py-3 px-3.5">Timestamp (GMT+7)</th>
                    <th className="py-3 px-3.5">Action</th>
                    <th className="py-3 px-3.5">Affected User</th>
                    <th className="py-3 px-3.5">Permission Transition</th>
                    <th className="py-3 px-3.5">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {userLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground">
                        No user role changes recorded yet.
                      </td>
                    </tr>
                  )}

                  {userLogs.map((log) => (
                    <tr key={log.id} className="table-row-hover transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono-code text-[11px] text-muted-foreground">
                        {formatBangkokDate(log.performedAt)}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-light text-accent border border-accent/30">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-foreground whitespace-nowrap">
                        {log.targetUserName}
                      </td>
                      <td className="py-3 px-3.5 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.oldValue && (
                            <span className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 line-through px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-[11px]">
                              {log.oldValue}
                            </span>
                          )}
                          {log.oldValue && log.newValue && (
                            <ArrowRight size={12} className="text-muted-foreground" />
                          )}
                          {log.newValue && (
                            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
                              {log.newValue}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-muted-foreground">
                        <span className="font-semibold text-foreground">{log.performedByName}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
