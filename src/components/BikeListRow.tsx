import { Heart, MapPin, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOptimizedImage } from "@/lib/image";
import type { Bike } from "@/components/BikeCard";

const fmt = new Intl.NumberFormat("nl-BE");

const timeAgo = (createdAt?: string) => {
  if (!createdAt) return "";
  const diff = Date.now() - new Date(createdAt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}u`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return `${mo}mnd`;
};

type Props = {
  bike: Bike;
  previousPrice?: number | null;
  createdAt?: string;
};

/**
 * Horizontal list-row card optimized for app/marketplace feel (AutoScout/Vinted style).
 * Photo left (square), info right, big price.
 */
export const BikeListRow = ({ bike, previousPrice, createdAt }: Props) => {
  const { has, toggle } = useFavorites();
  const isFav = has(bike.id);
  const dropped = !!previousPrice && previousPrice > bike.price;
  const isNew = createdAt && Date.now() - new Date(createdAt).getTime() < 86400000 * 2;

  return (
    <Link
      to={`/fiets/${bike.id}`}
      className="group flex gap-3 p-2.5 bg-card border border-border rounded-xl shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="relative shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-muted">
        <img
          src={getOptimizedImage(bike.image, 320)}
          alt={bike.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {isNew && (
          <span className="absolute top-1 left-1 rounded bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            Nieuw
          </span>
        )}
        <button
          aria-label={isFav ? "Verwijder favoriet" : "Bewaar"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(bike.id); }}
          className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-card/95 backdrop-blur shadow-sm"
        >
          <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        <h3 className="font-display font-bold text-[15px] leading-snug line-clamp-2">
          {bike.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{bike.subtitle}</p>

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            <div className="font-display text-xl font-extrabold text-foreground leading-none">
              € {fmt.format(bike.price)}
            </div>
            {dropped && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                <ArrowDown className="h-3 w-3" />
                € {fmt.format((previousPrice as number) - bike.price)}
              </div>
            )}
          </div>
          <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
            <div className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {bike.location}
            </div>
            <div>{bike.year}{bike.km !== undefined ? ` · ${fmt.format(bike.km)} km` : ""}</div>
            {createdAt && <div>{timeAgo(createdAt)}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
};
