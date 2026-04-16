import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trash2, Tag, MapPin, Calendar, Gauge, Bike as BikeIcon, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BikeListRow } from "@/components/BikeListRow";
import { BIKE_TYPES, BIKE_BRANDS } from "@/lib/constants";
import { useBikes } from "@/hooks/useBikes";
import { useAuth } from "@/contexts/AuthContext";
import { createSavedSearch } from "@/lib/savedSearches";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type EnrichedRow = { id: string; previous_price: number | null; created_at: string };

const fmt = new Intl.NumberFormat("nl-BE");

/**
 * App-style search: AutoScout24-achtige filterlijst. Bij geen resultaten = filter UI;
 * met actieve filters of na klik op "Toon" = resultatenlijst.
 */
export const AppSearch = () => {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [enriched, setEnriched] = useState<Map<string, EnrichedRow>>(new Map());
  const [showResults, setShowResults] = useState<boolean>(() => params.toString().length > 0);

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "Alle types";
  const brand = params.get("brand") ?? "Alle merken";
  const maxPrice = Number(params.get("maxPrice") ?? 0);
  const city = params.get("city") ?? "";
  const motor = params.get("motor") ?? "Alle";
  const minYear = Number(params.get("minYear") ?? 0);
  const maxKm = Number(params.get("maxKm") ?? 0);
  const sort = (params.get("sort") ?? "relevance") as
    "relevance" | "price-asc" | "price-desc" | "year-desc" | "km-asc";

  const { data: results = [], isLoading } = useBikes({
    q, type, brand, maxPrice, city, motor, minYear, maxKm, sort,
  });

  useEffect(() => {
    if (results.length === 0) return;
    supabase
      .from("bikes")
      .select("id, previous_price, created_at")
      .in("id", results.map((b) => b.id))
      .then(({ data }) => {
        if (data) setEnriched(new Map(data.map((r) => [r.id, r as EnrichedRow])));
      });
  }, [results]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const empties = ["Alle types", "Alle merken", "Alle", "0", "relevance", ""];
    if (value && !empties.includes(value)) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const clearAll = () => { setParams(new URLSearchParams()); setShowResults(false); };

  const activeFilters = [
    type !== "Alle types" && type,
    brand !== "Alle merken" && brand,
    maxPrice > 0 && `tot € ${maxPrice.toLocaleString("nl-BE")}`,
    q && `"${q}"`,
  ].filter(Boolean) as string[];

  const saveSearch = async () => {
    if (!user) { nav("/inloggen"); return; }
    const defaultName = activeFilters.join(" ").trim() || "Mijn zoekopdracht";
    const name = prompt("Naam voor deze zoekopdracht:", defaultName);
    if (!name) return;
    try {
      await createSavedSearch(user.id, name, { q, type, brand, maxPrice });
      toast({ title: "Bewaard", description: "Je krijgt push bij nieuwe matches." });
    } catch (e) {
      toast({ title: "Niet gelukt", description: (e as Error).message, variant: "destructive" });
    }
  };

  // RESULTATEN-WEERGAVE
  if (showResults) {
    return (
      <div className="pb-4 bg-surface min-h-screen">
        <div
          className="sticky z-30 bg-header text-header-foreground border-b border-border/20"
          style={{ top: 0, paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        >
          <div className="px-4 pb-3 flex items-center gap-3">
            <button onClick={() => setShowResults(false)} className="flex items-center gap-1 text-sm font-semibold">
              <ChevronLeft className="h-5 w-5" /> Filters
            </button>
            <div className="ml-auto text-xs text-header-foreground/70">
              {isLoading ? "..." : `${fmt.format(results.length)} resultaten`}
            </div>
            <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
              <SelectTrigger className="h-8 w-[130px] text-xs bg-card text-foreground border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Nieuwste</SelectItem>
                <SelectItem value="price-asc">Prijs ↑</SelectItem>
                <SelectItem value="price-desc">Prijs ↓</SelectItem>
                <SelectItem value="year-desc">Bouwjaar</SelectItem>
                <SelectItem value="km-asc">Minste km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-4 pt-3 space-y-2.5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-2.5 bg-card border border-border rounded-xl">
                <div className="w-28 h-28 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-5 bg-muted rounded animate-pulse w-1/3 mt-auto" />
                </div>
              </div>
            ))
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              Geen fietsen gevonden.
              <Button variant="outline" size="sm" className="mt-3 mx-auto block" onClick={clearAll}>
                Wis filters
              </Button>
            </div>
          ) : (
            results.map((b) => {
              const e = enriched.get(b.id);
              return <BikeListRow key={b.id} bike={b} previousPrice={e?.previous_price} createdAt={e?.created_at} />;
            })
          )}
        </div>
      </div>
    );
  }

  // FILTER-WEERGAVE (AutoScout-stijl)
  return (
    <div className="pb-32 bg-header text-header-foreground min-h-screen">
      <div
        className="px-4 pb-4 flex items-center"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm font-semibold">
          <ChevronLeft className="h-5 w-5" /> Terug
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-display text-base font-bold">Filters</h1>
        <button onClick={clearAll} className="ml-auto flex items-center gap-1 text-xs font-semibold opacity-80">
          Alles wis <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-4 space-y-2.5">
        <FilterRow icon={BikeIcon} label="Type" value={type !== "Alle types" ? type : undefined}
          options={BIKE_TYPES} onChange={(v) => setParam("type", v)} current={type} />

        <FilterRow icon={Tag} label="Merk" value={brand !== "Alle merken" ? brand : undefined}
          options={BIKE_BRANDS} onChange={(v) => setParam("brand", v)} current={brand} maxHeight />

        <PriceRow maxPrice={maxPrice} onChange={(v) => setParam("maxPrice", String(v))} />

        <CityRow city={city} onChange={(v) => setParam("city", v)} />
        <MotorRow motor={motor} onChange={(v) => setParam("motor", v)} />
        <YearRow minYear={minYear} onChange={(v) => setParam("minYear", String(v))} />
        <KmRow maxKm={maxKm} onChange={(v) => setParam("maxKm", String(v))} />

        <button
          onClick={saveSearch}
          className="w-full mt-4 text-center text-xs font-semibold underline opacity-80"
        >
          Zoekopdracht bewaren
        </button>
      </div>

      {/* CTA onderaan */}
      <div
        className="fixed bottom-0 inset-x-0 bg-header border-t border-border/20 px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
      >
        <button
          onClick={() => setShowResults(true)}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-display text-base font-bold shadow-elevated active:scale-[0.99] transition-transform"
        >
          Toon {isLoading ? "..." : fmt.format(results.length)} aanbiedingen
        </button>
      </div>
    </div>
  );
};

