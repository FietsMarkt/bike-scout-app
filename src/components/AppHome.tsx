import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Route, Mountain, Zap, Building2, Wind, Baby, Boxes, Sailboat,
  ShieldCheck, Users, Store, Sparkles, ArrowRight, TrendingUp, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickFilterChips } from "@/components/QuickFilterChips";
import { useBikes, useBikeCount } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImage } from "@/lib/image";

const fmt = new Intl.NumberFormat("nl-BE");

const CATEGORIES = [
  { label: "Racefiets", icon: Route, type: "Racefiets", color: "from-rose-500 to-orange-500" },
  { label: "MTB", icon: Mountain, type: "Mountainbike", color: "from-emerald-500 to-teal-500" },
  { label: "E-bike", icon: Zap, type: "E-bike", color: "from-amber-500 to-yellow-500" },
  { label: "Stadsfiets", icon: Building2, type: "Stadsfiets", color: "from-sky-500 to-blue-500" },
  { label: "Gravel", icon: Wind, type: "Gravel", color: "from-violet-500 to-fuchsia-500" },
  { label: "Kinderfiets", icon: Baby, type: "Kinderfiets", color: "from-pink-500 to-rose-500" },
  { label: "Vouwfiets", icon: Boxes, type: "Vouwfiets", color: "from-cyan-500 to-blue-500" },
  { label: "Bakfiets", icon: Sailboat, type: "Bakfiets", color: "from-lime-500 to-emerald-500" },
];

type EnrichedBike = { id: string; previous_price: number | null; created_at: string };

/**
 * Premium app-style home with rich indigo gradient hero, category tiles,
 * top-deals horizontal carousel, latest feed, and trust badges.
 */
