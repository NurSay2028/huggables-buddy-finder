import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadAppImage } from "@/lib/image-upload";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { Loader2, Plus, Pencil, Trash2, Upload, UserCog, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/doctors")({
  component: DoctorsPage,
});

type Doctor = {
  id: string;
  full_name: string;
  specialty: string | null;
  phone: string | null;
  photo_url: string | null;
  salary_percentage: number;
  active: boolean;
};

function DoctorsPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Doctor[] | null>(null);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("doctors")
      .select("id,full_name,specialty,phone,photo_url,salary_percentage,active")
      .eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows(data as Doctor[]);
  };

  useEffect(() => { void load(); }, [clinic?.id]);

  const remove = async (id: string) => {
    if (!confirm("Shifokorni o‘chirasizmi?")) return;
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O‘chirildi");
    void load();
  };

  const toggle = async (d: Doctor) => {
    const { error } = await supabase.from("doctors").update({ active: !d.active }).eq("id", d.id);
    if (error) return toast.error(error.message);
    void load();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Shifokorlar"
        description="Klinika shifokorlari va ularning maosh foizi."
        actions={
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Yangi shifokor
          </button>
        }
      />

      {!rows ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Shifokorlar yo‘q"
            description="Birinchi shifokorni qo‘shing."
            action={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> Qo‘shish</button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-primary-soft text-primary">
                    {d.photo_url ? (
                      <img src={d.photo_url} alt={d.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <UserCog className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{d.full_name}</div>
                    <div className="text-xs text-muted-foreground">{d.specialty || "Tish shifokori"}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggle(d)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${d.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {d.active ? "Faol" : "Nofaol"}
                </button>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <div>📞 {d.phone || "—"}</div>
                <div>💰 Maosh: {d.salary_percentage}%</div>
              </div>
              <div className="mt-4 flex justify-end gap-1">
                <button onClick={() => setEditing(d)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(d.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <DoctorForm
          doctor={editing}
          clinicId={clinic!.id}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function DoctorForm({ doctor, clinicId, onClose, onSaved }: {
  doctor: Doctor | null; clinicId: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    full_name: doctor?.full_name ?? "",
    specialty: doctor?.specialty ?? "",
    phone: doctor?.phone ?? "",
    photo_url: doctor?.photo_url ?? "",
    salary_percentage: doctor?.salary_percentage ?? 30,
    active: doctor?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Ism majburiy");
    setSaving(true);
    const payload = { ...form, specialty: form.specialty || null, phone: form.phone || null, clinic_id: clinicId };
    const { error } = doctor
      ? await supabase.from("doctors").update(payload).eq("id", doctor.id)
      : await supabase.from("doctors").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(doctor ? "Yangilandi" : "Qo‘shildi");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={doctor ? "Shifokorni tahrirlash" : "Yangi shifokor"}>
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">To‘liq ism *</span>
          <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Mutaxassislik</span>
          <input className="input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Terapevt, Ortoped, …" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</span>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Maosh foizi (%)</span>
          <input type="number" min={0} max={100} className="input" value={form.salary_percentage} onChange={(e) => setForm({ ...form, salary_percentage: Number(e.target.value) })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Faol
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}
