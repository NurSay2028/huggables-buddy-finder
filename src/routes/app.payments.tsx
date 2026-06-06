import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDateTime, fmtSum } from "@/lib/format";
import { exportToExcel } from "@/lib/excel-export";
import { Plus, Trash2, Wallet, FileDown, Search } from "lucide-react";
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
  doctor_id: string | null;
  doctor_share: number | null;
  clinic_share: number | null;
  doctor_percentage: number | null;
  patients: { full_name: string } | null;
  doctors: { full_name: string } | null;
};

type LookupDoctor = { id: string; full_name: string; salary_percentage: number };
type LookupPatient = { id: string; full_name: string; phone: string | null; debt: number | null };

function PaymentsPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Payment[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<LookupPatient[]>([]);
  const [doctors, setDoctors] = useState<LookupDoctor[]>([]);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("payments")
      .select("*, patients(full_name), doctors(full_name)")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return toast.error(error.message);
    setRows(data as Payment[]);
  };

  useEffect(() => {
    void load();
    if (clinic) {
      supabase.from("patients").select("id,full_name,phone,debt").eq("clinic_id", clinic.id).order("full_name")
        .then(({ data }) => setPatients((data ?? []) as LookupPatient[]));
      supabase.from("doctors").select("id,full_name,salary_percentage").eq("clinic_id", clinic.id).eq("active", true).order("full_name")
        .then(({ data }) => setDoctors((data ?? []) as LookupDoctor[]));
    }
  }, [clinic?.id]);

  const remove = async (id: string) => {
    if (!confirm("To‘lovni o‘chirasizmi?")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const filtered = useMemo(() => {
    if (!rows) return null;
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.patients?.full_name ?? "").toLowerCase().includes(q) ||
      (r.doctors?.full_name ?? "").toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      METHOD_LABEL[r.method].toLowerCase().includes(q),
    );
  }, [rows, query]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTotal = (filtered ?? []).filter((r) => new Date(r.created_at) >= today).reduce((s, r) => s + Number(r.amount), 0);
  const totalAll = (filtered ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const doctorTotal = (filtered ?? []).reduce((s, r) => s + Number(r.doctor_share ?? 0), 0);

  const exportExcel = () => {
    if (!rows?.length) return toast.error("Eksport uchun to‘lov yo‘q");
    exportToExcel(
      rows.map((p) => ({
        "Sana": fmtDateTime(p.created_at),
        "Bemor": p.patients?.full_name ?? "—",
        "Shifokor": p.doctors?.full_name ?? "—",
        "Usul": METHOD_LABEL[p.method],
        "Izoh": p.description || "—",
        "Summa (so‘m)": Number(p.amount) || 0,
        "Foiz (%)": Number(p.doctor_percentage ?? 0),
        "Shifokor ulushi": Number(p.doctor_share ?? 0),
        "Klinika ulushi": Number(p.clinic_share ?? 0),
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
        description="Klinika kassasi va shifokor ulushlari."
        actions={
          <div className="flex gap-2">
            <button onClick={exportExcel} className="btn-ghost"><FileDown className="h-4 w-4" /> Excel</button>
            <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> Yangi to‘lov</button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bugungi tushum" value={fmtSum(todayTotal)} />
        <Stat label="Jami (oxirgi 200)" value={fmtSum(totalAll)} />
        <Stat label="Shifokorlar ulushi" value={fmtSum(doctorTotal)} />
        <Stat label="To‘lovlar soni" value={String(filtered?.length ?? 0)} />
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="input pl-9"
          placeholder="Bemor, shifokor, izoh yoki usul bo‘yicha qidirish…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        {!filtered ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={query ? "Hech narsa topilmadi" : "To‘lovlar yo‘q"}
            description={query ? "Boshqa so‘z bilan qidirib ko‘ring." : "Birinchi to‘lovni qo‘shing."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Bemor</th>
                  <th className="px-4 py-3">Shifokor</th>
                  <th className="px-4 py-3">Usul</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                  <th className="px-4 py-3 text-right">Shifokor</th>
                  <th className="px-4 py-3 text-right">Klinika</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{fmtDateTime(p.created_at)}</td>
                    <td className="px-4 py-3 font-medium">{p.patients?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.doctors?.full_name ?? "—"}
                      {p.doctor_percentage ? <span className="ml-1 text-xs">({Number(p.doctor_percentage)}%)</span> : null}
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{METHOD_LABEL[p.method]}</span></td>
                    <td className="px-4 py-3 text-right font-semibold">{fmtSum(p.amount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmtSum(p.doctor_share ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmtSum(p.clinic_share ?? 0)}</td>
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
          doctors={doctors}
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

function PaymentForm({ patients, doctors, clinicId, onClose, onSaved }: {
  patients: { id: string; full_name: string }[];
  doctors: LookupDoctor[];
  clinicId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    amount: 0,
    percentage: 0,
    method: "cash" as Method,
    description: "",
    reduceDebt: true,
  });
  const [saving, setSaving] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [showList, setShowList] = useState(false);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.full_name.toLowerCase().includes(q));
  }, [patients, patientQuery]);

  const selectPatient = (p: { id: string; full_name: string }) => {
    setForm((f) => ({ ...f, patient_id: p.id }));
    setPatientQuery(p.full_name);
    setShowList(false);
  };

  const selectDoctor = (id: string) => {
    const doc = doctors.find((d) => d.id === id);
    setForm((f) => ({ ...f, doctor_id: id, percentage: doc ? Number(doc.salary_percentage) : 0 }));
  };

  // Automatic share calculation.
  const amount = Number(form.amount) || 0;
  const pct = Number(form.percentage) || 0;
  const doctorShare = Math.round((amount * pct) / 100);
  const clinicShare = amount - doctorShare;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) return toast.error("Bemorni tanlang");
    if (!form.doctor_id) return toast.error("Shifokorni tanlang");
    if (amount <= 0) return toast.error("Summa noto‘g‘ri");
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      amount,
      doctor_percentage: pct,
      doctor_share: doctorShare,
      clinic_share: clinicShare,
      method: form.method,
      description: form.description || null,
      clinic_id: clinicId,
    });
    if (error) { setSaving(false); return toast.error(error.message); }
    if (form.reduceDebt) {
      const { data: p } = await supabase.from("patients").select("debt").eq("id", form.patient_id).maybeSingle();
      const newDebt = Math.max(0, Number(p?.debt ?? 0) - amount);
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-9"
              placeholder="Bemor ismini yozing…"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setShowList(true);
                setForm((f) => ({ ...f, patient_id: "" }));
              }}
              onFocus={() => setShowList(true)}
            />
            {showList && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                {filteredPatients.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Bemor topilmadi</div>
                ) : (
                  filteredPatients.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-muted/60 ${
                        form.patient_id === p.id ? "bg-primary-soft text-primary" : ""
                      }`}
                    >
                      {p.full_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Shifokor *</span>
          <select className="input" value={form.doctor_id} onChange={(e) => selectDoctor(e.target.value)} required>
            <option value="">— Tanlang —</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name} • {Number(d.salary_percentage)}%</option>)}
          </select>
          {doctors.length === 0 && (
            <span className="mt-1 block text-xs text-muted-foreground">Faol shifokor yo‘q — «Shifokorlar» bo‘limidan qo‘shing.</span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Summa (so‘m) *</span>
            <input type="number" min={1} className="input" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Foiz (%)</span>
            <input type="number" min={0} max={100} className="input" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
          </label>
        </div>

        {amount > 0 && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Shifokor ulushi</div>
              <div className="font-semibold text-primary">{fmtSum(doctorShare)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Klinika ulushi</div>
              <div className="font-semibold">{fmtSum(clinicShare)}</div>
            </div>
          </div>
        )}

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
