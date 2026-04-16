// Triggered by DB webhook on UPDATE of public.bikes when price decreases.
// Notifies all users who have this bike in their favorites.
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const newRow = payload.record ?? payload.new;
    const oldRow = payload.old_record ?? payload.old;
    if (!newRow || !oldRow) return new Response("ok");
    if (newRow.price >= oldRow.price) return new Response("no drop");

    const { data: favs } = await admin
      .from("favorites").select("user_id").eq("bike_id", newRow.id);
    if (!favs || favs.length === 0) return new Response("no favs");

    const drop = oldRow.price - newRow.price;
    const pct = Math.round((drop / oldRow.price) * 100);

    await Promise.all(favs.map((f) =>
      admin.functions.invoke("send-push", {
        body: {
          user_id: f.user_id,
          title: `Prijsdaling: -${pct}% 🎉`,
          body: `${newRow.title} — nu € ${newRow.price.toLocaleString("nl-BE")}`,
          url: `/fiets/${newRow.id}`,
          tag: `price-${newRow.id}`,
        },
      })
    ));

    return new Response(JSON.stringify({ notified: favs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
