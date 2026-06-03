import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDate, fmtSum } from "@/lib/format";
import { exportToExcel } from "@/lib/excel-export";
import { Plus, Pencil, Trash2, Search, Phone, BellRing, FileDown } from "lucide-react";
import { toast } from "sonner";
import { TREATMENT_LABEL, REMINDER_STATUS_LABEL, REMINDER_DAYS_OPTIONS, type TreatmentType, type ReminderStatus } from "@/lib/reminders";

export const Route = createFileRoute("/app/patients")({
  component: PatientsPage,
});

type Patient = {
  id: string;
  full_name: string;
  phone: string;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  notes: string | null;
  debt: number;
  last_visit_at: string | null;
  created_at: string;
  treatment_type: TreatmentType | null;
  next_visit_date: string | null;
  reminder_enabled: boolean;
  reminder_note: string | null;
  reminder_status: ReminderStatus;
  reminder_days_before: number;
};

function PatientsPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Patient[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Patient | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows(data as Patient[]);
  };

  useEffect(() => {
    void load();
  }, [clinic?.id]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) => `${r.full_name} ${r.phone} ${r.address ?? ""}`.toLowerCase().includes(s));
  }, [rows, q]);

  const remove = async (id: string) => {
    if (!confirm("Bemorni o‘chirishni tasdiqlaysizmi?")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Bemor o‘chirildi");
    void load();
  };

  const exportExcel = () => {
    if (!filtered.length) return toast.error("Eksport uchun bemor yo‘q");
    exportToExcel(
      filtered.map((p) => ({
        "Ism": p.full_name,
        "Telefon": p.phone,
        "Tug‘ilgan sana": fmtDate(p.birth_date),
        "Jinsi": p.gender === "male" ? "Erkak" : p.gender === "female" ? "Ayol" : "—",
        "Manzil": p.address ?? "—",
        "Allergiya": p.allergies ?? "—",
        "Surunkali kasallik": p.medical_conditions ?? "—",
        "Davolash turi": p.treatment_type ? TREATMENT_LABEL[p.treatment_type] : "—",
        "Keyingi tashrif": fmtDate(p.next_visit_date),
        "Eslatma holati": REMINDER_STATUS_LABEL[p.reminder_status],
        "Qarz (so‘m)": Number(p.debt) || 0,
        "Oxirgi tashrif": fmtDate(p.last_visit_at),
        "Qo‘shilgan": fmtDate(p.created_at),
        "Izoh": p.notes ?? "—",
      })),
      "bemorlar",
      "Bemorlar",
    );
    toast.success("Excel yuklab olindi");
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Bemorlar"
        description="Bemor profillari, qidiruv va boshqaruv."
        actions={
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Yangi bemor
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-10"
              placeholder="Ism, telefon, manzil bo‘yicha qidirish…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} bemor</span>
        </div>

        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Bemor yo‘q"
            description="Birinchi bemorni qo‘shing."
            action={
              <button onClick={() => setCreating(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> Yangi bemor
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ism</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Tug‘ilgan</th>
                  <th className="px-4 py-3">Oxirgi tashrif</th>
                  <th className="px-4 py-3 text-right">Qarz</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" /> {p.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.birth_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.last_visit_at)}</td>
                    <td className={`px-4 py-3 text-right ${Number(p.debt) > 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {fmtSum(p.debt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                          title="O‘chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <PatientForm
          patient={editing}
          clinicId={clinic!.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function PatientForm({
  patient,
  clinicId,
  onClose,
  onSaved,
}: {
  patient: Patient | null;
  clinicId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    full_name: patient?.full_name ?? "",
    phone: patient?.phone ?? "",
    birth_date: patient?.birth_date ?? "",
    gender: patient?.gender ?? "",
    address: patient?.address ?? "",
    allergies: patient?.allergies ?? "",
    medical_conditions: patient?.medical_conditions ?? "",
    notes: patient?.notes ?? "",
    debt: patient?.debt ?? 0,
    treatment_type: (patient?.treatment_type ?? "") as TreatmentType | "",
    next_visit_date: patient?.next_visit_date ?? "",
    reminder_enabled: patient?.reminder_enabled ?? false,
    reminder_note: patient?.reminder_note ?? "",
    reminder_days_before: patient?.reminder_days_before ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      return toast.error("Ism va telefon majburiy");
    }
    setSaving(true);
    const payload = {
      ...form,
      birth_date: form.birth_date || null,
      gender: form.gender || null,
      address: form.address || null,
      allergies: form.allergies || null,
      medical_conditions: form.medical_conditions || null,
      notes: form.notes || null,
      debt: Number(form.debt) || 0,
      treatment_type: form.treatment_type || null,
      next_visit_date: form.next_visit_date || null,
      reminder_note: form.reminder_note || null,
      reminder_days_before: Number(form.reminder_days_before) || 0,
      clinic_id: clinicId,
    };
    const { error } = patient
      ? await supabase.from("patients").update(payload).eq("id", patient.id)
      : await supabase.from("patients").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(patient ? "Yangilandi" : "Qo‘shildi");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={patient ? "Bemorni tahrirlash" : "Yangi bemor"} size="lg">
      <form onSubmit={save} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="To‘liq ism *">
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </Field>
          <Field label="Telefon *">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+998 90 123 45 67" />
          </Field>
          <Field label="Tug‘ilgan sana">
            <input type="date" className="input" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          </Field>
          <Field label="Jinsi">
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">—</option>
              <option value="male">Erkak</option>
              <option value="female">Ayol</option>
            </select>
          </Field>
          <Field label="Manzil" className="sm:col-span-2">
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Allergiya">
            <input className="input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          </Field>
          <Field label="Surunkali kasallik">
            <input className="input" value={form.medical_conditions} onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })} />
          </Field>
          <Field label="Qarz (so‘m)">
            <input type="number" className="input" value={form.debt} onChange={(e) => setForm({ ...form, debt: Number(e.target.value) })} />
          </Field>
          <Field label="Izoh" className="sm:col-span-2">
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Qayta kelish nazorati</h3>
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={form.reminder_enabled}
                onChange={(e) => setForm({ ...form, reminder_enabled: e.target.checked })}
              />
              Eslatma yoqilgan
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Davolash turi">
              <select
                className="input"
                value={form.treatment_type}
                onChange={(e) => setForm({ ...form, treatment_type: e.target.value as TreatmentType | "" })}
              >
                <option value="">—</option>
                {(Object.keys(TREATMENT_LABEL) as TreatmentType[]).map((k) => (
                  <option key={k} value={k}>{TREATMENT_LABEL[k]}</option>
                ))}
              </select>
            </Field>
            <Field label="Keyingi tashrif sanasi">
              <input
                type="date"
                className="input"
                value={form.next_visit_date}
                onChange={(e) => setForm({ ...form, next_visit_date: e.target.value })}
              />
            </Field>
            <Field label="Necha kun oldin eslatish">
              <select
                className="input"
                value={form.reminder_days_before}
                onChange={(e) => setForm({ ...form, reminder_days_before: Number(e.target.value) })}
              >
                {REMINDER_DAYS_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d === 0 ? "Aynan kunida" : `${d} kun oldin`}</option>
                ))}
              </select>
            </Field>
            <Field label="Eslatma matni" className="sm:col-span-2">
              <input
                className="input"
                value={form.reminder_note}
                onChange={(e) => setForm({ ...form, reminder_note: e.target.value })}
                placeholder="Masalan: breket sozlash"
              />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saqlanmoqda…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
