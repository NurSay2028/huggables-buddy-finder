import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { Trash2, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { inviteStaff } from "@/lib/staff.functions";

export const Route = createFileRoute("/app/staff")({
  component: StaffPage,
});

const ROLE_LABEL: Record<string, string> = {
  owner: "Egasi", admin: "Admin", doctor: "Shifokor",
  reception: "Registratura", warehouse: "Omborchi", accountant: "Hisobchi",
};
const INVITABLE = ["admin", "doctor", "reception", "warehouse", "accountant"] as const;

type Member = {
  id: string;
  user_id: string;
  role: string;
  profile: { full_name: string | null; phone: string | null } | null;
};

function StaffPage() {
  const { clinic, roles } = useAuth();
  const isOwner = roles.includes("owner");
  const [rows, setRows] = useState<Member[] | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!clinic) return;
    const { data: ur, error } = await supabase
      .from("user_roles")
      .select("id,user_id,role")
      .eq("clinic_id", clinic.id);
    if (error) return toast.error(error.message);
    const ids = (ur ?? []).map((r) => r.user_id);
    const profilesMap = new Map<string, { full_name: string | null; phone: string | null }>();
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles").select("id,full_name,phone").in("id", ids);
      (profs ?? []).forEach((p: any) => profilesMap.set(p.id, { full_name: p.full_name, phone: p.phone }));
    }
    setRows((ur ?? []).map((r) => ({
      id: r.id, user_id: r.user_id, role: r.role,
      profile: profilesMap.get(r.user_id) ?? null,
    })));
  };

  useEffect(() => { void load(); }, [clinic?.id]);

  const remove = async (id: string) => {
    if (!confirm("Xodimni klinikadan o‘chirasizmi?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Xodimlar"
        description="Klinikaga biriktirilgan foydalanuvchilar."
        actions={isOwner ? (
          <button onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Xodim qo‘shish
          </button>
        ) : undefined}
      />

      <div className="card overflow-hidden">
        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="Xodimlar yo‘q" description="Hozircha faqat siz xodimsiz." />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{m.profile?.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{m.profile?.phone || "—"}</div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{ROLE_LABEL[m.role] || m.role}</span>
                {isOwner && m.role !== "owner" && (
                  <button onClick={() => remove(m.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && <InviteModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); void load(); }} />}
    </div>
  );
}

function InviteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const invite = useServerFn(inviteStaff);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", role: "reception" as typeof INVITABLE[number],
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await invite({ data: { ...form, phone: form.phone || null } });
      toast.success("Xodim qo‘shildi");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Yangi xodim">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">F.I.Sh</span>
          <input required className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
          <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</span>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Parol (kamida 8 belgi)</span>
          <input required minLength={8} type="text" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Lavozim</span>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
            {INVITABLE.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Qo‘shish"}</button>
        </div>
      </form>
    </Modal>
  );
}
