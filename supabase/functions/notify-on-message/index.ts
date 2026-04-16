// Triggered by DB webhook on INSERT into public.messages.
// Sends a push to the recipient (the other participant in the conversation).
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SB_URL, SB_SERVICE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const row = payload.record ?? payload.new ?? payload;
    const conversationId = row.conversation_id;
    const senderId = row.sender_id;
    const body = row.body as string;
    if (!conversationId || !senderId) return new Response("ok");

    const { data: conv } = await admin
      .from("conversations")
      .select("buyer_id, seller_id, bike_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv) return new Response("no conv");

    const recipient = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;

    const { data: senderProfile } = await admin
      .from("profiles").select("display_name").eq("user_id", senderId).maybeSingle();
    const senderName = senderProfile?.display_name ?? "Iemand";

    await admin.functions.invoke("send-push", {
      body: {
        user_id: recipient,
        title: `${senderName} stuurde je een bericht`,
        body: body.slice(0, 140),
        url: `/berichten/${conversationId}`,
        tag: `msg-${conversationId}`,
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
