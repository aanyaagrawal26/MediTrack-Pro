"use client";

// =============================================================================
// Authentication context
// -----------------------------------------------------------------------------
// Lightweight session handling for the demo. The logged-in user id is kept in
// localStorage so a refresh keeps you signed in. Role drives what each user can
// see/do:
//   ADMIN  -> manage patients, nurses, medicines; full visibility
//   NURSE  -> confirm doses + view patients in her ward only
//
// In production you would replace this with NextAuth / a real session cookie,
// but the `useAuth()` API would stay the same.
// =============================================================================

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { ensureSeeded, findUserByCredentials, getUserById } from "./store";

const SESSION_KEY = "mtp.session";

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isNurse: boolean;
  isDoctor: boolean;
  isHeadNurse: boolean;
  /** Admins & doctors can create/edit clinical data. */
  canManage: boolean;
  /** Ward staff (nurse / head nurse) are scoped to a single ward. */
  wardScoped: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first mount.
  useEffect(() => {
    ensureSeeded();
    const id = localStorage.getItem(SESSION_KEY);
    if (id) setUser(getUserById(id) ?? null);
    setLoading(false);
  }, []);

  const login: AuthValue["login"] = (username, password) => {
    const found = findUserByCredentials(username, password);
    if (!found) return { ok: false, error: "Invalid username or password." };
    localStorage.setItem(SESSION_KEY, found.id);
    setUser(found);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === "ADMIN",
      isNurse: user?.role === "NURSE",
      isDoctor: user?.role === "DOCTOR",
      isHeadNurse: user?.role === "HEAD_NURSE",
      canManage: user?.role === "ADMIN" || user?.role === "DOCTOR",
      wardScoped: user?.role === "NURSE" || user?.role === "HEAD_NURSE",
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
