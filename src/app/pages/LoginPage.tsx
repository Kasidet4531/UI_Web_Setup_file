import React, { useState } from "react";
import nxpLogo from "../../../NXP.png";
import { useApp } from "../context/AppContext";
import { MOCK_USERS } from "../mock/mockUsers";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Layers,
  UserCheck,
  Sparkles,
} from "lucide-react";

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
      setError("Invalid username or password. You can also use quick login below.");
    }
  };

  const quickLogin = (u: (typeof MOCK_USERS)[number]) => {
    const ok = login(u.username, u.password);
    if (ok) onLogin();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
          <div className="flex items-center justify-center w-full">
            <img
              src={nxpLogo}
              alt="NXP Semiconductors"
              className="h-20 sm:h-24 w-auto object-contain block"
            />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              PSF Request Portal
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-7 space-y-5 bg-card shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Username</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. requester01, setup_gntc01, admin01"
                  className="input-base pl-9 text-xs"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: password)"
                  className="input-base pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              <span>Sign In to Portal</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Quick Testing Personas */}
        <div className="glass-panel p-5 bg-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              <span>Instant Persona Login (For Testing)</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Click to enter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_USERS.map((u) => {
              let roleColor = "border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600";
              let roleIcon = <UserCheck size={14} />;
              let roleLabel = "Requester";

              if (u.role === "setup_owner") {
                roleColor = "border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-600";
                roleIcon = <Layers size={14} />;
                roleLabel = `Setup (${u.department})`;
              } else if (u.role === "admin") {
                roleColor = "border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600";
                roleIcon = <Shield size={14} />;
                roleLabel = "Admin";
              }

              return (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary hover:border-border-strong text-left transition-all group cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${roleColor}`}
                  >
                    {roleIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {roleLabel} · @{u.username}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
