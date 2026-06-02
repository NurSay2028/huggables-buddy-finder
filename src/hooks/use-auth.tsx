import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ClinicStatus = "pending" | "approved" | "blocked" | "suspended";
export type AppRole =
  | "super_admin"
  | "owner"
  | "admin"
  | "doctor"
  | "reception"
  | "warehouse"
  | "accountant";

export interface ClinicLite {
  id: string;
  name: string;
  status: ClinicStatus;
  subscription_plan: string;
  logo_url: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  roles: AppRole[];
  clinic: ClinicLite | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadMembership(userId: string): Promise<{
  roles: AppRole[];
  clinic: ClinicLite | null;
  isSuperAdmin: boolean;
}> {
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role, clinic_id")
    .eq("user_id", userId);

  const roles: AppRole[] = (roleRows ?? []).map((r) => r.role as AppRole);
  const isSuperAdmin = roles.includes("super_admin");
  const clinicId = isSuperAdmin
    ? null
    : ((roleRows ?? []).find((r) => r.clinic_id)?.clinic_id ?? null);

  let clinic: ClinicLite | null = null;
  if (clinicId) {
    const { data } = await supabase
      .from("clinics")
      .select("id, name, status, subscription_plan, logo_url")
      .eq("id", clinicId)
      .maybeSingle();
    if (data) clinic = data as ClinicLite;
  }
  return { roles, clinic, isSuperAdmin };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [clinic, setClinic] = useState<ClinicLite | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const hydrate = async (s: Session | null) => {
    setSession(s);
    setUser(s?.user ?? null);
    if (s?.user) {
      const m = await loadMembership(s.user.id);
      setRoles(m.roles);
      setClinic(m.clinic);
      setIsSuperAdmin(m.isSuperAdmin);
    } else {
      setRoles([]);
      setClinic(null);
      setIsSuperAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      // Defer Supabase calls to avoid deadlock
      setTimeout(() => void hydrate(s), 0);
    });
    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    await hydrate(data.session);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user, loading, isSuperAdmin, roles, clinic, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
