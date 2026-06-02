import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDate, fmtSum } from "@/lib/format";
import { Plus, Pencil, Trash2, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({
  component: InventoryPage,
});

type Item = {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  purchase_price: number;
  supplier: string | null;
  expiration_date: string | null;
};

function InventoryPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("inventory").select("*").eq("clinic_id", clinic.id).order("name");
    if (error) return toast.error(error.message);
    setRows(data as Item[]);
  };

  useEffect(() => { void load(); }, [clinic?.id]);

  const adjust = async (i: Item, delta: number) => {
    const next = Math.max(0, Number(i.quantity) + delta);
    const { error } = await supabase.from("inventory").update({ quantity: next }).eq("id", i.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Mahsulotni o‘chirasizmi?")) return;
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const lowCount = (rows ?? []).filter((r) => Number(r.quantity) <= Number(r.low_stock_threshold)).length;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Ombor"
        description="Materiallar va mahsulotlar."
        actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> Yangi mahsulot</button>}
      />

      {lowCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning-foreground">
          <AlertTriangle className="h-4 w-4" /> {lowCount} ta mahsulot kam qoldi
        </div>
      )}

      <div className="card overflow-hidden">
        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="Mahsulot yo‘q" description="Birinchi mahsulotni qo‘shing." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nomi</th>
                  <th className="px-4 py-3">Kategoriya</th>
                  <th className="px-4 py-3">Yetkazib beruvchi</th>
                  <th className="px-4 py-3">Yaroqlilik</th>
                  <th className="px-4 py-3 text-right">Narx</th>
                  <th className="px-4 py-3 text-center">Qoldiq</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((i) => {
                  const low = Number(i.quantity) <= Number(i.low_stock_threshold);
                  return (
                    <tr key={i.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.category || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.supplier || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtDate(i.expiration_date)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{fmtSum(i.purchase_price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => adjust(i, -1)} className="rounded-md p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                          <span className={`min-w-12 text-center font-medium ${low ? "text-destructive" : ""}`}>{i.quantity} {i.unit}</span>
                          <button onClick={() => adjust(i, 1)} className="rounded-md p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setEditing(i)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => remove(i.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <ItemForm
          item={editing}
          clinicId={clinic!.id}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function ItemForm({ item, clinicId, onClose, onSaved }: {
  item: Item | null; clinicId: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    category: item?.category ?? "",
    quantity: item?.quantity ?? 0,
    unit: item?.unit ?? "dona",
    low_stock_threshold: item?.low_stock_threshold ?? 5,
    purchase_price: item?.purchase_price ?? 0,
    supplier: item?.supplier ?? "",
    expiration_date: item?.expiration_date ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nom majburiy");
    setSaving(true);
    const payload = {
      ...form,
      category: form.category || null,
      supplier: form.supplier || null,
      expiration_date: form.expiration_date || null,
      clinic_id: clinicId,
    };
    const { error } = item
      ? await supabase.from("inventory").update(payload).eq("id", item.id)
      : await supabase.from("inventory").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(item ? "Yangilandi" : "Qo‘shildi");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={item ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} size="lg">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <L label="Nom *" full>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </L>
        <L label="Kategoriya"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></L>
        <L label="Yetkazib beruvchi"><input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></L>
        <L label="Miqdor"><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></L>
        <L label="O‘lchov birligi"><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></L>
        <L label="Kam qoldiq chegarasi"><input type="number" className="input" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} /></L>
        <L label="Narx (so‘m)"><input type="number" className="input" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} /></L>
        <L label="Yaroqlilik muddati" full><input type="date" className="input" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} /></L>
        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor qilish</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
        </div>
      </form>
    </Modal>
  );
}
function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
