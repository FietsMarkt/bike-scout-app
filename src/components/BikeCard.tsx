import { Heart, MapPin, Calendar, Gauge, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/contexts/FavoritesContext";

export type Bike = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  year: number;
  km?: number;
  motor?: string;
  location: string;
  image: string;
  badge?: string;
  dealer?: boolean;
};

const fmt = new Intl.NumberFormat("nl-NL");

export const BikeCard = ({ bike }: { bike: Bike }) => {
  const { toggle, has } = useFavorites();
  const isFav = has(bike.id);

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(bike.id);
  };

  return (
    <article className="group rounded-xl bg-card border border-border overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-smooth h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={bike.image}
          alt={bike.title}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
        />
        {bike.badge && (
          <Badge className="absolute left-3 top-3 bg-gradient-indigo border-0 shadow-elevated">
            {bike.badge}
          </Badge>
        )}
        <button
          aria-label={isFav ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
          onClick={onFav}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 backdrop-blur hover:bg-card transition-smooth"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
        </button>
        {bike.dealer && (
          <span className="absolute bottom-3 left-3 rounded-md bg-card/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
            Dealer
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-base leading-tight line-clamp-1">{bike.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{bike.subtitle}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-xl font-extrabold text-primary">€ {fmt.format(bike.price)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {bike.year}</span>
          {bike.km !== undefined && (
            <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {fmt.format(bike.km)} km</span>
          )}
          {bike.motor && (
            <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {bike.motor}</span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {bike.location}
        </div>
      </div>
    </article>
  );
};
