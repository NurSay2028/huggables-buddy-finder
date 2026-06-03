import { createFileRoute } from "@tanstack/react-router";

const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(fromName)) return fromName;
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/avif") return "avif";
  return "jpg";
}

export const Route = createFileRoute("/api/landing-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) return json({ error: "Avval tizimga kiring" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        const userId = userData.user?.id;

        if (userError || !userId) return json({ error: "Sessiya muddati tugagan. Qayta kiring." }, 401);

        const form = await request.formData();
        const file = form.get("file");
        const clinicId = String(form.get("clinicId") ?? "");

        if (!(file instanceof File)) return json({ error: "Rasm fayli topilmadi" }, 400);
        if (!clinicId) return json({ error: "Klinika topilmadi" }, 400);
        if (!file.type.startsWith("image/")) return json({ error: "Faqat rasm fayllari yuklanadi" }, 400);
        if (file.size > MAX_IMAGE_BYTES) return json({ error: "Rasm hajmi 30MB dan oshmasin" }, 400);

        const { data: roleRows, error: roleError } = await supabaseAdmin
          .from("user_roles")
          .select("role, clinic_id")
          .eq("user_id", userId);

        if (roleError) return json({ error: roleError.message }, 500);

        const canUpload = (roleRows ?? []).some(
          (row) => row.role === "super_admin" || row.clinic_id === clinicId,
        );

        if (!canUpload) return json({ error: "Bu klinika uchun rasm yuklashga ruxsat yo‘q" }, 403);

        const ext = getExtension(file.name, file.type);
        const path = `${clinicId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const bytes = await file.arrayBuffer();

        const { error: uploadError } = await supabaseAdmin.storage
          .from("landing")
          .upload(path, bytes, { contentType: file.type, upsert: false });

        if (uploadError) return json({ error: uploadError.message }, 500);

        const publicUrl = supabaseAdmin.storage.from("landing").getPublicUrl(path).data.publicUrl;
        return json({ url: publicUrl });
      },
    },
  },
});