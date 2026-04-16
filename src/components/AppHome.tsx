import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import { useBikes } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOptimizedImage } from "@/lib/image";

const fmt = new Intl.NumberFormat("nl-BE");

/**
 * App home — AutoScout24-stijl: titel, grote "Zoek nu"-knop, daaronder grid.
 */
export const AppHome = () => {
  const nav = useNavigate();
  const fav = useFavorites();
  const { data: latest = [], isLoading } = useBikes({ sort: "relevance" });

  useEffect(() => {
    document.title = "Fietsmarkt";
  }, []);

  return (
    <div className="-mt-12 pb-2 bg-surface min-h-screen">
      {/* HEADER */}
      <section
        className="bg-header text-header-foreground px-5 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)" }}
      >
        <h1 className="text-center font-display text-2xl font-extrabold tracking-tight">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md">Fiets</span>
          <span className="ml-1">Markt</span>
        </h1>

        <button
          onClick={() => nav("/zoeken")}
          className="mt-5 w-full h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-3 shadow-elevated active:scale-[0.99] transition-transform"
        >
          <Search className="h-5 w-5" strokeWidth={2.5} />
          <span className="font-display text-lg font-bold">Zoek nu</span>
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
