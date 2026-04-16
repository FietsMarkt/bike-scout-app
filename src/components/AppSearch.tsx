import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, SlidersHorizontal, Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { QuickFilterChips } from "@/components/QuickFilterChips";
import { BikeListRow } from "@/components/BikeListRow";
import { BIKE_TYPES, BIKE_BRANDS } from "@/lib/constants";
import { useBikes } from "@/hooks/useBikes";
import { useAuth } from "@/contexts/AuthContext";
import { createSavedSearch } from "@/lib/savedSearches";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type EnrichedRow = { id: string; previous_price: number | null; created_at: string };

/**
 * App-style search results: sticky filter bar + list-row results + sheet for filters.
 */
export const AppSearch = () => {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [enriched, setEnriched] = useState<Map<string, EnrichedRow>>(new Map());

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "Alle types";
  const brand = params.get("brand") ?? "Alle merken";
  const maxPrice = Number(params.get("maxPrice") ?? 0);
  const sort = (params.get("sort") ?? "relevance") as
    "relevance" | "price-asc" | "price-desc" | "year-desc" | "km-asc";

  const { data: results = [], isLoading } = useBikes({ q, type, brand, maxPrice, sort });

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
    if (value && value !== "Alle types" && value !== "Alle merken" && value !== "0" && value !== "relevance") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

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

  return (
    <div className="pb-4">
      {/* Sticky search header */}
      <div
        className="sticky z-30 bg-card border-b border-border"
        style={{ top: "calc(env(safe-area-inset-top) + 3rem)" }}
      >
        <div className="px-4 py-2 flex items-center gap-2">
          <button onClick={() => nav(-1)} aria-label="Terug" className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Input
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Zoek fietsen..."
            className="h-9 text-sm flex-1"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="space-y-5 mt-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                  <Select value={type} onValueChange={(v) => setParam("type", v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>{BIKE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Merk</label>
                  <Select value={brand} onValueChange={(v) => setParam("brand", v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">{BIKE_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Max prijs: {maxPrice > 0 ? `€ ${maxPrice.toLocaleString("nl-BE")}` : "geen limiet"}
                  </label>
                  <Slider className="mt-3" min={0} max={20000} step={250}
                    value={[maxPrice]} onValueChange={(v) => setParam("maxPrice", String(v[0] ?? 0))} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sorteer</label>
                  <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Nieuwste</SelectItem>
                      <SelectItem value="price-asc">Prijs (laag → hoog)</SelectItem>
                      <SelectItem value="price-desc">Prijs (hoog → laag)</SelectItem>
                      <SelectItem value="year-desc">Nieuwste bouwjaar</SelectItem>
                      <SelectItem value="km-asc">Minste km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <Button variant="outline" onClick={clearAll}>Wis filters</Button>
                  <Button variant="hero" onClick={saveSearch} className="gap-1">
                    <Bookmark className="h-4 w-4" /> Bewaar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <QuickFilterChips activeOnSearch />

        {activeFilters.length > 0 && (
          <div className="px-4 pb-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{results.length} resultaten</span>
            <button onClick={clearAll} className="ml-auto inline-flex items-center gap-1 text-primary font-semibold">
              <X className="h-3 w-3" /> wissen
            </button>
          </div>
        )}
      </div>

      {/* Results feed */}
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
};
