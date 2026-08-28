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
  AlertCircle,
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
          <div className="w-full space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              PSF Request Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to manage PSF setup files and workflow requests
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-7 space-y-5 bg-card shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Username</span>
                <span className="text-[11px] text-muted-foreground font-normal">e.g. requester01</span>
              </label>
              <div className="relative group">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-base input-with-icon text-sm h-11 shadow-2xs border-border/80 group-focus-within:border-accent group-focus-within:ring-2 group-focus-within:ring-accent/20 transition-all rounded-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Password</span>
                <span className="text-[11px] text-muted-foreground font-normal">default: password</span>
              </label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-base input-with-icon input-with-clear text-sm h-11 shadow-2xs border-border/80 group-focus-within:border-accent group-focus-within:ring-2 group-focus-within:ring-accent/20 transition-all rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 shadow-2xs">
                <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary h-11 text-sm font-semibold shadow-sm hover:shadow flex items-center justify-center gap-2 rounded-lg transition-all"
            >
              <span>Sign In to Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Quick Testing Personas */}
        <div className="glass-panel p-5 bg-card space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              <span>Instant Persona Login (For Testing)</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Click to login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_USERS.map((u) => {
              let roleColor = "border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400";
              let roleIcon = <UserCheck size={14} />;
              let roleLabel = "Requester";

              if (u.role === "setup_owner") {
                roleColor = "border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400";
                roleIcon = <Layers size={14} />;
                roleLabel = `Setup (${u.department})`;
              } else if (u.role === "admin") {
                roleColor = "border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400";
                roleIcon = <Shield size={14} />;
                roleLabel = "Admin";
              }

              return (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary hover:border-accent/40 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
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
                    <div className="text-[10px] text-muted-foreground truncate font-mono-code">
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
