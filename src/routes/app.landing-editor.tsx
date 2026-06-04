import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";
import { uploadAppImage } from "@/lib/image-upload";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import {
  mergeContent,
  type LandingContent,
} from "@/lib/landing-content";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/landing-editor")({
  component: LandingEditorPage,
});

// image fields that must be reset to "" if not an uploaded URL (so defaults win)
const IMAGE_PATHS: [keyof LandingContent, string][] = [
  ["hero", "image1"],
  ["hero", "image2"],
  ["hero", "image3"],
  ["about", "image"],
  ["doctor", "image"],
  ["faq", "image"],
];

function sanitizeForSave(content: LandingContent): LandingContent {
  const clone = JSON.parse(JSON.stringify(content)) as LandingContent;
  for (const [section, field] of IMAGE_PATHS) {
    const sec = clone[section] as Record<string, unknown>;
    const v = sec[field];
    if (typeof v !== "string" || !v.startsWith("http")) sec[field] = "";
  }
  // doctor list images: keep only uploaded (http) urls so defaults can win
  for (const d of clone.doctor.list) {
    if (typeof d.image !== "string" || !d.image.startsWith("http")) d.image = "";
  }
  return clone;
}


function LandingEditorPage() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("landing_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      setContent(mergeContent(data?.content));
    })();
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase.from("landing_content").upsert({
      id: 1,
      content: sanitizeForSave(content) as unknown as Record<string, never>,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saqlandi! Landing sahifa yangilandi.");
  };

  if (!content) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // generic setter for a section field
  function setField<K extends keyof LandingContent>(
    section: K,
    field: keyof LandingContent[K],
    value: unknown,
  ) {
    setContent((prev) =>
      prev
        ? { ...prev, [section]: { ...prev[section], [field]: value } }
        : prev,
    );
  }

  const c = content;

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24 sm:p-6">
      <PageHeader
        title="Landing sahifa tahriri"
        description="Bosh sahifadagi barcha matn va rasmlarni shu yerdan o‘zgartiring"
        actions={
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Saqlash
          </button>
        }
      />

      <div className="space-y-5">
        {/* BRAND + CONTACT */}
        <Section title="Brend va aloqa">
          <Text label="Klinika nomi" value={c.brand.name} onChange={(v) => setField("brand", "name", v)} />
          <Text label="Logotip matni (qisqa)" value={c.brand.logo_text} onChange={(v) => setField("brand", "logo_text", v)} />
          <Text label="Telefon (link uchun, masalan +998913808667)" value={c.contact.phone} onChange={(v) => setField("contact", "phone", v)} />
          <Text label="Telefon (ko‘rinish)" value={c.contact.phone_display} onChange={(v) => setField("contact", "phone_display", v)} />
          <Text label="Telegram havola" value={c.contact.telegram_url} onChange={(v) => setField("contact", "telegram_url", v)} />
          <Text label="Instagram havola" value={c.contact.instagram_url} onChange={(v) => setField("contact", "instagram_url", v)} />
          <Text label="Email" value={c.contact.email} onChange={(v) => setField("contact", "email", v)} />
          <Text label="Manzil" value={c.contact.address} onChange={(v) => setField("contact", "address", v)} />
        </Section>

        {/* HERO */}
        <Section title="Hero (yuqori bo‘lim)">
          <Text label="Belgi (badge)" value={c.hero.badge} onChange={(v) => setField("hero", "badge", v)} />
          <Text label="Sarlavha — 1-qism" value={c.hero.title_line1} onChange={(v) => setField("hero", "title_line1", v)} />
          <Text label="Sarlavha — ajratilgan so‘z" value={c.hero.title_highlight} onChange={(v) => setField("hero", "title_highlight", v)} />
          <Text label="Sarlavha — 2-qism" value={c.hero.title_line2} onChange={(v) => setField("hero", "title_line2", v)} />
          <Area label="Tavsif" value={c.hero.subtitle} onChange={(v) => setField("hero", "subtitle", v)} />
          <Text label="Asosiy tugma" value={c.hero.cta_primary} onChange={(v) => setField("hero", "cta_primary", v)} />
          <Text label="Ikkinchi tugma" value={c.hero.cta_secondary} onChange={(v) => setField("hero", "cta_secondary", v)} />
          <Text label="Statistika qiymati" value={c.hero.stat_value} onChange={(v) => setField("hero", "stat_value", v)} />
          <Text label="Statistika izohi" value={c.hero.stat_label} onChange={(v) => setField("hero", "stat_label", v)} />
          <Img label="1-rasm" value={c.hero.image1} onChange={(v) => setField("hero", "image1", v)} />
          <Img label="2-rasm" value={c.hero.image2} onChange={(v) => setField("hero", "image2", v)} />
          <Img label="3-rasm" value={c.hero.image3} onChange={(v) => setField("hero", "image3", v)} />
        </Section>

        {/* SERVICES */}
        <Section title="Xizmatlar">
          <Text label="Sarlavha" value={c.services.title} onChange={(v) => setField("services", "title", v)} />
          <Area label="Tavsif" value={c.services.subtitle} onChange={(v) => setField("services", "subtitle", v)} />
          <ListEditor
            items={c.services.items}
            onChange={(items) => setField("services", "items", items)}
            empty={{ title: "", desc: "" }}
            addLabel="Xizmat qo'shish"
            render={(item, update) => (
              <>
                <Text label="Nomi" value={item.title} onChange={(v) => update({ ...item, title: v })} />
                <Area label="Tavsif" value={item.desc} onChange={(v) => update({ ...item, desc: v })} />
              </>
            )}
          />
        </Section>

        {/* ABOUT */}
        <Section title="Biz haqimizda">
          <Text label="Sarlavha" value={c.about.title} onChange={(v) => setField("about", "title", v)} />
          <Text label="Ajratilgan so‘z" value={c.about.title_highlight} onChange={(v) => setField("about", "title_highlight", v)} />
          <Area label="Matn" value={c.about.text} onChange={(v) => setField("about", "text", v)} />
          <Text label="Tugma matni" value={c.about.cta} onChange={(v) => setField("about", "cta", v)} />
          <Img label="Rasm" value={c.about.image} onChange={(v) => setField("about", "image", v)} />
          <ListEditor
            items={c.about.stats}
            onChange={(items) => setField("about", "stats", items)}
            empty={{ value: "", label: "" }}
            addLabel="Statistika qo'shish"
            render={(item, update) => (
              <>
                <Text label="Qiymat" value={item.value} onChange={(v) => update({ ...item, value: v })} />
                <Text label="Izoh" value={item.label} onChange={(v) => update({ ...item, label: v })} />
              </>
            )}
          />
        </Section>

        {/* DOCTOR */}
        <Section title="Shifokorlar">
          <Text label="Bo‘lim sarlavhasi" value={c.doctor.section_title} onChange={(v) => setField("doctor", "section_title", v)} />
          <Text label="Bo‘lim tavsifi" value={c.doctor.section_subtitle} onChange={(v) => setField("doctor", "section_subtitle", v)} />
          <ListEditor
            items={c.doctor.list}
            onChange={(items) => setField("doctor", "list", items)}
            empty={{ name: "", badge: "", bio: "", hours: "", location: "", image: "", cta: "" }}
            addLabel="Shifokor qo'shish"
            render={(item, update) => (
              <>
                <Text label="Ism" value={item.name} onChange={(v) => update({ ...item, name: v })} />
                <Text label="Belgi (badge)" value={item.badge} onChange={(v) => update({ ...item, badge: v })} />
                <Area label="Bio" value={item.bio} onChange={(v) => update({ ...item, bio: v })} />
                <Text label="Ish vaqti" value={item.hours} onChange={(v) => update({ ...item, hours: v })} />
                <Text label="Manzil" value={item.location} onChange={(v) => update({ ...item, location: v })} />
                <Text label="Tugma matni" value={item.cta} onChange={(v) => update({ ...item, cta: v })} />
                <Img label="Rasm" value={item.image} onChange={(v) => update({ ...item, image: v })} crop={false} />
              </>
            )}
          />
        </Section>


        {/* TESTIMONIALS */}
        <Section title="Sharhlar">
          <Text label="Sarlavha" value={c.testimonials.title} onChange={(v) => setField("testimonials", "title", v)} />
          <Area label="Tavsif" value={c.testimonials.subtitle} onChange={(v) => setField("testimonials", "subtitle", v)} />
          <Text label="Reyting" value={c.testimonials.rating} onChange={(v) => setField("testimonials", "rating", v)} />
          <Text label="Reyting izohi" value={c.testimonials.rating_label} onChange={(v) => setField("testimonials", "rating_label", v)} />
          <ListEditor
            items={c.testimonials.items}
            onChange={(items) => setField("testimonials", "items", items)}
            empty={{ name: "", text: "" }}
            addLabel="Sharh qo'shish"
            render={(item, update) => (
              <>
                <Text label="Ism" value={item.name} onChange={(v) => update({ ...item, name: v })} />
                <Area label="Sharh" value={item.text} onChange={(v) => update({ ...item, text: v })} />
              </>
            )}
          />
        </Section>

        {/* FAQ */}
        <Section title="Savol-javob">
          <Text label="Sarlavha" value={c.faq.title} onChange={(v) => setField("faq", "title", v)} />
          <Area label="Tavsif" value={c.faq.subtitle} onChange={(v) => setField("faq", "subtitle", v)} />
          <Img label="Rasm" value={c.faq.image} onChange={(v) => setField("faq", "image", v)} />
          <ListEditor
            items={c.faq.items}
            onChange={(items) => setField("faq", "items", items)}
            empty={{ q: "", a: "" }}
            addLabel="Savol qo'shish"
            render={(item, update) => (
              <>
                <Text label="Savol" value={item.q} onChange={(v) => update({ ...item, q: v })} />
                <Area label="Javob" value={item.a} onChange={(v) => update({ ...item, a: v })} />
              </>
            )}
          />
        </Section>

        {/* EMERGENCY */}
        <Section title="Shoshilinch chaqiruv">
          <Text label="Sarlavha" value={c.emergency.title} onChange={(v) => setField("emergency", "title", v)} />
          <Area label="Matn" value={c.emergency.text} onChange={(v) => setField("emergency", "text", v)} />
          <Text label="Tugma matni" value={c.emergency.cta} onChange={(v) => setField("emergency", "cta", v)} />
        </Section>

        {/* FOOTER */}
        <Section title="Pastki qism (footer)">
          <Area label="Klinika haqida qisqa" value={c.footer.about} onChange={(v) => setField("footer", "about", v)} />
          <Text label="Mualliflik (copyright)" value={c.footer.copyright} onChange={(v) => setField("footer", "copyright", v)} />
        </Section>
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary shadow-elegant">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Saqlash
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <textarea
        className="input min-h-[88px] resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Img({
  label,
  value,
  onChange,
  aspect = 4 / 3,
  crop = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect?: number;
  /** When false, the image is uploaded exactly as-is (no cropping). */
  crop?: boolean;
}) {
  const { clinic } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const pick = () => inputRef.current?.click();

  const uploadFile = async (file: File) => {
    if (!clinic) return;
    setUploading(true);
    try {
      const url = await uploadAppImage(file, clinic.id, { bucket: "landing", folder: "landing" });
      onChange(url);
      toast.success("Rasm yuklandi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Rasm hajmi 50MB dan oshmasin");
      return;
    }
    if (!clinic) {
      toast.error("Klinika topilmadi. Qayta kirib ko‘ring.");
      return;
    }
    if (crop) {
      setCropFile(file);
    } else {
      void uploadFile(file);
    }
  };

  const onCropped = async (file: File) => {
    setCropFile(null);
    if (!clinic) return;
    setUploading(true);
    try {
      const url = await uploadAppImage(file, clinic.id, { bucket: "landing", folder: "landing" });
      onChange(url);
      toast.success("Rasm yuklandi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={pick} disabled={uploading} className="btn-secondary">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Qurilmadan yuklash
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-medium text-destructive hover:underline"
            >
              Standart rasmga qaytarish
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </div>
      <ImageCropDialog
        file={cropFile}
        aspect={aspect}
        onCancel={() => setCropFile(null)}
        onCropped={onCropped}
      />
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  addLabel: string;
  render: (item: T, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="grid h-7 w-7 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
              aria-label="O'chirish"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {render(item, (next) =>
              onChange(items.map((it, idx) => (idx === i ? next : it))),
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, JSON.parse(JSON.stringify(empty))])}
        className="btn-secondary w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
