import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MockUser, UserRole, Department } from "../../mock/mockUsers";
import { UserLog } from "../../mock/mockUserLogs";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Shield,
  History,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRightLeft,
  UserX,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  requester: "Requester",
  setup_owner: "Setup File Owner",
  admin: "Admin",
};

const ROLE_STYLES: Record<UserRole, { bg: string; color: string }> = {
  requester: { bg: "#f3f4f6", color: "#374151" },
  setup_owner: { bg: "#dbeafe", color: "#1d4ed8" },
  admin: { bg: "#fce7f3", color: "#be185d" },
};

const DEPT_STYLES: Record<string, { bg: string; color: string }> = {
  GNTC: { bg: "#dbeafe", color: "#1d4ed8" },
  MFG: { bg: "#fce7f3", color: "#be185d" },
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  USER_ADDED: { label: "User Added", icon: <UserPlus size={13} />, color: "#059669" },
  USER_REMOVED: { label: "User Removed", icon: <UserX size={13} />, color: "#dc2626" },
  ROLE_CHANGED: { label: "Role Changed", icon: <ArrowRightLeft size={13} />, color: "#d97706" },
  DEPARTMENT_CHANGED: { label: "Dept. Changed", icon: <RefreshCw size={13} />, color: "#7c3aed" },
  USER_UPDATED: { label: "User Updated", icon: <UserCheck size={13} />, color: "#0369a1" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
  });
}

interface UserFormState {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  department: Department;
  password: string;
}

const EMPTY_FORM: UserFormState = {
  name: "",
  username: "",
  email: "",
  role: "requester",
  department: null,
  password: "",
};

// ─── Add User Dialog ──────────────────────────────────────────────────────────

