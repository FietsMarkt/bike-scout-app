import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BikeCard, type Bike } from "@/components/BikeCard";
import { Button } from "@/components/ui/button";
import { fetchBikes } from "@/lib/bikes";

export const FeaturedListings = () => {
  const { t } = useTranslation();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBikes({ sort: "relevance" })
      .then((list) => setBikes(list.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("featured.kicker")}</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">{t("featured.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("featured.subtitle")}</p>
        </div>
        <Link to="/zoeken" className="hidden sm:inline-flex">
          <Button variant="outline">{t("featured.viewAll")}</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : bikes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">{t("featured.empty")}</p>
          <Link to="/plaatsen"><Button variant="hero" className="mt-4">{t("featured.placeFirst")}</Button></Link>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bikes.map((b) => (
            <Link key={b.id} to={`/fiets/${b.id}`} className="block">
              <BikeCard bike={b} />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm:hidden">
        <Link to="/zoeken"><Button variant="outline" className="w-full">{t("featured.viewAll")}</Button></Link>
      </div>
    </section>
  );
};
