import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const ALLOWED_BUCKETS = new Set(["landing", "logos"]);

type UploadOptions = {
  bucket?: "landing" | "logos";
  folder?: string;
};

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";
  return "jpg";
}

function safePathPart(value: string, fallback: string) {
  const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 40);
  return clean || fallback;
}

export async function uploadAppImage(
  file: File,
  clinicId: string,
  options: UploadOptions = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayllari yuklanadi");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Rasm hajmi 50MB dan oshmasin");
  if (!clinicId) throw new Error("Klinika topilmadi. Qayta kirib ko‘ring.");

  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new Error("Avval tizimga kiring");

  const bucket = options.bucket ?? "landing";
  if (!ALLOWED_BUCKETS.has(bucket)) throw new Error("Rasm saqlanadigan joy noto‘g‘ri");

  const folder = safePathPart(options.folder ?? "images", "images");
  const ext = getExtension(file);
  const path = `${clinicId}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("row-level security") || message.includes("unauthorized")) {
      throw new Error("Bu klinika uchun rasm yuklashga ruxsat yo‘q. Qayta kirib ko‘ring.");
    }
    if (message.includes("payload") || message.includes("too large") || message.includes("size")) {
      throw new Error("Rasm hajmi 50MB dan oshmasin");
    }
    throw new Error("Rasm yuklanmadi. Boshqa rasm tanlab qayta urinib ko‘ring.");
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}