function AddUserDialog({ onClose }: { onClose: () => void }) {
  const { addUser } = useApp();
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.username.trim()) { setError("Username is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.password) { setError("Password is required."); return; }
    if (form.role === "setup_owner" && !form.department) { setError("Department is required for Setup File Owner."); return; }
    addUser({
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim(),
      role: form.role,
      department: form.role === "setup_owner" ? form.department : null,
      password: form.password,
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", padding: 28, width: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <UserPlus size={18} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Add New User</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Full Name <span style={{ color: "var(--destructive)" }}>*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" style={inputStyle} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Username <span style={{ color: "var(--destructive)" }}>*</span></label>
                <input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. johndoe" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Email <span style={{ color: "var(--destructive)" }}>*</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="john@company.com" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Role <span style={{ color: "var(--destructive)" }}>*</span></label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole, department: null }))} style={inputStyle}>
                  <option value="requester">Requester</option>
                  <option value="setup_owner">Setup File Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === "setup_owner" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Department <span style={{ color: "var(--destructive)" }}>*</span></label>
                  <select value={form.department ?? ""} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value as Department }))} style={inputStyle}>
                    <option value="">Select...</option>
                    <option value="GNTC">GNTC</option>
                    <option value="MFG">MFG</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 5 }}>Password <span style={{ color: "var(--destructive)" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Initial password" style={{ ...inputStyle, paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          {error && <div style={{ color: "var(--destructive)", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button type="submit" style={{ padding: "8px 16px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main UsersPage ───────────────────────────────────────────────────────────

export function UsersPage() {
  const { users, updateUser, removeUser, userLogs, currentUser } = useApp();
  const [tab, setTab] = useState<"users" | "log">("users");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("requester");
  const [editDept, setEditDept] = useState<Department>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MockUser | null>(null);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (u: MockUser) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditDept(u.department);
  };

  const saveEdit = (id: string) => {
    updateUser(id, {
      role: editRole,
      department: editRole === "setup_owner" ? editDept : null,
    });
    setEditingId(null);
  };

  const selectStyle: React.CSSProperties = {
    padding: "5px 8px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 12,
    background: "var(--input-background)",
    color: "var(--foreground)",
  };

  const inputStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 13,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      {showAddDialog && <AddUserDialog onClose={() => setShowAddDialog(false)} />}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--card)", borderRadius: "var(--radius)", padding: 24, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#991b1b", fontWeight: 600 }}>
              <Trash2 size={18} /> Remove User
            </div>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 6 }}>
              Remove <strong>{deleteConfirm.name}</strong> (@{deleteConfirm.username})?
            </p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>
              This action will be logged. The user will no longer be able to log in.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "7px 14px", background: "var(--secondary)", color: "var(--secondary-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={() => { removeUser(deleteConfirm!.id); setDeleteConfirm(null); }} style={{ padding: "7px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Remove User</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {([
          { key: "users", label: "Users", icon: <Shield size={14} /> },
          { key: "log", label: `Audit Log (${userLogs.length})`, icon: <History size={14} /> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 16px",
              background: "none", border: "none", borderBottom: tab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
              cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "var(--primary)" : "var(--muted-foreground)", marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, email..."
              style={{ ...inputStyle, width: 280, flex: "0 1 280px" }}
            />
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => setShowAddDialog(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: "var(--primary)", color: "var(--primary-foreground)",
                  border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}
              >
                <UserPlus size={15} /> Add User
              </button>
            </div>
          </div>

          {/* Users table */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["User", "Username", "Email", "Role", "Department", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => {
                  const isEditing = editingId === u.id;
                  const isSelf = u.id === currentUser?.id;
                  const roleStyle = ROLE_STYLES[u.role];
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "var(--primary-foreground)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{u.name}</div>
                            {isSelf && <div style={{ fontSize: 10, color: "#059669" }}>← You</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)", fontFamily: "monospace", fontSize: 12 }}>@{u.username}</td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)", fontSize: 12 }}>{u.email}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {isEditing ? (
                          <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)} style={selectStyle}>
                            <option value="requester">Requester</option>
                            <option value="setup_owner">Setup File Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span style={{ padding: "2px 9px", background: roleStyle.bg, color: roleStyle.color, borderRadius: 10, fontSize: 12, fontWeight: 500 }}>
                            {ROLE_LABELS[u.role]}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {isEditing && editRole === "setup_owner" ? (
                          <select value={editDept ?? ""} onChange={(e) => setEditDept(e.target.value as Department)} style={selectStyle}>
                            <option value="">Select...</option>
                            <option value="GNTC">GNTC</option>
                            <option value="MFG">MFG</option>
                          </select>
                        ) : u.department ? (
                          <span style={{ padding: "2px 7px", background: DEPT_STYLES[u.department].bg, color: DEPT_STYLES[u.department].color, borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                            {u.department}
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted-foreground)" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => saveEdit(u.id)} style={{ padding: "4px 9px", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: "var(--radius)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
                              <Check size={12} /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ padding: "4px 8px", background: "var(--muted)", color: "var(--muted-foreground)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => startEdit(u)} style={{ padding: "4px 10px", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--muted-foreground)" }}>
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot remove your own account" : "Remove user"}
                              style={{ padding: "4px 7px", background: isSelf ? "var(--muted)" : "#fee2e2", color: isSelf ? "var(--muted-foreground)" : "#991b1b", border: "none", borderRadius: "var(--radius)", cursor: isSelf ? "not-allowed" : "pointer", display: "flex", alignItems: "center", opacity: isSelf ? 0.5 : 1 }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted-foreground)" }}>
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}

      {tab === "log" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
            All user management actions are logged here for traceability.
          </p>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Time (GMT+7)", "Action", "User Affected", "Change", "Performed By", "Note"].map((h) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)", fontSize: 13 }}>No user activity logged yet.</td>
                  </tr>
                )}
                {userLogs.map((log) => {
                  const cfg = ACTION_CONFIG[log.actionType] ?? { label: log.actionType, icon: null, color: "#6b7280" };
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "9px 14px", whiteSpace: "nowrap", color: "var(--muted-foreground)", fontSize: 12 }}>
                        {formatDate(log.performedAt)}
                      </td>
                      <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", background: cfg.color + "18", color: cfg.color, borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: "9px 14px", fontWeight: 500 }}>
                        {log.targetUserName}
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: 12 }}>
                        {log.oldValue && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 7px", borderRadius: 4, textDecoration: "line-through" }}>{log.oldValue}</span>
                            {log.newValue && <span style={{ color: "var(--muted-foreground)" }}>→</span>}
                          </span>
                        )}
                        {log.newValue && (
                          <span style={{ background: "#d1fae5", color: "#065f46", padding: "1px 7px", borderRadius: 4, marginLeft: log.oldValue ? 4 : 0 }}>{log.newValue}</span>
                        )}
                        {!log.oldValue && !log.newValue && <span style={{ color: "var(--muted-foreground)" }}>—</span>}
                      </td>
                      <td style={{ padding: "9px 14px", color: "var(--muted-foreground)", fontSize: 12 }}>
                        {log.performedByName}
                      </td>
                      <td style={{ padding: "9px 14px", color: "var(--muted-foreground)", fontSize: 12, fontStyle: "italic" }}>
                        {log.note ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
