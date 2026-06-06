import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { renderTemplate, DEFAULT_TEMPLATE_BODY } from "@/lib/telegram-templates";

function cronAuthorized(request: Request): boolean {
  const expected =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  if (!expected) return false;
  const got =
    request.headers.get("apikey") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const TREATMENT_LABEL: Record<string, string> = {
  braces: "Breket",
  implant: "Implant",
  cleaning: "Tozalash",
  filling: "Plomba",
  consultation: "Konsultatsiya",
  other: "Davolash",
};

async function sendReminders() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendTelegramMessage } = await import("@/lib/telegram.server");

  // Tomorrow's window
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: appts, error } = await supabaseAdmin
    .from("appointments")
    .select(
      "id, clinic_id, service_type, starts_at, status, patients(full_name, telegram_chat_id, treatment_type)",
    )
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .in("status", ["waiting", "in_treatment"]);

  if (error) return { ok: false, error: error.message, sent: 0, skipped: 0 };

  const rows = appts ?? [];
  const clinicIds = [...new Set(rows.map((a: any) => a.clinic_id))];
  const templates: Record<string, string> = {};
  if (clinicIds.length) {
    const { data: tpls } = await supabaseAdmin
      .from("reminder_templates")
      .select("clinic_id, body, is_default")
      .in("clinic_id", clinicIds)
      .eq("is_default", true);
    for (const t of (tpls ?? []) as Array<{ clinic_id: string; body: string }>) {
      templates[t.clinic_id] = t.body;
    }
  }

  let sent = 0;
  let skipped = 0;
  for (const a of rows as any[]) {
    const p = a.patients;
    if (!p?.telegram_chat_id) {
      skipped++;
      continue;
    }
    const d = new Date(a.starts_at);
    const date = new Intl.DateTimeFormat("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(d);
    const treatment =
      a.service_type || (p.treatment_type ? TREATMENT_LABEL[p.treatment_type] : "") || "qabul";
    const body = templates[a.clinic_id] ?? DEFAULT_TEMPLATE_BODY;
    const msg = renderTemplate(body, { name: p.full_name, date, time, treatment });
    try {
      await sendTelegramMessage(p.telegram_chat_id, msg);
      sent++;
    } catch (e) {
      console.error("reminder send failed", e);
      skipped++;
    }
  }
  return { ok: true, sent, skipped };
}

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async () => Response.json(await sendReminders()),
      GET: async () => Response.json(await sendReminders()),
    },
  },
});
