import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDate, fmtSum } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dental-chart")({
  component: ChartPage,
});

type Procedure = "healthy" | "filling" | "root_canal" | "crown" | "implant" | "extraction" | "whitening" | "braces";
const PROC_LABEL: { [K in Procedure]: string } = {
  healthy: "Sog‘lom", filling: "Plomba", root_canal: "Kanal", crown: "Koronka",
  implant: "Implant", extraction: "Olib tashlash", whitening: "Oqartirish", braces: "Breket",
};
const PROC_COLOR: { [K in Procedure]: string } = {
  healthy: "bg-success/30", filling: "bg-primary/40", root_canal: "bg-warning/40",
  crown: "bg-chart-3/40", implant: "bg-chart-5/40", extraction: "bg-destructive/40",
  whitening: "bg-accent", braces: "bg-chart-4/40",
};

// FDI-like layout (4 quadrants × 8 teeth)
const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

type DentalRec = {
  id: string;
  tooth_number: number;
  procedure: Procedure;
  notes: string | null;
  cost: number;
  created_at: string;
  doctors: { full_name: string } | null;
};

function ChartPage() {
  const { clinic } = useAuth();
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState<DentalRec[]>([]);
  const [tooth, setTooth] = useState<number | null>(null);

  useEffect(() => {
    if (!clinic) return;
    supabase.from("patients").select("id,full_name").eq("clinic_id", clinic.id).order("full_name")
      .then(({ data }) => setPatients((data ?? []) as { id: string; full_name: string }[]));
    supabase.from("doctors").select("id,full_name").eq("clinic_id", clinic.id).eq("active", true).order("full_name")
      .then(({ data }) => setDoctors((data ?? []) as { id: string; full_name: string }[]));
  }, [clinic?.id]);

  const loadRecords = async () => {
    if (!patientId) { setRecords([]); return; }
    const { data, error } = await supabase
      .from("dental_records")
      .select("*, doctors(full_name)")
      .eq("patient_id", patientId).order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRecords((data ?? []) as DentalRec[]);
  };
  useEffect(() => { void loadRecords(); }, [patientId]);

  const latestByTooth = new Map<number, Procedure>();
  records.forEach((r) => { if (!latestByTooth.has(r.tooth_number)) latestByTooth.set(r.tooth_number, r.procedure); });

  const remove = async (id: string) => {
    if (!confirm("Yozuvni o‘chirasizmi?")) return;
    await supabase.from("dental_records").delete().eq("id", id);
    void loadRecords();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Tish kartasi" description="Bemorni tanlang va tishni bosing." />

      <div className="card mb-6 p-4">
        <select className="input max-w-md" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          <option value="">— Bemorni tanlang —</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      {!patientId ? (
        <div className="card"><EmptyState title="Bemor tanlanmagan" description="Tish kartasini ko‘rish uchun yuqoridan bemorni tanlang." /></div>
      ) : (
        <>
          <div className="card mb-6 p-6">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Yuqori jag‘</div>
            <div className="grid grid-flow-col auto-cols-fr gap-1">
              {UPPER.map((n) => <ToothBtn key={n} num={n} proc={latestByTooth.get(n)} onClick={() => setTooth(n)} />)}
            </div>
            <div className="mt-6 mb-3 text-xs uppercase tracking-wider text-muted-foreground">Pastki jag‘</div>
            <div className="grid grid-flow-col auto-cols-fr gap-1">
              {LOWER.map((n) => <ToothBtn key={n} num={n} proc={latestByTooth.get(n)} onClick={() => setTooth(n)} />)}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              {(Object.keys(PROC_LABEL) as Procedure[]).map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  <span className={`inline-block h-3 w-3 rounded ${PROC_COLOR[p]}`} /> {PROC_LABEL[p]}
                </span>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border p-4 text-sm font-medium">Tarix ({records.length})</div>
            {records.length === 0 ? (
              <EmptyState title="Yozuvlar yo‘q" description="Tishni bosib yangi protsedura qo‘shing." />
            ) : (
              <div className="divide-y divide-border">
                {records.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-sm font-semibold">{r.tooth_number}</div>
                    <div className="flex-1">
                      <div className="font-medium">{PROC_LABEL[r.procedure]}</div>
                      <div className="text-xs text-muted-foreground">{r.doctors?.full_name ?? "—"} • {fmtDate(r.created_at)}</div>
                      {r.notes && <div className="mt-1 text-xs text-muted-foreground">{r.notes}</div>}
                    </div>
                    <div className="font-medium">{fmtSum(r.cost)}</div>
                    <button onClick={() => remove(r.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tooth !== null && (
        <ProcForm
          tooth={tooth}
          patientId={patientId}
          clinicId={clinic!.id}
          doctors={doctors}
          onClose={() => setTooth(null)}
          onSaved={() => { setTooth(null); void loadRecords(); }}
        />
      )}
    </div>
  );
}

function ToothBtn({ num, proc, onClick }: { num: number; proc?: Procedure; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`aspect-[3/4] rounded-md border border-border text-[10px] font-medium transition hover:scale-105 ${proc ? PROC_COLOR[proc] : "bg-card"}`}
      title={proc ? PROC_LABEL[proc] : "Sog‘lom"}
    >
      {num}
    </button>
  );
}

function ProcForm({ tooth, patientId, clinicId, doctors, onClose, onSaved }: {
  tooth: number; patientId: string; clinicId: string;
  doctors: { id: string; full_name: string }[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    procedure: "filling" as Procedure,
    doctor_id: "",
    cost: 0,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("dental_records").insert({
      tooth_number: tooth,
      patient_id: patientId,
      clinic_id: clinicId,
      procedure: form.procedure,
      doctor_id: form.doctor_id || null,
      cost: form.cost,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Yozuv qo‘shildi");
    onSaved();
  };
  return (
    <Modal open onClose={onClose} title={`Tish ${tooth} — yangi protsedura`}>
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Protsedura</span>
          <select className="input" value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value as Procedure })}>
            {(Object.keys(PROC_LABEL) as Procedure[]).map((p) => <option key={p} value={p}>{PROC_LABEL[p]}</option>)}
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
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Narx (so‘m)</span>
          <input type="number" min={0} className="input" value={form.cost || ""} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Izoh</span>
          <textarea rows={2} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}
