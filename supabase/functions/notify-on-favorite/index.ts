// Triggered by DB webhook on INSERT into public.favorites.
// Notifies the bike owner that someone favorited their bike.
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
    const row = payload.record ?? payload.new ?? payload;
    const bikeId = row.bike_id;
    const favUserId = row.user_id;
    if (!bikeId) return new Response("ok");

    const { data: bike } = await admin
      .from("bikes").select("user_id, title").eq("id", bikeId).maybeSingle();
    if (!bike || bike.user_id === favUserId) return new Response("ok");

    await admin.functions.invoke("send-push", {
      body: {
        user_id: bike.user_id,
        title: "Iemand bewaarde je fiets ❤️",
        body: bike.title,
        url: `/fiets/${bikeId}`,
        tag: `fav-${bikeId}`,
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
