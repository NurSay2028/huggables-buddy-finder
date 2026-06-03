import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fmtSum } from "@/lib/format";
import {
  Users, CalendarCheck, Wallet, AlertCircle, TrendingUp, TrendingDown, Stethoscope, BellRing, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { isDueToday } from "@/lib/reminders";

export const Route = createFileRoute("/app/")({ component: Dashboard });

type Stats = {
  todayAppts: number;
  todayRevenue: number;
  totalPatients: number;
  totalDebt: number;
  remindersDue: number;
  aiRequests: number;
  monthRevenue: number;
  monthExpenses: number;
  monthProfit: number;
  revenueByMonth: { m: string; v: number; e: number }[];
  topDoctor: { name: string; specialty: string; revenue: number; procedures: number } | null;
  schedule: { time: string; patient: string; service: string; doctor: string }[];
  recent: { name: string; phone: string; last: string }[];
};

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))} daq oldin`;
  if (d < 86400) return `${Math.floor(d / 3600)} soat oldin`;
  if (d < 172800) return "Kecha";
  return `${Math.floor(d / 86400)} kun oldin`;
}

function Dashboard() {
  const { clinic, user } = useAuth();
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    if (!clinic) return;
    void (async () => {
      const cid = clinic.id;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 7); sixMonthsAgo.setDate(1);

      const [appts, payToday, patients, debt, paySix, expSix, appts6, doctors, todayList, recentP, reminders, aiReqs] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("clinic_id", cid).gte("starts_at", todayStart.toISOString()).lte("starts_at", todayEnd.toISOString()),
        supabase.from("payments").select("amount").eq("clinic_id", cid)
          .gte("created_at", todayStart.toISOString()).lte("created_at", todayEnd.toISOString()),
        supabase.from("patients").select("id,debt", { count: "exact" }).eq("clinic_id", cid),
        supabase.from("patients").select("debt").eq("clinic_id", cid),
        supabase.from("payments").select("amount,created_at,doctor_id:appointment_id")
          .eq("clinic_id", cid).gte("created_at", sixMonthsAgo.toISOString()),
        supabase.from("expenses").select("amount,spent_at")
          .eq("clinic_id", cid).gte("spent_at", sixMonthsAgo.toISOString().slice(0, 10)),
        supabase.from("appointments").select("id,doctor_id,starts_at").eq("clinic_id", cid)
          .gte("starts_at", sixMonthsAgo.toISOString()),
        supabase.from("doctors").select("id,full_name,specialty").eq("clinic_id", cid),
        supabase.from("appointments")
          .select("starts_at,service_type,patients(full_name),doctors(full_name)")
          .eq("clinic_id", cid)
          .gte("starts_at", todayStart.toISOString()).lte("starts_at", todayEnd.toISOString())
          .order("starts_at").limit(6),
        supabase.from("patients").select("full_name,phone,last_visit_at,created_at")
          .eq("clinic_id", cid).order("created_at", { ascending: false }).limit(5),
        supabase.from("patients").select("next_visit_date,reminder_days_before")
          .eq("clinic_id", cid).eq("reminder_enabled", true),
        supabase.from("ai_appointment_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);

      const remindersDue = (reminders.data ?? []).filter((r: any) =>
        isDueToday(r.next_visit_date, r.reminder_days_before ?? 0)).length;

      const todayRevenue = (payToday.data ?? []).reduce((a: number, p: any) => a + Number(p.amount || 0), 0);
      const totalDebt = (debt.data ?? []).reduce((a: number, p: any) => a + Number(p.debt || 0), 0);

      // monthly revenue + expenses (last 8 months)
      const months: { key: string; m: string; v: number; e: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, m: MONTHS[d.getMonth()], v: 0, e: 0 });
      }
      (paySix.data ?? []).forEach((p: any) => {
        const d = new Date(p.created_at);
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        const slot = months.find((x) => x.key === k);
        if (slot) slot.v += Number(p.amount || 0);
      });
      (expSix.data ?? []).forEach((p: any) => {
        const d = new Date(p.spent_at);
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        const slot = months.find((x) => x.key === k);
        if (slot) slot.e += Number(p.amount || 0);
      });

      const now = new Date();
      const curKey = `${now.getFullYear()}-${now.getMonth()}`;
      const curSlot = months.find((x) => x.key === curKey);
      const monthRevenue = curSlot?.v ?? 0;
      const monthExpenses = curSlot?.e ?? 0;
      const monthProfit = monthRevenue - monthExpenses;

      // top doctor by appointments + revenue (via appointments → payments join is complex; use appointment count)
      const apptByDoc = new Map<string, number>();
      (appts6.data ?? []).forEach((a: any) => {
        if (!a.doctor_id) return;
        apptByDoc.set(a.doctor_id, (apptByDoc.get(a.doctor_id) ?? 0) + 1);
      });
      let topDoctor: Stats["topDoctor"] = null;
      if (apptByDoc.size && doctors.data?.length) {
        const [topId, count] = [...apptByDoc.entries()].sort((a, b) => b[1] - a[1])[0];
        const doc = doctors.data.find((d: any) => d.id === topId);
        if (doc) topDoctor = { name: doc.full_name, specialty: doc.specialty ?? "Shifokor", revenue: 0, procedures: count };
      }

      setS({
        todayAppts: appts.count ?? 0,
        todayRevenue,
        totalPatients: patients.count ?? 0,
        totalDebt,
        remindersDue,
        aiRequests: aiReqs.count ?? 0,
        monthRevenue, monthExpenses, monthProfit,
        revenueByMonth: months.map(({ m, v, e }) => ({ m, v, e })),
        topDoctor,
        schedule: (todayList.data ?? []).map((a: any) => ({
          time: new Date(a.starts_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          patient: a.patients?.full_name ?? "—",
          service: a.service_type ?? "—",
          doctor: a.doctors?.full_name ?? "—",
        })),
        recent: (recentP.data ?? []).map((p: any) => ({
          name: p.full_name, phone: p.phone, last: timeAgo(p.last_visit_at ?? p.created_at),
        })),
      });
    })();
  }, [clinic?.id]);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Xush kelibsiz{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bugun {clinic?.name} klinikasida nimalar bo‘layotganini ko‘ring.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Bugungi qabullar" value={String(s?.todayAppts ?? 0)} />
        <Stat icon={Wallet} label="Bugungi daromad" value={fmtSum(s?.todayRevenue ?? 0)} />
        <Stat icon={Users} label="Jami bemorlar" value={String(s?.totalPatients ?? 0)} />
        <Stat icon={AlertCircle} label="Qoldiq qarz" value={fmtSum(s?.totalDebt ?? 0)} tone="warning" />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={TrendingUp} label="Bu oy daromad" value={fmtSum(s?.monthRevenue ?? 0)} />
        <Stat icon={TrendingDown} label="Bu oy xarajat" value={fmtSum(s?.monthExpenses ?? 0)} tone="warning" />
        <Stat icon={Wallet} label="Bu oy sof foyda" value={fmtSum(s?.monthProfit ?? 0)} tone={(s?.monthProfit ?? 0) < 0 ? "warning" : undefined} />
      </section>

      {(s?.remindersDue ?? 0) > 0 && (
        <Link
          to="/app/reminders"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 transition hover:bg-primary/10"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BellRing className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Bugun bog‘lanish kerak bo‘lgan bemorlar</div>
            <div className="text-xs text-muted-foreground">
              {s?.remindersDue} ta bemor eslatma kutmoqda
            </div>
          </div>
          <div className="text-sm font-medium text-primary">Ko‘rish →</div>
        </Link>
      )}

      {(s?.aiRequests ?? 0) > 0 && (
        <Link
          to="/app/notifications"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-primary/20 bg-card px-5 py-4 transition hover:bg-muted/50"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">AI orqali kelgan mijozlar</div>
            <div className="text-xs text-muted-foreground">
              {s?.aiRequests} ta yangi so‘rov
            </div>
          </div>
          <div className="text-sm font-medium text-primary">Ko‘rish →</div>
        </Link>
      )}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Oylik daromad</h2>
              <p className="text-sm text-muted-foreground">So‘nggi 8 oy</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              Real
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s?.revenueByMonth ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.12 200)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.62 0.12 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.92 0.008 220)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.5 0.02 240)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.02 240)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: any) => fmtSum(Number(v))}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 220)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="v" stroke="oklch(0.62 0.12 200)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold">Eng yaxshi shifokor</h2>
          <p className="text-sm text-muted-foreground">So‘nggi 6 oy</p>
          {s?.topDoctor ? (
            <>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.topDoctor.name}</div>
                  <div className="text-xs text-muted-foreground">{s.topDoctor.specialty}</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3">
                <Mini label="Qabullar soni" value={String(s.topDoctor.procedures)} />
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Ma'lumot yo‘q</p>
          )}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold">Bugungi jadval</h2>
          {s?.schedule.length ? (
            <ul className="mt-4 divide-y divide-border">
              {s.schedule.map((x, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{x.patient}</div>
                    <div className="text-xs text-muted-foreground">{x.service} · {x.doctor}</div>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">{x.time}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Bugun qabullar yo‘q</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold">So‘nggi bemorlar</h2>
          {s?.recent.length ? (
            <ul className="mt-4 divide-y divide-border">
              {s.recent.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.phone}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.last}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Bemorlar yo‘q</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: {
  icon: typeof Users; label: string; value: string; tone?: "warning";
}) {
  return (
    <div className="card p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${
        tone === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-primary-soft text-primary"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
