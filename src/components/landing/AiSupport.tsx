import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { askSupport } from "@/lib/ai-support.functions";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Assalomu alaykum! Men Djoni Dentist AI yordamchisiman. Xizmatlar, narxlar yoki qabulga yozilish bo‘yicha savolingiz bo‘lsa, yozing 🦷",
};

export function AiSupport() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askSupport);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const history = next.filter((m) => m.role === "user" || m.role === "assistant").slice(-12);
      const res = await ask({ data: { messages: history } });
      setMsgs((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Kechirasiz, xatolik yuz berdi. 91 380 86 67 ga qo‘ng‘iroq qiling." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI yordamchi"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-elegant transition-transform hover:scale-105"
        style={{ background: "var(--gradient-primary)" }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-5 w-5" />
            <div>
              <div className="text-sm font-semibold">AI yordamchi</div>
              <div className="text-[11px] opacity-90">Djoni Dentist · onlayn</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">Yozmoqda…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              className="input flex-1"
              placeholder="Savolingizni yozing…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void send(); } }}
            />
            <button onClick={() => void send()} disabled={loading || !input.trim()} className="btn-primary h-10 w-10 shrink-0 p-0 disabled:opacity-50" aria-label="Yuborish">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
