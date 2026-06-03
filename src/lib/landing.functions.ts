import { createServerFn } from "@tanstack/react-start";

/** Public: returns the stored landing content (server-side, no flash). */
export const getLandingContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("landing_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    return { content: (data?.content ?? null) as unknown };
  } catch {
    return { content: null as unknown };
  }
});
