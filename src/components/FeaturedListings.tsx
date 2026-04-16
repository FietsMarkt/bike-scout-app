import { BikeCard } from "@/components/BikeCard";
import { bikes } from "@/data/bikes";
import { Button } from "@/components/ui/button";

export const FeaturedListings = () => {
  return (
    <section className="container py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Aanbevolen</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">Topfietsen voor jou</h2>
          <p className="text-sm text-muted-foreground mt-1">Geselecteerd op basis van populariteit deze week</p>
        </div>
        <Button variant="outline" className="hidden sm:inline-flex">Bekijk alle 84.213 fietsen</Button>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {bikes.map((b) => <BikeCard key={b.id} bike={b} />)}
      </div>
    </section>
  );
};
