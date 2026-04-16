import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Bike } from "lucide-react";
import { useBikes } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOptimizedImage } from "@/lib/image";

const fmt = new Intl.NumberFormat("nl-BE");

/**
 * App home — header zoals webversie (logo + naam) + grote "Zoek nu"-knop + grid.
 */
export const AppHome = () => {
  const nav = useNavigate();
  const fav = useFavorites();
  const { data: latest = [], isLoading } = useBikes({ sort: "relevance" });

  useEffect(() => {
    document.title = "Fietsmarkt";
  }, []);

  return (
    <div className="pb-2 bg-background min-h-screen">
      {/* HEADER — modern, minimal, fijn lettertype */}
      <section
        className="bg-background px-5 pb-5 border-b border-border/40"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}
      >
        <div className="flex items-center justify-center gap-3 font-display text-3xl font-extrabold">
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
          <span className="text-[15px] font-normal text-muted-foreground">Zoek nu</span>
        </button>
      </section>

      {/* LAATST BEKEKEN */}
      <section className="px-3 pt-5">
        <h2 className="px-1 mb-3 font-display text-xl font-extrabold">Laatst gezocht</h2>

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
