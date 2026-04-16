import { Link } from "react-router-dom";
import { Bike } from "lucide-react";

const cols = [
  {
    title: "Kopen",
    links: [
      { label: "Alle fietsen", to: "/zoeken" },
      { label: "Racefietsen", to: "/zoeken?type=Racefiets" },
      { label: "E-bikes", to: "/zoeken?type=E-bike" },
      { label: "Mountainbikes", to: "/zoeken?type=Mountainbike" },
      { label: "Gravel", to: "/zoeken?type=Gravel" },
      { label: "Bakfietsen", to: "/zoeken?type=Bakfiets" },
      { label: "Vouwfietsen", to: "/zoeken?type=Vouwfiets" },
    ],
  },
  {
    title: "Verkopen",
    links: [
      { label: "Plaats een advertentie", to: "/plaatsen" },
      { label: "Verkoopgids", to: "/verkopen" },
      { label: "Voor dealers", to: "/dealers" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Favorieten", to: "/favorieten" },
      { label: "Inloggen", to: "/inloggen" },
      { label: "Magazine", to: "/magazine" },
    ],
  },
  {
    title: "Bedrijf",
    links: [
      { label: "Over ons", to: "/magazine" },
      { label: "Contact", to: "/magazine" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-header text-header-foreground mt-8">
      <div className="container py-14 grid gap-10 md:grid-cols-5">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
              <Bike className="h-5 w-5" />
            </span>
            <span>Fiets<span className="text-primary">Markt</span></span>
          </Link>
          <p className="mt-4 text-sm text-header-foreground/70 max-w-xs">
            De grootste online marktplaats voor nieuwe en gebruikte fietsen in de Benelux.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-bold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-header-foreground/70 hover:text-header-foreground transition-smooth">{l.label}</Link>
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
            <Link to="/magazine" className="hover:text-header-foreground">Privacy</Link>
            <Link to="/magazine" className="hover:text-header-foreground">Voorwaarden</Link>
            <Link to="/magazine" className="hover:text-header-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
