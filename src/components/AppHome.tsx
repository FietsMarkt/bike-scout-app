import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Route, Mountain, Zap, Building2, Wind, Baby, Boxes, Sailboat,
  ShieldCheck, Users, Store, ArrowRight, TrendingUp, Heart, ChevronRight,
  Newspaper, Wrench, Tag, Bike as BikeIcon, Clock,
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
  { label: "Racefiets", icon: Route, type: "Racefiets", count: "12.4k" },
  { label: "MTB", icon: Mountain, type: "Mountainbike", count: "9.8k" },
  { label: "E-bike", icon: Zap, type: "E-bike", count: "18.2k" },
  { label: "Stadsfiets", icon: Building2, type: "Stadsfiets", count: "15.1k" },
  { label: "Gravel", icon: Wind, type: "Gravel", count: "4.6k" },
  { label: "Kinderfiets", icon: Baby, type: "Kinderfiets", count: "6.3k" },
  { label: "Vouwfiets", icon: Boxes, type: "Vouwfiets", count: "2.1k" },
  { label: "Bakfiets", icon: Sailboat, type: "Bakfiets", count: "1.9k" },
];

const POPULAR_BRANDS = [
  "Trek", "Specialized", "Cannondale", "Giant", "Cube", "Canyon", "Bianchi", "Scott",
];

const TIPS = [
  { icon: ShieldCheck, title: "Veilig kopen", text: "Onze 7 tips tegen fraude" },
  { icon: Wrench, title: "Onderhoud", text: "Houd je fiets in topvorm" },
  { icon: Tag, title: "De juiste prijs", text: "Wat is jouw fiets waard?" },
];

type EnrichedBike = { id: string; previous_price: number | null; created_at: string };

/**
 * App home — minder druk, voller en overzichtelijker (zoals web-versie maar simpeler).
 * Monochrome iconen in indigo huisstijl, geen kleurige tegels.
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
    <div className="-mt-12 pb-2 bg-surface min-h-screen">
      {/* HERO — gradient, compacter */}
      <section
        className="relative bg-gradient-hero text-header-foreground px-4 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)" }}
      >
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/30 blur-3xl pointer-events-none" />

        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            Vind jouw <span className="text-primary-soft">perfecte fiets</span>
          </h1>
          <p className="text-xs text-header-foreground/70 mt-1">
            {count ? `${fmt.format(count)} advertenties` : "Doorzoek alle fietsen"} · particulier &amp; dealers
          </p>

          <form onSubmit={onSearch} className="mt-3 rounded-2xl bg-card text-foreground p-2 shadow-elevated space-y-2">
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
        </div>
      </section>

      {/* TRUST STRIP — simpel zoals web TrustBar */}
      <section className="bg-gradient-soft border-b border-border">
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          {[
            { icon: ShieldCheck, title: "FietsGarant®", text: "tot € 10.000" },
            { icon: Users, title: "180k kopers", text: "elke maand" },
            { icon: Store, title: "1.200 dealers", text: "geverifieerd" },
          ].map((i) => (
            <div key={i.title} className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <i.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold leading-tight truncate">{i.title}</div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate">{i.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK CHIPS */}
      <div className="bg-card border-b border-border">
        <div className="px-4">
          <QuickFilterChips />
        </div>
      </div>

      {/* CATEGORIES — monochroom, zoals web */}
      <section className="px-4 pt-5">
        <SectionHeader title="Categorieën" onMore={() => nav("/zoeken")} />
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => nav(`/zoeken?type=${encodeURIComponent(c.type)}`)}
              className="group flex flex-col items-center text-center rounded-xl bg-card border border-border p-2.5 active:scale-95 transition-transform"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft text-primary group-active:bg-gradient-indigo group-active:text-primary-foreground transition-smooth">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="mt-1.5 text-[11px] font-semibold leading-tight">{c.label}</span>
              <span className="text-[10px] text-muted-foreground">{c.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TOP DEALS */}
      {topDeals.length > 0 && (
        <section className="pt-6">
          <div className="px-4">
            <SectionHeader
              icon={<TrendingUp className="h-4 w-4 text-success" />}
              title="Prijsverlagingen"
              onMore={() => nav("/zoeken")}
            />
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
                  className="snap-start shrink-0 w-44 rounded-2xl bg-card border border-border overflow-hidden text-left active:scale-[0.98] transition-transform shadow-card"
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

      {/* POPULAIRE MERKEN — chips */}
      <section className="px-4 pt-6">
        <SectionHeader title="Populaire merken" onMore={() => nav("/zoeken")} />
        <div className="flex flex-wrap gap-2">
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => nav(`/zoeken?brand=${encodeURIComponent(brand)}`)}
              className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
            >
              <BikeIcon className="h-3 w-3 text-primary" />
              {brand}
            </button>
          ))}
        </div>
      </section>

      {/* LATEST FEED — 2-koloms, zoals web grid maar compacter */}
      <section className="px-4 pt-6">
        <SectionHeader
          icon={<Clock className="h-4 w-4 text-primary" />}
          title="Nieuwste fietsen"
          onMore={() => nav("/zoeken")}
        />

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

      {/* DEALERS CTA */}
      <section className="px-4 pt-6">
        <button
          onClick={() => nav("/zoeken")}
          className="w-full rounded-2xl bg-gradient-indigo text-primary-foreground p-4 text-left shadow-elevated active:scale-[0.99] transition-transform flex items-center gap-3"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur shrink-0">
            <Store className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-bold">Geverifieerde dealers</div>
            <div className="text-[11px] text-primary-foreground/80">1.200 vakmensen bij jou in de buurt</div>
          </div>
          <ChevronRight className="h-5 w-5 opacity-70" />
        </button>
      </section>

      {/* TIPS / GIDS */}
      <section className="px-4 pt-6">
        <SectionHeader
          icon={<Newspaper className="h-4 w-4 text-primary" />}
          title="Gids &amp; tips"
        />
        <div className="space-y-2">
          {TIPS.map((t) => (
            <button
              key={t.title}
              onClick={() => nav("/info")}
              className="w-full flex items-center gap-3 rounded-xl bg-card border border-border p-3 text-left active:scale-[0.99] transition-transform"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary shrink-0">
                <t.icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{t.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{t.text}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* FOOTER MICRO */}
      <div className="px-4 pt-8 pb-4 text-center text-[10px] text-muted-foreground">
        © Fietsmarkt · Nº 1 fietsenmarkt Benelux
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  icon,
  onMore,
}: {
  title: string;
  icon?: React.ReactNode;
  onMore?: () => void;
}) => (
  <div className="flex items-end justify-between mb-3">
    <h2 className="font-display text-base font-bold inline-flex items-center gap-1.5">
      {icon}
      {title}
    </h2>
    {onMore && (
      <button onClick={onMore} className="text-xs font-semibold text-primary inline-flex items-center gap-0.5">
        Alle <ChevronRight className="h-3 w-3" />
      </button>
    )}
  </div>
);
