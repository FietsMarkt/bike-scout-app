import { supabase } from "@/integrations/supabase/client";
import type { Bike } from "@/components/BikeCard";

const rowToBike = (r: Record<string, unknown>): Bike => ({
  id: r.id as string,
  title: r.title as string,
  subtitle: (r.subtitle as string) ?? (r.type as string),
  price: r.price as number,
  year: r.year as number,
  km: (r.km as number | null) ?? undefined,
  motor: (r.motor as string | null) ?? undefined,
  location: r.city as string,
  image: ((r.images as string[] | null) ?? [])[0] ?? "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=900",
  badge: undefined,
  dealer: false,
});

export type BikeFilters = {
  q?: string;
  type?: string;
  brand?: string;
  maxPrice?: number;
  city?: string;
  motor?: string;       // "Alle" | "Geen" | "E-bike"
  minYear?: number;
  maxKm?: number;
  sort?: "relevance" | "price-asc" | "price-desc" | "year-desc" | "km-asc";
};

// Sanitize free-text search to prevent PostgREST filter injection.
// Strip characters meaningful to PostgREST .or() syntax: , ( ) . \ %
// and clamp to 80 chars.
const sanitizeQuery = (input: string): string =>
  input.replace(/[,()\\.%]/g, " ").trim().slice(0, 80);

export const fetchBikes = async (f: BikeFilters = {}): Promise<Bike[]> => {
  let q = supabase.from("bikes").select("*").eq("status", "active");
  if (f.type && f.type !== "Alle types") q = q.eq("type", f.type);
  if (f.brand && f.brand !== "Alle merken") q = q.eq("brand", f.brand);
  if (f.maxPrice && f.maxPrice > 0) q = q.lte("price", f.maxPrice);
  if (f.city && f.city.trim()) q = q.ilike("city", `%${sanitizeQuery(f.city)}%`);
  if (f.motor === "E-bike") q = q.not("motor", "is", null);
  if (f.motor === "Geen") q = q.is("motor", null);
  if (f.minYear && f.minYear > 0) q = q.gte("year", f.minYear);
  if (f.maxKm && f.maxKm > 0) q = q.lte("km", f.maxKm);
  if (f.q) {
    const safe = sanitizeQuery(f.q);
    if (safe.length > 0) {
      const term = `%${safe}%`;
      q = q.or(
        `title.ilike.${term},model.ilike.${term},brand.ilike.${term},city.ilike.${term}`
      );
    }
  }

  switch (f.sort) {
    case "price-asc":  q = q.order("price", { ascending: true }); break;
    case "price-desc": q = q.order("price", { ascending: false }); break;
    case "year-desc":  q = q.order("year", { ascending: false }); break;
    case "km-asc":     q = q.order("km", { ascending: true, nullsFirst: false }); break;
    default:           q = q.order("created_at", { ascending: false });
  }
  const { data } = await q.limit(100);
  return (data ?? []).map(rowToBike);
};

export const fetchBikeById = async (id: string) => {
  const { data } = await supabase.from("bikes").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return { bike: rowToBike(data), raw: data as Record<string, unknown> };
};

export const fetchMyBikes = async (userId: string): Promise<Bike[]> => {
  const { data } = await supabase
    .from("bikes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToBike);
};

export const fetchFavoriteBikes = async (userId: string): Promise<Bike[]> => {
  const { data } = await supabase
    .from("favorites")
    .select("bikes(*)")
    .eq("user_id", userId);
  return (data ?? [])
    .map((r) => (r as { bikes: Record<string, unknown> }).bikes)
    .filter(Boolean)
    .map(rowToBike);
};
