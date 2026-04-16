import {
  Bike, Mountain, Zap, Building2, Route, Baby, Bot, Boxes,
  Waves, Wind, Snowflake, Sailboat, Armchair, Wrench,
  HardHat, ShoppingBag,
} from "lucide-react";

const categories = [
  { label: "Racefiets", icon: Route, count: "12.4k" },
  { label: "Mountainbike", icon: Mountain, count: "9.8k" },
  { label: "E-bike", icon: Zap, count: "18.2k" },
  { label: "Stadsfiets", icon: Building2, count: "15.1k" },
  { label: "Gravel", icon: Wind, count: "4.6k" },
  { label: "Kinderfiets", icon: Baby, count: "6.3k" },
  { label: "BMX", icon: Bot, count: "1.2k" },
  { label: "Vouwfiets", icon: Boxes, count: "2.1k" },
  { label: "Bakfiets", icon: Sailboat, count: "1.9k" },
  { label: "Triatlon", icon: Waves, count: "780" },
  { label: "Cyclocross", icon: Snowflake, count: "910" },
  { label: "Hybride", icon: Bike, count: "5.4k" },
  { label: "Cruiser", icon: Armchair, count: "640" },
  { label: "Ligfiets", icon: Bike, count: "320" },
  { label: "Onderdelen", icon: Wrench, count: "22k" },
  { label: "Helmen", icon: HardHat, count: "3.8k" },
  { label: "Accessoires", icon: ShoppingBag, count: "11k" },
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
          <a href="#" className="hidden md:inline text-sm font-semibold text-primary hover:underline">
            Alle categorieën →
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {categories.map((c) => (
            <a
              key={c.label}
              href="#"
              className="group flex flex-col items-center justify-center text-center rounded-xl bg-card border border-border p-4 hover:border-primary hover:shadow-elevated transition-smooth"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary group-hover:bg-gradient-indigo group-hover:text-primary-foreground transition-smooth">
                <c.icon className="h-6 w-6" />
              </span>
              <span className="mt-3 text-sm font-semibold">{c.label}</span>
              <span className="text-xs text-muted-foreground">{c.count}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
