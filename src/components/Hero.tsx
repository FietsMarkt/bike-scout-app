import heroBike from "@/assets/hero-bike.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

const types = ["Alle types", "Racefiets", "Mountainbike", "E-bike", "Stadsfiets", "Gravel", "Bakfiets", "Vouwfiets"];
const brands = ["Alle merken", "Trek", "Specialized", "Giant", "Canyon", "Cube", "Cannondale", "Bianchi", "Stromer", "Riese & Müller"];
const prices = ["Geen limiet", "€ 500", "€ 1.000", "€ 2.500", "€ 5.000", "€ 10.000"];

export const Hero = () => {
  const [tab, setTab] = useState<"kopen" | "verkopen">("kopen");

  return (
    <section className="relative bg-header text-header-foreground overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBike}
          alt="Premium gravel fiets tegen minimalistische muur"
          className="h-full w-full object-cover opacity-40"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      <div className="container relative py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            Nº 1 fietsenmarkt van de Benelux
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.05]">
            Vind jouw <span className="text-primary">perfecte fiets</span>
          </h1>
          <p className="mt-4 text-lg text-header-foreground/80 max-w-xl">
            Meer dan 84.000 nieuwe en gebruikte fietsen van particulieren en dealers.
          </p>
        </div>

        {/* Search card */}
        <div className="mt-10 rounded-2xl bg-card text-card-foreground shadow-elevated overflow-hidden max-w-5xl">
          <div className="flex border-b border-border">
            {(["kopen", "verkopen"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold transition-smooth border-b-2 ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "kopen" ? "Fiets kopen" : "Fiets verkopen"}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <Select defaultValue={types[0]}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground">Merk</label>
              <Select defaultValue={brands[0]}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Prijs tot</label>
              <Select defaultValue={prices[0]}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{prices.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Postcode</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="h-11 pl-9" placeholder="1011 AB" />
              </div>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button variant="hero" size="lg" className="w-full h-11 gap-2">
                <Search className="h-4 w-4" /> Zoeken
              </Button>
            </div>
          </div>

          <div className="px-6 pb-5 -mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>84.213 resultaten</span>
            <a href="#" className="text-primary font-semibold hover:underline">Geavanceerd zoeken</a>
            <a href="#" className="text-primary font-semibold hover:underline">Bewaarde zoekopdrachten</a>
          </div>
        </div>
      </div>
    </section>
  );
};
