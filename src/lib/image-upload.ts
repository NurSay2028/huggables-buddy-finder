import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

type UploadOptions = {
  bucket?: "landing" | "logos";
  folder?: string;
};

export async function uploadAppImage(
  file: File,
  clinicId: string,
  options: UploadOptions = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayllari yuklanadi");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Rasm hajmi 50MB dan oshmasin");

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Avval tizimga kiring");

  const form = new FormData();
  form.append("file", file);
  form.append("clinicId", clinicId);
  form.append("bucket", options.bucket ?? "landing");
  form.append("folder", options.folder ?? "images");

  let response: Response;
  try {
    response = await fetch("/api/landing-upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new Error("Internetga ulanishda xatolik. Sahifani yangilab qayta urinib ko‘ring.");
  }

  const text = await response.text();
  let payload: { url?: string; error?: string } = {};
  try {
    payload = text ? (JSON.parse(text) as { url?: string; error?: string }) : {};
  } catch {
    // server returned non-JSON (e.g. an error page) — surface status for clarity
    throw new Error(`Server xatosi (${response.status}). Birozdan so‘ng qayta urinib ko‘ring.`);
  }

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? `Rasm yuklashda xatolik (${response.status})`);
  }
  return payload.url;
}