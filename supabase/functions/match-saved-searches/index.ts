// Cron: every 15 minutes. For each saved search, find new matching bikes
// since last_checked_at and notify the owner via push.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Filters = {
  q?: string;
  type?: string;
  brand?: string;
  maxPrice?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { data: searches } = await admin
      .from("saved_searches")
      .select("*")
      .eq("notify_push", true);

    if (!searches || searches.length === 0) {
      return new Response(JSON.stringify({ checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalMatches = 0;

    for (const s of searches) {
      const filters: Filters = (s.filters ?? {}) as Filters;
      let q = admin.from("bikes")
        .select("id, title, price")
        .eq("status", "active")
        .gt("created_at", s.last_checked_at);

      if (filters.type && filters.type !== "Alle types") q = q.eq("type", filters.type);
      if (filters.brand && filters.brand !== "Alle merken") q = q.eq("brand", filters.brand);
      if (filters.maxPrice && filters.maxPrice > 0) q = q.lte("price", filters.maxPrice);

      const { data: matches } = await q.limit(5);
      if (matches && matches.length > 0) {
        totalMatches += matches.length;
        const first = matches[0];
        await admin.functions.invoke("send-push", {
          body: {
            user_id: s.user_id,
            title: `${matches.length} nieuwe match${matches.length === 1 ? "" : "es"} voor "${s.name}"`,
            body: first.title,
            url: matches.length === 1 ? `/fiets/${first.id}` : `/zoekopdrachten`,
            tag: `search-${s.id}`,
          },
        });
      }

      await admin.from("saved_searches")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", s.id);
    }

    return new Response(JSON.stringify({ checked: searches.length, totalMatches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
