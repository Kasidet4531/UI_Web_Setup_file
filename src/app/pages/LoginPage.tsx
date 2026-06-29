import { useState } from "react";
import { useApp } from "../context/AppContext";
import { MOCK_USERS } from "../mock/mockUsers";
import { Lock, User, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = login(username, password);
    if (ok) {
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  const quickLogin = (u: (typeof MOCK_USERS)[number]) => {
    const ok = login(u.username, u.password);
    if (ok) onLogin();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px 10px 40px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 14,
    background: "var(--input-background)",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            PSF Request System
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Sign in to manage PSF Setup File requests
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 28,
            marginBottom: 20,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-foreground)",
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-foreground)",
                  }}
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                    display: "flex",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "8px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Quick login */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 20,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12, fontWeight: 500 }}>
            🧪 Prototype Quick Login — click a role to sign in
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => quickLogin(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "var(--accent)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: 13,
                  textAlign: "left",
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
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {u.role === "setup_owner"
                      ? `Setup File Owner · ${u.department}`
                      : u.role === "admin"
                      ? "Admin"
                      : "Requester"}{" "}
                    · @{u.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
