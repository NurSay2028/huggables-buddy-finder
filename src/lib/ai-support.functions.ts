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

const SYSTEM_PROMPT = `Sen "Djoni Dentist" stomatologiya klinikasining samimiy AI yordamchisisan.
Klinika Nukus shahrida, Aeroport hududida joylashgan, 24/7 ishlaydi. Telefon: 91 380 86 67.
Xizmatlar: tish ko'rigi, oqartirish, protezlash, breket/Invisalign, karies davolash, shoshilinch yordam.

Vazifang — bemorlarga tish-jag' salomatligi bo'yicha FOYDALI, AMALIY maslahatlar berish:
- Tish og'rig'i, milk qonashi, sezgirlik, karies, hidlanish kabi muammolarda nima qilish kerakligini tushuntir.
- Og'iz gigiyenasi bo'yicha amaliy maslahatlar ber (to'g'ri tish yuvish, ip ishlatish, ovqatlanish).
- Uy sharoitida og'riqni vaqtincha yengillashtirish usullarini ayt (iliq tuzli suv bilan chayish va h.k.).
- Har doim aniq tashxis va davolash uchun klinikaga ko'rikka kelishni yoki 91 380 86 67 ga qo'ng'iroq qilishni tavsiya qil.

Qoidalar: o'zbek tilida, qisqa, aniq va samimiy yoz. Tibbiy retsept yozma va dori dozasini aytma —
faqat umumiy maslahat ber. Narx so'ralsa: aniq narx ko'rik yoki telefon orqali aniqlanishini ayt.`;

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
