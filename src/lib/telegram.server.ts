// Server-only Telegram helpers. Never import from client code.
import { createHash } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

/** Sends a Telegram message through the Lovable connector gateway. */
export async function sendTelegramMessage(chatId: number | string, text: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  const tgKey = process.env.TELEGRAM_API_KEY;
  if (!tgKey) throw new Error("TELEGRAM_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": tgKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: unknown };
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram sendMessage failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data.result;
}

/** Deterministic webhook secret derived from the connection key. */
export function deriveTelegramWebhookSecret(telegramApiKey: string): string {
  return createHash("sha256").update(`telegram-webhook:${telegramApiKey}`).digest("base64url");
}
