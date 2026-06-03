import { createFileRoute } from "@tanstack/react-router";

async function processScheduled() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendTelegramMessage } = await import("@/lib/telegram.server");

  const { data: due, error } = await supabaseAdmin
    .from("scheduled_reminders")
    .select("id, message, patient_id, patients(telegram_chat_id)")
    .eq("status", "pending")
    .lte("send_at", new Date().toISOString())
    .limit(100);

  if (error) return { ok: false, error: error.message, sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  for (const r of (due ?? []) as any[]) {
    const chatId = r.patients?.telegram_chat_id;
    if (!chatId) {
      await supabaseAdmin
        .from("scheduled_reminders")
        .update({ status: "failed", error: "Telegram not connected" })
        .eq("id", r.id);
      failed++;
      continue;
    }
    try {
      await sendTelegramMessage(chatId, r.message);
      await supabaseAdmin
        .from("scheduled_reminders")
        .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
        .eq("id", r.id);
      sent++;
    } catch (e: any) {
      await supabaseAdmin
        .from("scheduled_reminders")
        .update({ status: "failed", error: String(e?.message ?? e).slice(0, 500) })
        .eq("id", r.id);
      failed++;
    }
  }
  return { ok: true, sent, failed };
}

export const Route = createFileRoute("/api/public/hooks/process-scheduled")({
  server: {
    handlers: {
      POST: async () => Response.json(await processScheduled()),
      GET: async () => Response.json(await processScheduled()),
    },
  },
});
