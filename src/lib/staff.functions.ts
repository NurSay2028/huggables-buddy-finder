import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ROLES = ["admin", "doctor", "reception", "warehouse", "accountant"] as const;

const InviteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  role: z.enum(ROLES),
});

export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // verify caller is owner of a clinic
    const { data: myRole, error: roleErr } = await supabase
      .from("user_roles")
      .select("clinic_id,role")
      .eq("user_id", userId)
      .eq("role", "owner")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!myRole?.clinic_id) throw new Error("Faqat klinika egasi xodim qo‘sha oladi");
    const clinicId = myRole.clinic_id;

    // create or find user
    let newUserId: string | null = null;
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, phone: data.phone ?? null },
    });
    if (created.error) {
      // try to find existing
      const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list.data?.users?.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (!existing) throw new Error(created.error.message);
      newUserId = existing.id;
    } else {
      newUserId = created.data.user?.id ?? null;
    }
    if (!newUserId) throw new Error("Foydalanuvchi yaratilmadi");

    // ensure profile row
    await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      full_name: data.full_name,
      phone: data.phone ?? null,
    }, { onConflict: "id" });

    // check user not already in another clinic
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles").select("clinic_id").eq("user_id", newUserId).not("clinic_id", "is", null).maybeSingle();
    if (existingRole && existingRole.clinic_id !== clinicId) {
      throw new Error("Foydalanuvchi boshqa klinikaga biriktirilgan");
    }

    const { error: insErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId, clinic_id: clinicId, role: data.role,
    });
    if (insErr && !insErr.message.includes("duplicate")) throw new Error(insErr.message);

    return { ok: true, user_id: newUserId };
  });
