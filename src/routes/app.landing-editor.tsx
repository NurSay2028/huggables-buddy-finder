import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/landing-editor")({
  component: LandingEditorPage,
});

type Content = {
  hero_title: string;
  hero_subtitle: string;
  phone: string;
  about_text: string;
  doctor_name: string;
  doctor_bio: string;
  hero_image_url: string;
  doctor_image_url: string;
};

const DEFAULTS: Content = {
  hero_title: "Ishonchli stomatologiya sog'lom tabassum uchun",
  hero_subtitle:
    "Nukus shahridagi zamonaviy stomatologiya. Davolash, breket va protezlash bo'yicha malakali yordam — kuniga 24/7.",
  phone: "+998913808667",
  about_text: "",
  doctor_name: "",
  doctor_bio: "",
  hero_image_url: "",
  doctor_image_url: "",
};

function LandingEditorPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("landing_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      const stored = (data?.content ?? {}) as Partial<Content>;
      setContent({ ...DEFAULTS, ...stored });
    })();
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase
      .from("landing_content")
      .upsert({ id: 1, content, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saqlandi");
  };

  if (!content) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const set = (k: keyof Content, v: string) => setContent({ ...content, [k]: v });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageHeader
        title="Landing sahifa tahriri"
        description="Bosh sahifadagi matn va rasmlarni shu yerdan o‘zgartiring"
        actions={
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Saqlash
          </button>
        }
      />

      <div className="space-y-5">
        <Section title="Hero bo‘limi">
          <Text label="Sarlavha" value={content.hero_title} onChange={(v) => set("hero_title", v)} />
          <Area label="Tavsif" value={content.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} />
          <Text label="Hero rasm URL" value={content.hero_image_url} onChange={(v) => set("hero_image_url", v)} />
        </Section>

        <Section title="Aloqa">
          <Text label="Telefon raqam" value={content.phone} onChange={(v) => set("phone", v)} />
        </Section>

        <Section title="Biz haqimizda">
          <Area label="Matn" value={content.about_text} onChange={(v) => set("about_text", v)} />
        </Section>

        <Section title="Shifokor">
          <Text label="Ism" value={content.doctor_name} onChange={(v) => set("doctor_name", v)} />
          <Area label="Tavsif" value={content.doctor_bio} onChange={(v) => set("doctor_bio", v)} />
          <Text label="Shifokor rasm URL" value={content.doctor_image_url} onChange={(v) => set("doctor_image_url", v)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
