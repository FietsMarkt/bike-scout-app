import { Bike } from "lucide-react";

const cols = [
  {
    title: "Kopen",
    links: ["Alle fietsen", "Racefietsen", "E-bikes", "Mountainbikes", "Gravel", "Bakfietsen", "Vouwfietsen"],
  },
  {
    title: "Verkopen",
    links: ["Plaats een advertentie", "Verkoopgids", "Prijsindicator", "Voor dealers", "Adverteren"],
  },
  {
    title: "Service",
    links: ["FietsGarant®", "Bezorging", "Verzekering", "Inruil", "Klantenservice", "Help & FAQ"],
  },
  {
    title: "Bedrijf",
    links: ["Over ons", "Magazine", "Carrière", "Pers", "Contact"],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-header text-header-foreground mt-8">
      <div className="container py-14 grid gap-10 md:grid-cols-5">
        <div>
          <a href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
              <Bike className="h-5 w-5" />
            </span>
            <span>Fiets<span className="text-primary">Markt</span></span>
          </a>
          <p className="mt-4 text-sm text-header-foreground/70 max-w-xs">
            De grootste online marktplaats voor nieuwe en gebruikte fietsen in de Benelux.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-bold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-header-foreground/70 hover:text-header-foreground transition-smooth">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-header-foreground/60">
          <span>© {new Date().getFullYear()} FietsMarkt. Alle rechten voorbehouden.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-header-foreground">Privacy</a>
            <a href="#" className="hover:text-header-foreground">Voorwaarden</a>
            <a href="#" className="hover:text-header-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
