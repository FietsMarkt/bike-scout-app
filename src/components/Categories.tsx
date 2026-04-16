import { Link } from "react-router-dom";
import {
  Bike, Mountain, Zap, Building2, Route, Baby, Bot, Boxes,
  Waves, Wind, Snowflake, Sailboat, Armchair, Wrench,
  HardHat, ShoppingBag,
} from "lucide-react";

const categories = [
  { label: "Racefiets", icon: Route, count: "12.4k", type: "Racefiets" },
  { label: "Mountainbike", icon: Mountain, count: "9.8k", type: "Mountainbike" },
  { label: "E-bike", icon: Zap, count: "18.2k", type: "E-bike" },
  { label: "Stadsfiets", icon: Building2, count: "15.1k", type: "Stadsfiets" },
  { label: "Gravel", icon: Wind, count: "4.6k", type: "Gravel" },
  { label: "Kinderfiets", icon: Baby, count: "6.3k", type: "Kinderfiets" },
  { label: "BMX", icon: Bot, count: "1.2k", type: "BMX" },
  { label: "Vouwfiets", icon: Boxes, count: "2.1k", type: "Vouwfiets" },
  { label: "Bakfiets", icon: Sailboat, count: "1.9k", type: "Bakfiets" },
  { label: "Triatlon", icon: Waves, count: "780", type: "Triatlon" },
  { label: "Cyclocross", icon: Snowflake, count: "910", type: "Cyclocross" },
  { label: "Hybride", icon: Bike, count: "5.4k", type: "Hybride" },
  { label: "Cruiser", icon: Armchair, count: "640", type: "Cruiser" },
  { label: "Ligfiets", icon: Bike, count: "320", type: "Ligfiets" },
  { label: "Onderdelen", icon: Wrench, count: "22k", type: "Onderdelen" },
  { label: "Helmen", icon: HardHat, count: "3.8k", type: "Helmen" },
  { label: "Accessoires", icon: ShoppingBag, count: "11k", type: "Accessoires" },
];

export const Categories = () => {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Bladeren per categorie</h2>
            <p className="text-sm text-muted-foreground mt-1">Vind precies de fiets die bij jou past</p>
          </div>
          <Link to="/zoeken" className="hidden md:inline text-sm font-semibold text-primary hover:underline">
            Alle categorieën →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {categories.map((c) => (
            <Link
              key={c.label}
              to={`/zoeken?type=${encodeURIComponent(c.type)}`}
              className="group flex flex-col items-center justify-center text-center rounded-xl bg-card border border-border p-4 hover:border-primary hover:shadow-elevated transition-smooth"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary group-hover:bg-gradient-indigo group-hover:text-primary-foreground transition-smooth">
                <c.icon className="h-6 w-6" />
              </span>
              <span className="mt-3 text-sm font-semibold">{c.label}</span>
              <span className="text-xs text-muted-foreground">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
