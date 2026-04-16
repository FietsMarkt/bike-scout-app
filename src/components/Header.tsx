import { Bike, Search, Heart, User, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Fietsen kopen", href: "#kopen" },
  { label: "Fiets verkopen", href: "#verkopen" },
  { label: "Onderdelen", href: "#onderdelen" },
  { label: "Dealers", href: "#dealers" },
  { label: "Magazine", href: "#magazine" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-header text-header-foreground">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
            <Bike className="h-5 w-5" />
          </span>
          <span>Fiets<span className="text-primary">Markt</span></span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-smooth rounded-md hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-header-foreground hover:bg-white/10 hover:text-header-foreground">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-header-foreground hover:bg-white/10 hover:text-header-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
            <User className="h-4 w-4" /> Inloggen
          </Button>
          <Button variant="hero" size="sm" className="hidden md:inline-flex">
            + Plaats fiets
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden text-header-foreground hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
