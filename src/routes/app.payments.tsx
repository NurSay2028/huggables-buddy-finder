import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDateTime, fmtSum } from "@/lib/format";
import { exportToExcel } from "@/lib/excel-export";
import { Plus, Trash2, Wallet, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payments")({
  component: PaymentsPage,
});

type Method = "cash" | "card" | "click" | "payme" | "bank_transfer";
const METHOD_LABEL: Record<Method, string> = {
  cash: "Naqd", card: "Karta", click: "Click", payme: "Payme", bank_transfer: "Bank o‘tkazma",
};

type Payment = {
  id: string;
  amount: number;
  method: Method;
  description: string | null;
  created_at: string;
  patient_id: string;
  patients: { full_name: string } | null;
};

function PaymentsPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Payment[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([]);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("payments")
      .select("*, patients(full_name)")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return toast.error(error.message);
    setRows(data as Payment[]);
  };

  useEffect(() => {
    void load();
    if (clinic) {
      supabase.from("patients").select("id,full_name").eq("clinic_id", clinic.id).order("full_name")
        .then(({ data }) => setPatients((data ?? []) as { id: string; full_name: string }[]));
    }
  }, [clinic?.id]);

  const remove = async (id: string) => {
    if (!confirm("To‘lovni o‘chirasizmi?")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTotal = (rows ?? []).filter((r) => new Date(r.created_at) >= today).reduce((s, r) => s + Number(r.amount), 0);
  const totalAll = (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const exportExcel = () => {
    if (!rows?.length) return toast.error("Eksport uchun to‘lov yo‘q");
    exportToExcel(
      rows.map((p) => ({
        "Sana": fmtDateTime(p.created_at),
        "Bemor": p.patients?.full_name ?? "—",
        "Usul": METHOD_LABEL[p.method],
        "Izoh": p.description || "—",
        "Summa (so‘m)": Number(p.amount) || 0,
      })),
      "tolovlar",
      "To‘lovlar",
    );
    toast.success("Excel yuklab olindi");
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="To‘lovlar"
        description="Klinika kassasi va to‘lovlar tarixi."
        actions={
          <div className="flex gap-2">
            <button onClick={exportExcel} className="btn-ghost"><FileDown className="h-4 w-4" /> Excel</button>
            <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> Yangi to‘lov</button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Bugungi tushum" value={fmtSum(todayTotal)} />
        <Stat label="Jami (oxirgi 200)" value={fmtSum(totalAll)} />
        <Stat label="To‘lovlar soni" value={String(rows?.length ?? 0)} />
      </div>

      <div className="card overflow-hidden">
        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="To‘lovlar yo‘q" description="Birinchi to‘lovni qo‘shing." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Bemor</th>
                  <th className="px-4 py-3">Usul</th>
                  <th className="px-4 py-3">Izoh</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{fmtDateTime(p.created_at)}</td>
                    <td className="px-4 py-3 font-medium">{p.patients?.full_name ?? "—"}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{METHOD_LABEL[p.method]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{fmtSum(p.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <PaymentForm
          patients={patients}
          clinicId={clinic!.id}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); void load(); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" />{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function PaymentForm({ patients, clinicId, onClose, onSaved }: {
  patients: { id: string; full_name: string }[]; clinicId: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    patient_id: "",
    amount: 0,
    method: "cash" as Method,
    description: "",
    reduceDebt: true,
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) return toast.error("Bemorni tanlang");
    if (form.amount <= 0) return toast.error("Summa noto‘g‘ri");
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      patient_id: form.patient_id,
      amount: form.amount,
      method: form.method,
      description: form.description || null,
      clinic_id: clinicId,
    });
    if (error) { setSaving(false); return toast.error(error.message); }
    if (form.reduceDebt) {
      const { data: p } = await supabase.from("patients").select("debt").eq("id", form.patient_id).maybeSingle();
      const newDebt = Math.max(0, Number(p?.debt ?? 0) - form.amount);
      await supabase.from("patients").update({ debt: newDebt, last_visit_at: new Date().toISOString() }).eq("id", form.patient_id);
    }
    setSaving(false);
    toast.success("To‘lov qo‘shildi");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Yangi to‘lov">
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Bemor *</span>
          <select className="input" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
            <option value="">— Tanlang —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Summa (so‘m) *</span>
          <input type="number" min={1} className="input" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Usul</span>
          <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Method })}>
            {Object.entries(METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Izoh</span>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.reduceDebt} onChange={(e) => setForm({ ...form, reduceDebt: e.target.checked })} />
          Bemor qarzidan ayirish
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}
