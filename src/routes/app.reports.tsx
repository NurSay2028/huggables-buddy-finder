import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { fmtSum } from "@/lib/format";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { clinic } = useAuth();
  const [payments, setPayments] = useState<{ amount: number; created_at: string }[]>([]);
  const [appts, setAppts] = useState<{ created_at: string; doctor_id: string | null }[]>([]);
  const [byDoctor, setByDoctor] = useState<{ name: string; total: number }[]>([]);

  useEffect(() => {
    if (!clinic) return;
    const since = new Date(); since.setDate(since.getDate() - 30);
    supabase.from("payments").select("amount,created_at").eq("clinic_id", clinic.id).gte("created_at", since.toISOString())
      .then(({ data }) => setPayments((data ?? []) as { amount: number; created_at: string }[]));
    supabase.from("appointments").select("created_at,doctor_id").eq("clinic_id", clinic.id).gte("created_at", since.toISOString())
      .then(({ data }) => setAppts((data ?? []) as { created_at: string; doctor_id: string | null }[]));
    supabase.from("dental_records").select("cost,doctor_id, doctors(full_name)").eq("clinic_id", clinic.id).gte("created_at", since.toISOString())
      .then(({ data }) => {
        const map = new Map<string, number>();
        (data ?? []).forEach((r: { cost: number | null; doctors: { full_name: string } | null }) => {
          const name = r.doctors?.full_name ?? "—";
          map.set(name, (map.get(name) ?? 0) + Number(r.cost ?? 0));
        });
        setByDoctor(Array.from(map, ([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8));
      });
  }, [clinic?.id]);

  const days = useMemo(() => {
    const arr: { day: string; revenue: number; visits: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const rev = payments.filter((p) => { const t = new Date(p.created_at); return t >= d && t < next; }).reduce((s, p) => s + Number(p.amount), 0);
      const v = appts.filter((a) => { const t = new Date(a.created_at); return t >= d && t < next; }).length;
      arr.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: rev, visits: v });
    }
    return arr;
  }, [payments, appts]);

  const totalRev = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Hisobotlar" description="Oxirgi 30 kun bo‘yicha statistika." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="30 kunlik daromad" value={fmtSum(totalRev)} />
        <Stat label="Qabullar" value={String(appts.length)} />
        <Stat label="Kunlik o‘rtacha" value={fmtSum(totalRev / 30)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold">Kunlik daromad</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 220)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => fmtSum(v)} />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.62 0.12 200)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold">Kunlik qabullar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 220)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="visits" fill="oklch(0.7 0.13 175)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Shifokorlar bo‘yicha tushum (protseduralar)</h3>
          {byDoctor.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Ma'lumot yo‘q</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byDoctor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 220)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: number) => fmtSum(v)} />
                <Bar dataKey="total" fill="oklch(0.62 0.12 200)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
