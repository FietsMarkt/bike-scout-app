import { Bike, Search, Heart, User, Menu, Bell, Plus, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";

const navLinks = [
  { label: "Fietsen kopen", to: "/zoeken" },
  { label: "Fiets verkopen", to: "/verkopen" },
  { label: "Onderdelen", to: "/zoeken?type=Onderdelen" },
  { label: "Dealers", to: "/dealers" },
  { label: "Magazine", to: "/magazine" },
];

export const Header = () => {
  const { count } = useFavorites();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-header text-header-foreground">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
            <Bike className="h-5 w-5" />
          </span>
          <span>Fiets<span className="text-primary">Markt</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-smooth rounded-md hover:bg-white/5 ${
                  isActive ? "text-header-foreground bg-white/10" : "text-header-foreground/80 hover:text-header-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/zoeken">
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/favorieten" className="relative hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
              <Heart className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 h-5 px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {count}
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-header-foreground hover:bg-white/10 hover:text-header-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          <Link to="/inloggen" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
              <User className="h-4 w-4" /> Inloggen
            </Button>
          </Link>
          <Link to="/plaatsen" className="hidden md:inline-flex">
            <Button variant="hero" size="sm" className="gap-1"><Plus className="h-4 w-4" /> Plaats fiets</Button>
          </Link>
          <Button
            variant="ghost" size="icon"
            className="lg:hidden text-header-foreground hover:bg-white/10 hover:text-header-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-header">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2" />
            <Link to="/favorieten" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> Favorieten</span>
              {count > 0 && <span className="rounded-full bg-primary px-2 text-xs font-bold">{count}</span>}
            </Link>
            <Link to="/inloggen" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center gap-2">
              <User className="h-4 w-4" /> Inloggen
            </Link>
            <Link to="/plaatsen" onClick={() => setMobileOpen(false)} className="mt-2">
              <Button variant="hero" className="w-full gap-1"><Plus className="h-4 w-4" /> Plaats fiets</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