const FilterRow = ({
  icon: Icon, label, value, options, onChange, current, maxHeight,
}: {
  icon: typeof BikeIcon; label: string; value?: string;
  options: readonly string[]; onChange: (v: string) => void; current: string; maxHeight?: boolean;
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <button className="w-full flex items-center gap-3 rounded-xl bg-card/10 border border-border/10 p-4 text-left active:bg-card/20 transition-colors">
        <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-base font-semibold">{label}</div>
          {value && (
            <div className="mt-1 inline-block rounded-md bg-card/15 px-2 py-0.5 text-xs">{value}</div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 opacity-60" />
      </button>
    </SheetTrigger>
    <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
      <SheetHeader><SheetTitle>{label}</SheetTitle></SheetHeader>
      <div className={`mt-4 space-y-1 ${maxHeight ? "max-h-[55vh] overflow-y-auto" : ""}`}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-3 py-3 rounded-lg text-sm ${
              current === opt ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

const ChipGrid = ({
  options, current, onPick,
}: {
  options: { label: string; value: number }[];
  current: number;
  onPick: (v: number) => void;
}) => (
  <div className="grid grid-cols-2 gap-2">
    {options.map((o) => {
      const active = current === o.value;
      return (
        <button
          key={o.label}
          onClick={() => onPick(o.value)}
          className={`px-3 py-3 rounded-xl border text-sm font-semibold transition-colors ${
            active
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/10 border-border/20 hover:bg-card/20"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const PRICE_CHIPS = [
  { label: "Alle", value: 0 },
  { label: "tot € 500", value: 500 },
  { label: "tot € 1.000", value: 1000 },
  { label: "tot € 2.500", value: 2500 },
  { label: "tot € 5.000", value: 5000 },
  { label: "tot € 10.000", value: 10000 },
];

const PriceRow = ({ maxPrice, onChange }: { maxPrice: number; onChange: (v: number) => void }) => (
  <Sheet>
    <SheetTrigger asChild>
      <button className="w-full flex items-center gap-3 rounded-xl bg-card/10 border border-border/10 p-4 text-left active:bg-card/20 transition-colors">
        <span className="grid h-5 w-5 place-items-center text-base shrink-0 opacity-90">€</span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-base font-semibold">Prijs</div>
          {maxPrice > 0 && (
            <div className="mt-1 inline-block rounded-md bg-card/15 px-2 py-0.5 text-xs">
              tot € {maxPrice.toLocaleString("nl-BE")}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 opacity-60" />
      </button>
    </SheetTrigger>
    <SheetContent side="bottom" className="rounded-t-2xl p-4 pt-3">
      <SheetHeader><SheetTitle className="text-base">Maximale prijs</SheetTitle></SheetHeader>
      <div className="mt-3">
        <ChipGrid options={PRICE_CHIPS} current={maxPrice} onPick={onChange} />
      </div>
    </SheetContent>
  </Sheet>
);

const RowShell = ({
  icon: Icon, label, value, children,
}: {
  icon: typeof BikeIcon; label: string; value?: string; children: React.ReactNode;
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <button className="w-full flex items-center gap-3 rounded-xl bg-card/10 border border-border/10 p-4 text-left active:bg-card/20 transition-colors">
        <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <div className="font-display text-base font-semibold">{label}</div>
          {value && (
            <div className="mt-1 inline-block rounded-md bg-card/15 px-2 py-0.5 text-xs">{value}</div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 opacity-60" />
      </button>
    </SheetTrigger>
    <SheetContent side="bottom" className="rounded-t-2xl p-4 pt-3">
      <SheetHeader><SheetTitle className="text-base">{label}</SheetTitle></SheetHeader>
      <div className="mt-3 px-1">{children}</div>
    </SheetContent>
  </Sheet>
);

const CityRow = ({ city, onChange }: { city: string; onChange: (v: string) => void }) => (
  <RowShell icon={MapPin} label="Plaats" value={city || undefined}>
    <Input
      value={city}
      onChange={(e) => onChange(e.target.value)}
      placeholder="bv. Antwerpen"
      autoFocus
      className="h-12"
    />
    <p className="mt-2 text-xs text-muted-foreground">Filtert op stadsnaam.</p>
  </RowShell>
);

const MOTOR_OPTIONS = ["Alle", "E-bike", "Geen"];

const MotorRow = ({ motor, onChange }: { motor: string; onChange: (v: string) => void }) => (
  <RowShell icon={Zap} label="Motor / E-bike" value={motor !== "Alle" ? motor : undefined}>
    <div className="space-y-1">
      {MOTOR_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`w-full text-left px-3 py-3 rounded-lg text-sm ${
            motor === opt ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </RowShell>
);

const YEAR_CHIPS = [
  { label: "Alle", value: 0 },
  { label: "vanaf 2024", value: 2024 },
  { label: "vanaf 2022", value: 2022 },
  { label: "vanaf 2020", value: 2020 },
  { label: "vanaf 2015", value: 2015 },
  { label: "vanaf 2010", value: 2010 },
];

const YearRow = ({ minYear, onChange }: { minYear: number; onChange: (v: number) => void }) => (
  <RowShell
    icon={Calendar}
    label="Bouwjaar"
    value={minYear > 0 ? `vanaf ${minYear}` : undefined}
  >
    <ChipGrid options={YEAR_CHIPS} current={minYear} onPick={onChange} />
  </RowShell>
);

const KM_CHIPS = [
  { label: "Alle", value: 0 },
  { label: "tot 1.000 km", value: 1000 },
  { label: "tot 5.000 km", value: 5000 },
  { label: "tot 10.000 km", value: 10000 },
  { label: "tot 25.000 km", value: 25000 },
  { label: "tot 50.000 km", value: 50000 },
];

const KmRow = ({ maxKm, onChange }: { maxKm: number; onChange: (v: number) => void }) => (
  <RowShell
    icon={Gauge}
    label="Kilometerstand"
    value={maxKm > 0 ? `tot ${maxKm.toLocaleString("nl-BE")} km` : undefined}
  >
    <ChipGrid options={KM_CHIPS} current={maxKm} onPick={onChange} />
  </RowShell>
);
