import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MsgSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `Sen "Djoni Dentist" stomatologiya klinikasining yordamchi AI konsultantisan.
Klinika Nukus shahrida, Aeroport hududida joylashgan, 24/7 ishlaydi. Telefon: 91 380 86 67.
Xizmatlar: tish ko'rigi, oqartirish, protezlash, breket/Invisalign, karies davolash, shoshilinch yordam.
Bemorlarga o'zbek tilida, qisqa va samimiy javob ber. Tibbiy tashxis qo'yma — faqat umumiy maslahat ber va qabulga yozilishni taklif qil.
Narx so'ralsa: aniq narx telefon yoki qabulda aniqlanishini ayt.`;

/** Public AI support chat for the landing page (Lovable AI Gateway). */
export const askSupport = createServerFn({ method: "POST" })
  .inputValidator((input) => MsgSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "Kechirasiz, hozir AI yordamchi mavjud emas. Iltimos 91 380 86 67 raqamiga qo'ng'iroq qiling." };
    }
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
        }),
      });
      if (res.status === 429) {
        return { reply: "Hozir so'rovlar ko'p. Iltimos bir oz kuting yoki 91 380 86 67 ga qo'ng'iroq qiling." };
      }
      if (!res.ok) {
        return { reply: "Kechirasiz, javob berishda xatolik. Iltimos 91 380 86 67 raqamiga bog'laning." };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = json.choices?.[0]?.message?.content?.trim();
      return { reply: reply || "Kechirasiz, javobni tushunmadim. Qaytadan yozing yoki 91 380 86 67 ga qo'ng'iroq qiling." };
    } catch {
      return { reply: "Ulanishda xatolik. Iltimos 91 380 86 67 raqamiga qo'ng'iroq qiling." };
    }
  });
