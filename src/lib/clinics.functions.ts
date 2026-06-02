import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RegisterClinicSchema = z.object({
  name: z.string().min(1).max(160),
  owner_name: z.string().min(1).max(160),
  phone: z.string().min(3).max(40),
  city: z.string().min(1).max(120),
  doctors_count: z.number().int().min(1).max(500),
});

export const registerClinic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RegisterClinicSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: existingRole, error: existingError } = await supabaseAdmin
      .from("user_roles")
      .select("clinic_id")
      .eq("user_id", userId)
      .not("clinic_id", "is", null)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (existingRole?.clinic_id) throw new Error("Siz allaqachon klinikaga biriktirilgansiz");

    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from("clinics")
      .insert({
        name: data.name,
        owner_name: data.owner_name,
        phone: data.phone,
        city: data.city,
        doctors_count: data.doctors_count,
        status: "approved",
      })
      .select("id")
      .single();

    if (clinicError) throw new Error(clinicError.message);

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      clinic_id: clinic.id,
      role: "owner",
    });

    if (roleError) throw new Error(roleError.message);

    return { ok: true, clinic_id: clinic.id };
  });