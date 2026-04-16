import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Heart, Bike, Flame, TrendingDown } from "lucide-react";
import { useBikes } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOptimizedImage } from "@/lib/image";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";

const fmt = new Intl.NumberFormat("nl-BE");

type DealRow = {
  id: string;
  title: string;
  price: number;
  previous_price: number | null;
  city: string;
  year: number;
  km: number | null;
  images: string[];
};

/**
 * App home — header + grote "Zoek nu"-knop + Deal van de week + grid.
 */
export const AppHome = () => {
  const nav = useNavigate();
  const fav = useFavorites();
  const { t } = useTranslation();
  const { data: latest = [], isLoading } = useBikes({ sort: "relevance" });
  const [deal, setDeal] = useState<DealRow | null>(null);

  useEffect(() => {
    document.title = "Fietsmarkt";
  }, []);

  // Zoek de fiets met de grootste prijsdaling.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("bikes")
        .select("id, title, price, previous_price, city, year, km, images")
        .eq("status", "active")
        .not("previous_price", "is", null)
        .limit(50);
      if (cancelled || !data) return;
      const best = (data as DealRow[])
        .filter((b) => b.previous_price && b.previous_price > b.price)
        .sort((a, b) => {
          const dropA = ((a.previous_price ?? 0) - a.price) / (a.previous_price ?? 1);
          const dropB = ((b.previous_price ?? 0) - b.price) / (b.previous_price ?? 1);
          return dropB - dropA;
        })[0];
      setDeal(best ?? null);
    })();
    return () => { cancelled = true; };
  }, []);

  const dealDrop = useMemo(() => {
    if (!deal?.previous_price) return null;
    const diff = deal.previous_price - deal.price;
    const pct = Math.round((diff / deal.previous_price) * 100);
    return { diff, pct };
  }, [deal]);

  return (
    <div className="pb-2 bg-background min-h-screen">
      {/* HEADER */}
      <section
        className="bg-background px-5 pb-5 border-b border-border/40 relative"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}
      >
        <div
          className="absolute right-3"
          style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        >
          <LanguageSwitcher variant="default" />
        </div>

        <div className="mt-2 flex items-center justify-center gap-3 font-display text-3xl font-extrabold">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-indigo">
            <Bike className="h-7 w-7 text-primary-foreground" />
          </span>
          <span>Fiets<span style={{ color: "hsl(239 84% 60%)" }}>Markt</span></span>
        </div>

        <button
          onClick={() => nav("/zoeken")}
          className="mt-5 w-full h-[52px] rounded-2xl bg-card border border-border/60 flex items-center justify-center gap-3 active:scale-[0.99] transition-transform"
        >
          <Search className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} />
          <span className="text-[15px] font-normal text-muted-foreground">{t("app.searchNow")}</span>
        </button>
      </section>

      {/* DEAL VAN DE WEEK */}
      {deal && dealDrop && dealDrop.diff > 0 && (
        <section className="px-3 pt-5">
          <div className="px-1 mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">{t("app.dealOfWeek")}</h2>
          </div>
          <button
            onClick={() => nav(`/fiets/${deal.id}`)}
            className="w-full text-left rounded-3xl overflow-hidden bg-card border border-border shadow-elevated active:scale-[0.99] transition-transform relative"
          >
            <div className="relative aspect-[16/10] bg-muted">
              <img
                src={getOptimizedImage(deal.images?.[0] ?? "", 800)}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Discount badge */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-extrabold shadow-lg">
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                −{dealDrop.pct}%
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                <div className="font-display text-lg font-bold line-clamp-1">{deal.title}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-extrabold">€ {fmt.format(deal.price)}</span>
                  <span className="text-sm line-through opacity-70">€ {fmt.format(deal.previous_price!)}</span>
                </div>
                <div className="mt-1 text-xs opacity-90">{deal.city} · {deal.year}{deal.km ? ` · ${fmt.format(deal.km)} km` : ""}</div>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* LAATST BEKEKEN */}
      <section className="px-3 pt-5">
        <h2 className="px-1 mb-3 font-display text-xl font-extrabold">{t("app.lastSearched")}</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
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
            {latest.map((b) => {
              const isFav = fav.has(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => nav(`/fiets/${b.id}`)}
                  className="rounded-2xl bg-card border border-border overflow-hidden text-left active:scale-[0.98] transition-transform shadow-card"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <img
                      src={getOptimizedImage(b.image, 400)}
                      alt={b.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        fav.toggle(b.id);
                      }}
                      className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 backdrop-blur"
                      aria-label="Favoriet"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-sm font-bold line-clamp-1">{b.title}</div>
                    <div className="mt-1 font-display text-base font-extrabold">
                      € {fmt.format(b.price)}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                      {b.km ? `${fmt.format(b.km)} km` : ""}{b.km && b.year ? ", " : ""}{b.year ?? ""}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{b.location}</div>
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
