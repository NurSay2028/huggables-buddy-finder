import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, Loader2, X, CheckCircle2 } from "lucide-react";

// Open from anywhere with: window.dispatchEvent(new Event("open-booking"))
export function openBooking() {
  window.dispatchEvent(new Event("open-booking"));
}

export function BookingDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    problem: "",
    preferred_date: "",
    preferred_time: "",
  });

  useEffect(() => {
    const handler = () => {
      setDone(false);
      setOpen(true);
    };
    window.addEventListener("open-booking", handler);
    return () => window.removeEventListener("open-booking", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || form.phone.trim().length < 3) return;
    setSubmitting(true);
    const { error } = await supabase.from("ai_appointment_requests").insert({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      problem: form.problem.trim() || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      alert("Qátelik júz berdi. Iltimas qaytadan urinip kóriń.");
      return;
    }
    setDone(true);
    setForm({ full_name: "", phone: "", problem: "", preferred_date: "", preferred_time: "" });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elegant sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Qabıllawǵa jazılıw</h2>
              <p className="text-xs text-muted-foreground">Djoni Dentist — Nukus</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Jabıw"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Raxmet!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Arzańız qabıl etildi. Tez arada siz benen baylanısamız.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Jabıw
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Atı familiyası *</label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input"
                placeholder="Atı familiyańız"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Telefon nomeri *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="+998 __ ___ __ __"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Mashqala / túsindirme</label>
              <textarea
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                className="input min-h-[72px] resize-none"
                placeholder="Tisińiz haqqında qısqasha jazıń"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Sáne</label>
                <input
                  type="date"
                  value={form.preferred_date}
                  onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Waqıt</label>
                <input
                  type="time"
                  value={form.preferred_time}
                  onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Jiberiw
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
