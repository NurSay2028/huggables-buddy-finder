import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

function deriveSecret(key: string): string {
  return createHash("sha256").update(`telegram-webhook:${key}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function normalizePhone(p: string): string {
  return (p || "").replace(/\D/g, "");
}

async function reply(chatId: number, text: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const tgKey = process.env.TELEGRAM_API_KEY;
  if (!lovableKey || !tgKey) {
    console.warn("Telegram not configured; cannot reply.");
    return;
  }
  await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": tgKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const tgKey = process.env.TELEGRAM_API_KEY;
        if (!tgKey) return new Response("Not configured", { status: 500 });

        const expected = deriveSecret(tgKey);
        const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(got, expected)) return new Response("Unauthorized", { status: 401 });

        const update = (await request.json().catch(() => null)) as
          | { message?: any; edited_message?: any }
          | null;
        const message = update?.message ?? update?.edited_message;
        const chatId: number | undefined = message?.chat?.id;
        const text: string = (message?.text ?? "").trim();
        if (!chatId) return Response.json({ ok: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (text === "/start" || text.toLowerCase() === "start") {
          await reply(
            chatId,
            "Assalawma aleykum! Klinika qabıllaw esletpelerin alıw ushın telefon nomerińizdi hám klinikadan alǵan kodıńızdı jiberiń.\n\nÚlgi:\n<code>+998901234567 AB12CD</code>",
          );
          return Response.json({ ok: true });
        }

        const codeMatch = text
          .toUpperCase()
          .match(/\b[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}\b/);
        const phoneDigits = normalizePhone(text);

        if (!codeMatch || phoneDigits.length < 7) {
          await reply(
            chatId,
            "Iltimas telefon nomerińizdi hám kodıńızdı birge jiberiń.\n\nÚlgi:\n<code>+998901234567 AB12CD</code>",
          );
          return Response.json({ ok: true });
        }

        const code = codeMatch[0];
        const { data: patient } = await supabaseAdmin
          .from("patients")
          .select("id, full_name, phone, telegram_code")
          .eq("telegram_code", code)
          .maybeSingle();

        if (!patient) {
          await reply(chatId, "Keshiriń, bunday kod tabılmadı. Kodtı tekserip qaytadan jiberiń.");
          return Response.json({ ok: true });
        }

        const patientPhone = normalizePhone((patient as { phone?: string }).phone ?? "");
        const tail = (s: string) => s.slice(-9);
        const phoneOk =
          patientPhone.length >= 7 &&
          (phoneDigits.endsWith(tail(patientPhone)) || patientPhone.endsWith(tail(phoneDigits)));

        if (!phoneOk) {
          await reply(
            chatId,
            "Telefon nomeri kod penen sáykes kelmedi.\nKlinikada dizimnen ótken nomerińizdi jiberiń.",
          );
          return Response.json({ ok: true });
        }

        await supabaseAdmin
          .from("patients")
          .update({ telegram_chat_id: chatId })
          .eq("id", (patient as { id: string }).id);

        await reply(
          chatId,
          `Raxmet, ${(patient as { full_name: string }).full_name}! Telegram akkauntıńız tabıslı jalǵandı. Endi qabıllaw esletpelerin usı jerde alasız. ✅`,
        );
        return Response.json({ ok: true });
      },
    },
  },
});
