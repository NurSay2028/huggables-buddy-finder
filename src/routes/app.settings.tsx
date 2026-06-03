import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadAppImage } from "@/lib/image-upload";
import { PageHeader } from "@/components/page-header";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { clinic, refresh } = useAuth();
  const [form, setForm] = useState({
    name: "", phone: "", city: "", logo_url: "",
    work_start: "09:00", work_end: "19:00",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    if (!clinic) return;
    supabase.from("clinics").select("name,phone,city,logo_url,working_hours").eq("id", clinic.id).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const wh = (data.working_hours ?? {}) as { start?: string; end?: string };
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          logo_url: data.logo_url ?? "",
          work_start: wh.start ?? "09:00",
          work_end: wh.end ?? "19:00",
        });
      });
  }, [clinic?.id]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !clinic) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllarini yuklang");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Rasm 50MB dan katta bo‘lmasligi kerak");
      return;
    }
    setCropFile(file);
  };

  const onCropped = async (file: File) => {
    setCropFile(null);
    if (!clinic) return;
    setUploading(true);
    try {
      const url = await uploadAppImage(file, clinic.id, { bucket: "logos", folder: "logos" });
      setForm((f) => ({ ...f, logo_url: url }));
      toast.success("Logotip yuklandi — saqlashni unutmang");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rasm yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const clearLogo = () => setForm((f) => ({ ...f, logo_url: "" }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    setSaving(true);
    const { error } = await supabase.from("clinics").update({
      name: form.name,
      phone: form.phone,
      city: form.city,
      logo_url: form.logo_url || null,
      working_hours: { start: form.work_start, end: form.work_end },
    }).eq("id", clinic.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Sozlamalar saqlandi");
    void refresh();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Sozlamalar" description="Klinika ma’lumotlari va ish vaqti." />
      <form onSubmit={save} className="card max-w-2xl space-y-4 p-6">
        <div>
          <span className="mb-2 block text-xs font-medium text-muted-foreground">Klinika logotipi</span>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-border bg-muted">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logotip" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">Yo‘q</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-ghost"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Yuklanmoqda…" : "Qurilmadan yuklash"}
              </button>
              {form.logo_url && (
                <button type="button" onClick={clearLogo} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                  <X className="h-3 w-3" /> O‘chirish
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Klinika nomi"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></F>
          <F label="Telefon"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></F>
          <F label="Shahar"><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></F>
          <F label="Logotip URL (ixtiyoriy)"><input className="input" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" /></F>
          <F label="Ish boshlanishi"><input type="time" className="input" value={form.work_start} onChange={(e) => setForm({ ...form, work_start: e.target.value })} /></F>
          <F label="Ish tugashi"><input type="time" className="input" value={form.work_end} onChange={(e) => setForm({ ...form, work_end: e.target.value })} /></F>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div className="font-medium">Tarif rejesi</div>
          <div className="mt-1 text-muted-foreground capitalize">{clinic?.subscription_plan}</div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saqlanmoqda…" : "Saqlash"}</button>
        </div>
      </form>
      <ImageCropDialog
        file={cropFile}
        aspect={1}
        maxWidth={512}
        onCancel={() => setCropFile(null)}
        onCropped={onCropped}
      />
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
