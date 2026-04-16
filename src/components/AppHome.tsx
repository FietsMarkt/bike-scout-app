import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBikes } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOptimizedImage } from "@/lib/image";

const fmt = new Intl.NumberFormat("nl-BE");

/**
 * App home — uiterst simpel: titel "Fietsmarkt", "Zoek nu"-knop, daaronder een
 * grid met fietsadvertenties. Alle filters zitten op /zoeken.
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
      {/* HEADER — alleen titel + zoekknop */}
      <section
        className="bg-gradient-hero text-header-foreground px-5 pb-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
      >
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Fiets<span className="text-primary-soft">markt</span>
        </h1>
        <Button
          onClick={() => nav("/zoeken")}
          size="lg"
          variant="hero"
          className="mt-4 w-full h-12 gap-2 rounded-xl shadow-elevated"
        >
          <Search className="h-4 w-4" />
          Zoek nu
        </Button>
      </section>

      {/* FIETSEN GRID */}
      <section className="px-3 pt-4">
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
                  <div className="relative aspect-square bg-muted">
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
                  <div className="p-2.5">
                    <div className="font-display text-sm font-bold line-clamp-1">{b.title}</div>
                    <div className="mt-1 font-display text-base font-extrabold">
                      € {fmt.format(b.price)}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{b.location}</div>
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
