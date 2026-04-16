import { Link } from "react-router-dom";
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
        <Link to="/zoeken" className="hidden sm:inline-flex">
          <Button variant="outline">Bekijk alle 84.213 fietsen</Button>
        </Link>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {bikes.map((b) => (
          <Link key={b.id} to={`/fiets/${b.id}`} className="block">
            <BikeCard bike={b} />
          </Link>
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link to="/zoeken"><Button variant="outline" className="w-full">Bekijk alle 84.213 fietsen</Button></Link>
      </div>
    </section>
  );
};
