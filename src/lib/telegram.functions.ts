import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Sends a reminder message to a single patient via Telegram. */
export const sendPatientReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        patientId: z.string().uuid(),
        message: z.string().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: patient, error } = await supabase
      .from("patients")
      .select("id, full_name, telegram_chat_id")
      .eq("id", data.patientId)
      .single();

    if (error) throw new Error(error.message);
    if (!patient?.telegram_chat_id) {
      return { ok: false as const, reason: "not_connected" as const };
    }

    const { sendTelegramMessage } = await import("@/lib/telegram.server");
    await sendTelegramMessage(patient.telegram_chat_id as unknown as number, data.message);
    return { ok: true as const };
  });

/** Returns the connected bot's @username for connection instructions. */
export const getBotUsername = createServerFn({ method: "GET" }).handler(async () => {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const tgKey = process.env.TELEGRAM_API_KEY;
  if (!tgKey) return { username: null as string | null };
  try {
    if (!lovableKey) {
      const res = await fetch(`https://api.telegram.org/bot${tgKey}/getMe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json()) as { result?: { username?: string } };
      return { username: data?.result?.username ?? null };
    }

    const res = await fetch("https://connector-gateway.lovable.dev/telegram/getMe", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": tgKey,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    const data = (await res.json()) as { result?: { username?: string } };
    return { username: data?.result?.username ?? null };
  } catch {
    return { username: null as string | null };
  }
});
