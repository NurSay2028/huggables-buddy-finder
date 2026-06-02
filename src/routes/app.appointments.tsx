import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDateTime, fmtTime, toLocalInput } from "@/lib/format";
import { Plus, Pencil, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/appointments")({
  component: AppointmentsPage,
});

type Status = "waiting" | "in_treatment" | "completed" | "cancelled";
const STATUS_LABEL: Record<Status, string> = {
  waiting: "Kutmoqda",
  in_treatment: "Davom etmoqda",
  completed: "Tugatildi",
  cancelled: "Bekor qilindi",
};
const STATUS_COLOR: Record<Status, string> = {
  waiting: "bg-warning/15 text-warning-foreground",
  in_treatment: "bg-primary-soft text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

type Appt = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  service_type: string | null;
  starts_at: string;
  ends_at: string | null;
  status: Status;
  notes: string | null;
  patients: { full_name: string; phone: string } | null;
  doctors: { full_name: string } | null;
};

type LookupPatient = { id: string; full_name: string; phone: string };
type LookupDoctor = { id: string; full_name: string };

function AppointmentsPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Appt[] | null>(null);
  const [day, setDay] = useState(() => new Date());
  const [editing, setEditing] = useState<Appt | null>(null);
  const [creating, setCreating] = useState(false);
  const [patients, setPatients] = useState<LookupPatient[]>([]);
  const [doctors, setDoctors] = useState<LookupDoctor[]>([]);

  const dayStart = useMemo(() => { const d = new Date(day); d.setHours(0, 0, 0, 0); return d; }, [day]);
  const dayEnd = useMemo(() => { const d = new Date(day); d.setHours(23, 59, 59, 999); return d; }, [day]);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patients(full_name,phone), doctors(full_name)")
      .eq("clinic_id", clinic.id)
      .gte("starts_at", dayStart.toISOString())
      .lte("starts_at", dayEnd.toISOString())
      .order("starts_at");
    if (error) return toast.error(error.message);
    setRows(data as Appt[]);
  };

  const loadLookups = async () => {
    if (!clinic) return;
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("patients").select("id,full_name,phone").eq("clinic_id", clinic.id).order("full_name"),
      supabase.from("doctors").select("id,full_name").eq("clinic_id", clinic.id).eq("active", true).order("full_name"),
    ]);
    setPatients((p ?? []) as LookupPatient[]);
    setDoctors((d ?? []) as LookupDoctor[]);
  };

  useEffect(() => { void load(); }, [clinic?.id, dayStart.getTime()]);
  useEffect(() => { void loadLookups(); }, [clinic?.id]);

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(STATUS_LABEL[status]);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Qabulni o‘chirasizmi?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const shift = (n: number) => { const d = new Date(day); d.setDate(d.getDate() + n); setDay(d); };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Qabullar"
        description="Kunlik qabullar jadvali."
        actions={
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Yangi qabul
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <button onClick={() => shift(-1)} className="btn-ghost h-9 px-2"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setDay(new Date())} className="btn-ghost h-9">Bugun</button>
          <button onClick={() => shift(1)} className="btn-ghost h-9 px-2"><ChevronRight className="h-4 w-4" /></button>
          <input
            type="date"
            className="input ml-2 h-9 w-auto py-1"
            value={`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`}
            onChange={(e) => setDay(new Date(e.target.value))}
          />
          <span className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" /> {rows?.length ?? 0} qabul
          </span>
        </div>

        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="Qabullar yo‘q" description="Bu kun uchun qabul belgilanmagan." />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted/30">
                <div className="w-16 text-center">
                  <div className="text-lg font-semibold">{fmtTime(a.starts_at)}</div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="font-medium">{a.patients?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.patients?.phone} • {a.service_type || "Konsultatsiya"} • {a.doctors?.full_name ?? "Shifokor belgilanmagan"}
                  </div>
                </div>
                <select
                  value={a.status}
                  onChange={(e) => setStatus(a.id, e.target.value as Status)}
                  className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${STATUS_COLOR[a.status]}`}
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(a)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(a.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(creating || editing) && (
        <ApptForm
          appt={editing}
          patients={patients}
          doctors={doctors}
          clinicId={clinic!.id}
          defaultDay={day}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function ApptForm({ appt, patients, doctors, clinicId, defaultDay, onClose, onSaved }: {
  appt: Appt | null;
  patients: LookupPatient[];
  doctors: LookupDoctor[];
  clinicId: string;
  defaultDay: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initStart = appt ? new Date(appt.starts_at) : (() => { const d = new Date(defaultDay); d.setHours(10, 0, 0, 0); return d; })();
  const [form, setForm] = useState({
    patient_id: appt?.patient_id ?? "",
    doctor_id: appt?.doctor_id ?? "",
    service_type: appt?.service_type ?? "",
    starts_at: toLocalInput(initStart),
    notes: appt?.notes ?? "",
    status: (appt?.status ?? "waiting") as Status,
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) return toast.error("Bemorni tanlang");
    if (!form.starts_at) return toast.error("Vaqtni tanlang");
    setSaving(true);
    const payload = {
      patient_id: form.patient_id,
      doctor_id: form.doctor_id || null,
      service_type: form.service_type || null,
      starts_at: new Date(form.starts_at).toISOString(),
      notes: form.notes || null,
      status: form.status,
      clinic_id: clinicId,
    };
    const { error } = appt
      ? await supabase.from("appointments").update(payload).eq("id", appt.id)
      : await supabase.from("appointments").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(appt ? "Yangilandi" : "Qabul qo‘shildi");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={appt ? "Qabulni tahrirlash" : "Yangi qabul"}>
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Bemor *</span>
          <select className="input" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
            <option value="">— Tanlang —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} • {p.phone}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Shifokor</span>
          <select className="input" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
            <option value="">—</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Xizmat turi</span>
          <input className="input" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} placeholder="Plomba, tozalash, …" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Vaqt *</span>
          <input type="datetime-local" className="input" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Holat</span>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Izoh</span>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}

// keep fmtDateTime referenced for tree-shake friendliness
void fmtDateTime;
