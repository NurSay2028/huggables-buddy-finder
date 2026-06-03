import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Ban, ShieldAlert, Clock, Smile, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Super admin — Djoni Dentist" },
      { name: "description", content: "Djoni Dentist super admin boshqaruv paneli." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type ClinicRow = {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  city: string;
  status: "pending" | "approved" | "blocked" | "suspended";
  subscription_plan: string;
  doctors_count: number;
  created_at: string;
};

function AdminPage() {
  const { loading, session, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClinicRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | ClinicRow["status"]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("clinics")
      .select("id,name,owner_name,phone,city,status,subscription_plan,doctors_count,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as ClinicRow[]) ?? []);
  };

  const statusLabel: Record<ClinicRow["status"], string> = {
    pending: "Ochiq",
    approved: "Faol",
    blocked: "Bloklangan",
    suspended: "To‘xtatilgan",
  };
  const filterLabel: Record<"all" | ClinicRow["status"], string> = {
    all: "Hammasi",
    pending: "Ochiq",
    approved: "Faol",
    blocked: "Bloklangan",
    suspended: "To‘xtatilgan",
  };

  useEffect(() => {
    if (isSuperAdmin) void load();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Ruxsat yo‘q</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu sahifaga faqat super adminlar kira oladi.
          </p>
          <Link to="/app" className="btn-primary mt-6">Boshqaruv paneliga qaytish</Link>
        </div>
      </div>
    );
  }

  const setStatus = async (id: string, status: ClinicRow["status"]) => {
    const { error } = await supabase.from("clinics").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Klinika holati: ${statusLabel[status]}`);
    void load();
  };

  const filtered = (rows ?? []).filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !`${r.name} ${r.owner_name} ${r.city} ${r.phone}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: rows?.length ?? 0,
    approved: rows?.filter((r) => r.status === "approved").length ?? 0,
    suspended: rows?.filter((r) => r.status === "suspended").length ?? 0,
    blocked: rows?.filter((r) => r.status === "blocked").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Smile className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">Patient</span>
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
              <Shield className="h-3 w-3" /> Super admin
            </span>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="btn-ghost"
          >
            <LogOut className="h-4 w-4" /> Chiqish
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Platforma ko‘rinishi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platformadagi barcha klinikalarni boshqaring.</p>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Jami klinikalar" value={counts.total} />
          <Stat label="Faol" value={counts.approved} tone="success" />
          <Stat label="To‘xtatilgan" value={counts.suspended} tone="warning" />
          <Stat label="Bloklangan" value={counts.blocked} tone="destructive" />
        </section>

        <section className="card mt-8 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <input
              className="input max-w-xs"
              placeholder="Klinika, egasi, telefon bo‘yicha qidirish…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["all", "approved", "blocked", "suspended"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    filter === s ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterLabel[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Klinika</th>
                  <th className="px-4 py-3">Egasi</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Shahar</th>
                  <th className="px-4 py-3">Tarif</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!rows && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Yuklanmoqda…</td></tr>
                )}
                {rows && filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Klinikalar topilmadi</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.owner_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.city}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.subscription_plan}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} label={statusLabel[r.status]} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {r.status !== "suspended" && (
                          <ActionBtn icon={Clock} label="To‘xtatish" onClick={() => setStatus(r.id, "suspended")} />
                        )}
                        {r.status !== "blocked" && (
                          <ActionBtn icon={Ban} label="Bloklash" onClick={() => setStatus(r.id, "blocked")} tone="destructive" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "destructive" }) {
  const toneClass =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning-foreground" :
    tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: ClinicRow["status"]; label: string }) {
  const map = {
    pending: "bg-warning/15 text-warning-foreground",
    approved: "bg-success/15 text-success",
    blocked: "bg-destructive/15 text-destructive",
    suspended: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {label}
    </span>
  );
}

function ActionBtn({
  icon: Icon, label, onClick, tone,
}: { icon: typeof Ban; label: string; onClick: () => void; tone?: "success" | "destructive" }) {
  const cls =
    tone === "success" ? "text-success hover:bg-success/10" :
    tone === "destructive" ? "text-destructive hover:bg-destructive/10" :
    "text-muted-foreground hover:bg-muted";
  return (
    <button onClick={onClick} title={label} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${cls}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
