import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtSum, fmtDate } from "@/lib/format";
import { Plus, Trash2, Wallet, TrendingDown, CalendarDays, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/expenses")({ component: ExpensesPage });

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  spent_at: string;
};

export const EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "materials", label: "Materiallar" },
  { value: "salary", label: "Oylik / ish haqi" },
  { value: "rent", label: "Ijara" },
  { value: "utilities", label: "Kommunal (suv, svet)" },
  { value: "equipment", label: "Jihozlar" },
  { value: "marketing", label: "Reklama" },
  { value: "tax", label: "Soliq" },
  { value: "other", label: "Boshqa" },
];

const catLabel = (v: string) => EXPENSE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ExpensesPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Expense[] | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("expenses")
      .select("id,amount,category,description,spent_at")
      .eq("clinic_id", clinic.id)
      .order("spent_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows(data as Expense[]);
  };

  useEffect(() => { void load(); }, [clinic?.id]);

  const monthTotal = useMemo(() => {
    if (!rows) return 0;
    const now = new Date();
    return rows
      .filter((r) => {
        const d = new Date(r.spent_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((a, r) => a + Number(r.amount || 0), 0);
  }, [rows]);

  const total = useMemo(() => (rows ?? []).reduce((a, r) => a + Number(r.amount || 0), 0), [rows]);

  const remove = async (id: string) => {
    if (!confirm("Xarajatni o‘chirasizmi?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O‘chirildi");
    void load();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Xarajatlar"
        description="Klinika xarajatlarini kuzating va boshqaring."
        actions={
          <button onClick={() => setAdding(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Yangi xarajat
          </button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<TrendingDown className="h-5 w-5" />} tone="bg-warning/15 text-warning-foreground" value={fmtSum(monthTotal)} label="Shu oy xarajati" />
        <StatCard icon={<Wallet className="h-5 w-5" />} tone="bg-primary-soft text-primary" value={fmtSum(total)} label="Jami xarajat" />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} tone="bg-muted text-foreground" value={String(rows?.length ?? 0)} label="Yozuvlar soni" />
      </section>

      <div className="card overflow-hidden">
        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Hozircha xarajat yo‘q"
            description="Birinchi xarajatni qo‘shing."
            action={<button onClick={() => setAdding(true)} className="btn-primary"><Plus className="h-4 w-4" /> Yangi xarajat</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Turi</th>
                  <th className="px-4 py-3">Izoh</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.spent_at)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{catLabel(r.category)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.description || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmtSum(r.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(r.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adding && clinic && (
        <ExpenseModal
          clinicId={clinic.id}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); void load(); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, tone, value, label }: { icon: React.ReactNode; tone: string; value: string; label: string }) {
  return (
    <div className="card p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ExpenseModal({ clinicId, onClose, onSaved }: { clinicId: string; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("materials");
  const [description, setDescription] = useState("");
  const [spentAt, setSpentAt] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("To‘g‘ri summa kiriting");
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      clinic_id: clinicId,
      amount: amt,
      category,
      description: description.trim() || null,
      spent_at: spentAt,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Xarajat qo‘shildi ✅");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Yangi xarajat">
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Summa (so‘m)</span>
          <input className="input" type="number" min="0" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Masalan: 500000" autoFocus />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Turi</span>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Sana</span>
          <input className="input" type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Izoh (ixtiyoriy)</span>
          <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nima uchun sarflandi…" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost"><X className="h-4 w-4" /> Bekor</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}
