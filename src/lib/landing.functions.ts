import { createServerFn } from "@tanstack/react-start";

type LandingJson = Record<string, unknown> | null;

/** Public: returns the stored landing content (server-side, no flash). */
export const getLandingContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ content: LandingJson }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("landing_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      return { content: (data?.content ?? null) as LandingJson };
    } catch {
      return { content: null };
    }
  },
);