export const AppHome = () => {
  const nav = useNavigate();
  const fav = useFavorites();
  const [q, setQ] = useState("");
  const [postcode, setPostcode] = useState("");
  const { data: count } = useBikeCount();
  const { data: latest = [], isLoading } = useBikes({ sort: "relevance" });
  const [enriched, setEnriched] = useState<Map<string, EnrichedBike>>(new Map());

  useEffect(() => {
    if (latest.length === 0) return;
    supabase
      .from("bikes")
      .select("id, previous_price, created_at")
      .in("id", latest.map((b) => b.id))
      .then(({ data }) => {
        if (data) setEnriched(new Map(data.map((r) => [r.id, r as EnrichedBike])));
      });
  }, [latest]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    nav(`/zoeken${usp.toString() ? `?${usp.toString()}` : ""}`);
  };

  const topDeals = [...latest]
    .filter((b) => {
      const e = enriched.get(b.id);
      return e?.previous_price && e.previous_price > b.price;
    })
    .slice(0, 8);

  return (
    <div className="-mt-12 pb-2">
      {/* HERO — gradient */}
      <section
        className="relative bg-gradient-hero text-header-foreground px-4 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
      >
        {/* decorative glow */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Nº 1 fietsenmarkt Benelux</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            Vind jouw <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">perfecte fiets</span>
          </h1>
          <p className="text-xs text-header-foreground/70 mt-1">
            {count ? `${fmt.format(count)} advertenties` : "Doorzoek alle fietsen"} · particulier &amp; dealers
          </p>

          <form onSubmit={onSearch} className="mt-4 rounded-2xl bg-card text-foreground p-2 shadow-elevated space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Merk, model of trefwoord"
                className="pl-9 h-11 border-0 shadow-none focus-visible:ring-1"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Postcode"
                  inputMode="numeric"
                  maxLength={4}
                  className="pl-9 h-11 border-0 shadow-none focus-visible:ring-1"
                />
              </div>
              <Button type="submit" size="lg" variant="hero" className="h-11 px-6 gap-1">
                Zoek <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Trust micro-bar */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/5 backdrop-blur px-2 py-2.5">
              <ShieldCheck className="h-4 w-4 mx-auto text-success" />
              <div className="text-[10px] font-bold mt-1">FietsGarant®</div>
              <div className="text-[9px] text-header-foreground/60">tot € 10.000</div>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur px-2 py-2.5">
              <Users className="h-4 w-4 mx-auto text-primary" />
              <div className="text-[10px] font-bold mt-1">180k kopers</div>
              <div className="text-[9px] text-header-foreground/60">maandelijks</div>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur px-2 py-2.5">
              <Store className="h-4 w-4 mx-auto text-amber-400" />
              <div className="text-[10px] font-bold mt-1">1.200 dealers</div>
              <div className="text-[9px] text-header-foreground/60">geverifieerd</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CHIPS */}
      <div className="bg-card border-b border-border sticky top-12 z-20" style={{ top: "calc(env(safe-area-inset-top) + 3rem)" }}>
        <div className="px-4">
          <QuickFilterChips />
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="px-4 pt-5">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-base font-bold">Categorieën</h2>
          <button onClick={() => nav("/zoeken")} className="text-xs font-semibold text-primary">
            Alle →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => nav(`/zoeken?type=${encodeURIComponent(c.type)}`)}
              className="group flex flex-col items-center text-center rounded-2xl bg-card border border-border p-2.5 active:scale-95 transition-transform"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                <c.icon className="h-5 w-5" />
              </span>
              <span className="mt-1.5 text-[10px] font-bold leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TOP DEALS */}
      {topDeals.length > 0 && (
        <section className="pt-6">
          <div className="px-4 flex items-end justify-between mb-3">
            <h2 className="font-display text-base font-bold inline-flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-success" /> Prijsverlagingen
            </h2>
            <button onClick={() => nav("/zoeken")} className="text-xs font-semibold text-primary">
              Meer →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
            {topDeals.map((b) => {
              const e = enriched.get(b.id);
              const drop = (e?.previous_price ?? 0) - b.price;
              const isFav = fav.has(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => nav(`/fiets/${b.id}`)}
                  className="snap-start shrink-0 w-44 rounded-2xl bg-card border border-border overflow-hidden text-left active:scale-[0.98] transition-transform"
                >
                  <div className="relative aspect-square bg-muted">
                    <img src={getOptimizedImage(b.image, 400)} alt={b.title} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 rounded-md bg-success text-success-foreground px-1.5 py-0.5 text-[9px] font-bold">
                      −€ {fmt.format(drop)}
                    </span>
                    <button
                      onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); fav.toggle(b.id); }}
                      className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-card/90 backdrop-blur"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <div className="font-display text-sm font-bold line-clamp-1">{b.title}</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-base font-extrabold">€ {fmt.format(b.price)}</span>
                      {e?.previous_price && (
                        <span className="text-[10px] line-through text-muted-foreground">€ {fmt.format(e.previous_price)}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{b.location}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* LATEST FEED */}
      <section className="px-4 pt-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-base font-bold">Nieuwste fietsen</h2>
          <button onClick={() => nav("/zoeken")} className="text-xs font-semibold text-primary">
            Alle →
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {latest.slice(0, 12).map((b) => {
              const e = enriched.get(b.id);
              const isFav = fav.has(b.id);
              const isNew = e && Date.now() - new Date(e.created_at).getTime() < 86400000 * 2;
              return (
                <button
                  key={b.id}
                  onClick={() => nav(`/fiets/${b.id}`)}
                  className="rounded-2xl bg-card border border-border overflow-hidden text-left active:scale-[0.98] transition-transform shadow-card"
                >
                  <div className="relative aspect-square bg-muted">
                    <img src={getOptimizedImage(b.image, 400)} alt={b.title} loading="lazy" className="w-full h-full object-cover" />
                    {isNew && (
                      <span className="absolute top-2 left-2 rounded-md bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase">
                        Nieuw
                      </span>
                    )}
                    <button
                      onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); fav.toggle(b.id); }}
                      className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-card/90 backdrop-blur"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <div className="font-display text-sm font-bold line-clamp-1">{b.title}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{b.subtitle}</div>
                    <div className="mt-1.5 flex items-end justify-between">
                      <span className="font-display text-base font-extrabold text-foreground">€ {fmt.format(b.price)}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[60%]">{b.location}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
