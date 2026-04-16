// Edge function: AI-powered price suggestion for bikes
// - Reads market context from public.bikes (similar listings)
// - Calls Lovable AI with tool calling for structured output
// - Caches result in public.price_suggestions for 24h
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  brand: string;
  model: string;
  type: string;
  year: number;
  km: number;
};

type Suggestion = {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
  sampleSize: number;
  cached: boolean;
};

const bucketYear = (y: number) => Math.floor(y / 2) * 2; // 2-year buckets
const bucketKm = (k: number) => {
  if (k < 1000) return 0;
  if (k < 5000) return 1;
  if (k < 15000) return 2;
  if (k < 30000) return 3;
  return 4;
};

const makeKey = (b: ReqBody) =>
  [
    b.brand.trim().toLowerCase(),
    b.model.trim().toLowerCase(),
    b.type.trim().toLowerCase(),
    bucketYear(b.year),
    bucketKm(b.km),
  ].join("|");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.brand || !body?.model || !body?.type || !body?.year) {
      return new Response(
        JSON.stringify({ error: "brand, model, type, year are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const cacheKey = makeKey(body);

    // 1) Check cache
    const { data: cached } = await admin
      .from("price_suggestions")
      .select("*")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      const result: Suggestion = {
        min: cached.min_price,
        max: cached.max_price,
        recommended: cached.recommended_price,
        reasoning: cached.reasoning,
        sampleSize: cached.sample_size,
        cached: true,
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Gather DB context: similar active listings
    const yearMin = body.year - 2;
    const yearMax = body.year + 2;
    const { data: similar } = await admin
      .from("bikes")
      .select("price, year, km, model")
      .eq("status", "active")
      .eq("brand", body.brand)
      .eq("type", body.type)
      .gte("year", yearMin)
      .lte("year", yearMax)
      .limit(50);

    const sample = similar ?? [];
    let marketContext = "Geen vergelijkbare actieve listings in onze database.";
    if (sample.length > 0) {
      const prices = sample.map((s) => s.price).sort((a, b) => a - b);
      const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const median = prices[Math.floor(prices.length / 2)];
      const minP = prices[0];
      const maxP = prices[prices.length - 1];
      marketContext = `${sample.length} vergelijkbare actieve listings (${body.brand} ${body.type}, jaar ${yearMin}-${yearMax}): gemiddeld €${avg}, mediaan €${median}, range €${minP}-€${maxP}.`;
    }

    // 3) Call Lovable AI with tool calling
    const systemPrompt = `Je bent een expert in tweedehands fietsenmarkt in Nederland. Geef realistische prijssuggesties in euro's gebaseerd op merk, model, jaar, kilometerstand en marktdata. Wees voorzichtig en realistisch — overdrijf niet.`;
    const userPrompt = `Schat de tweedehands marktwaarde voor:
- Merk: ${body.brand}
- Model: ${body.model}
- Type: ${body.type}
- Bouwjaar: ${body.year}
- Kilometerstand: ${body.km} km

Marktdata uit onze app: ${marketContext}

Geef een prijsrange (min-max) en een aanbevolen vraagprijs. Houd rekening met de specifieke kilometerstand en bouwjaar binnen de marktdata.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_price",
              description: "Return a realistic second-hand price suggestion in EUR.",
              parameters: {
                type: "object",
                properties: {
                  min: { type: "integer", description: "Minimum reasonable asking price in EUR" },
                  max: { type: "integer", description: "Maximum reasonable asking price in EUR" },
                  recommended: { type: "integer", description: "Recommended asking price in EUR (between min and max)" },
                  reasoning: {
                    type: "string",
                    description: "1-2 zinnen uitleg in het Nederlands waarom deze prijsrange past, refererend aan jaar/km/markt",
                  },
                },
                required: ["min", "max", "recommended", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_price" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI error", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Te veel verzoeken, probeer over een minuut opnieuw." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI-tegoed op. Voeg credits toe in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call returned", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI gaf geen geldig antwoord" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments) as {
      min: number; max: number; recommended: number; reasoning: string;
    };

    // Sanity clamps
    const min = Math.max(50, Math.round(parsed.min));
    const max = Math.max(min, Math.round(parsed.max));
    const recommended = Math.min(max, Math.max(min, Math.round(parsed.recommended)));

    // 4) Cache result (upsert by cache_key)
    await admin.from("price_suggestions").upsert(
      {
        cache_key: cacheKey,
        brand: body.brand,
        model: body.model,
        type: body.type,
        year_bucket: bucketYear(body.year),
        km_bucket: bucketKm(body.km),
        min_price: min,
        max_price: max,
        recommended_price: recommended,
        reasoning: parsed.reasoning,
        sample_size: sample.length,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "cache_key" },
    );

    const result: Suggestion = {
      min, max, recommended,
      reasoning: parsed.reasoning,
      sampleSize: sample.length,
      cached: false,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-price error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
