import { createServerFn } from "@tanstack/react-start";

/** Public: returns the stored landing content as a JSON string (server-side, no flash). */
export const getLandingContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ json: string | null }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("landing_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      return { json: data?.content ? JSON.stringify(data.content) : null };
    } catch {
      return { json: null };
    }
  },
);
