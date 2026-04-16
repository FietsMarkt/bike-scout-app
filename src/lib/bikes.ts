import { bikes as seed } from "@/data/bikes";
import type { Bike } from "@/components/BikeCard";

const STORAGE_KEY = "fietsmarkt:userBikes";

export const getUserBikes = (): Bike[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bike[]) : [];
  } catch { return []; }
};

export const saveUserBike = (b: Bike) => {
  const list = getUserBikes();
  list.unshift(b);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const getAllBikes = (): Bike[] => [...getUserBikes(), ...seed];

export const getBikeById = (id: string): Bike | undefined =>
  getAllBikes().find((b) => b.id === id);

export type BikeFilters = {
  q?: string;
  type?: string;
  brand?: string;
  maxPrice?: number;
  postcode?: string;
  sort?: "relevance" | "price-asc" | "price-desc" | "year-desc" | "km-asc";
};

export const filterBikes = (list: Bike[], f: BikeFilters): Bike[] => {
  let out = list;
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((b) => `${b.title} ${b.subtitle} ${b.location}`.toLowerCase().includes(q));
  }
  if (f.type && f.type !== "Alle types") {
    const t = f.type.toLowerCase();
    out = out.filter((b) => `${b.title} ${b.subtitle}`.toLowerCase().includes(t.replace("fiets", "")));
  }
  if (f.brand && f.brand !== "Alle merken") {
    out = out.filter((b) => b.title.toLowerCase().includes(f.brand!.toLowerCase()));
  }
  if (f.maxPrice && f.maxPrice > 0) {
    out = out.filter((b) => b.price <= f.maxPrice!);
  }
  switch (f.sort) {
    case "price-asc":  out = [...out].sort((a, b) => a.price - b.price); break;
    case "price-desc": out = [...out].sort((a, b) => b.price - a.price); break;
    case "year-desc":  out = [...out].sort((a, b) => b.year - a.year); break;
    case "km-asc":     out = [...out].sort((a, b) => (a.km ?? 0) - (b.km ?? 0)); break;
  }
  return out;
};
