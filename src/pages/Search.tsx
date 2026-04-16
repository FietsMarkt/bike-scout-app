import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BikeCard, type Bike } from "@/components/BikeCard";
import { BikeGridSkeleton } from "@/components/BikeCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BIKE_TYPES, BIKE_BRANDS } from "@/lib/constants";
import { useBikes } from "@/hooks/useBikes";
import { useAuth } from "@/contexts/AuthContext";
import { createSavedSearch } from "@/lib/savedSearches";
import { useToast } from "@/hooks/use-toast";
import { SlidersHorizontal, X, Bookmark } from "lucide-react";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "Alle types";
  const brand = params.get("brand") ?? "Alle merken";
  const maxPrice = Number(params.get("maxPrice") ?? 0);
  const sort = (params.get("sort") ?? "relevance") as
    "relevance" | "price-asc" | "price-desc" | "year-desc" | "km-asc";

  const { data: results = [], isLoading } = useBikes({ q, type, brand, maxPrice, sort });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "Alle types" && value !== "Alle merken" && value !== "0" && value !== "relevance") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  useEffect(() => { document.title = `Zoeken${q ? ` · ${q}` : ""} | FietsMarkt`; }, [q]);

  const clearAll = () => setParams(new URLSearchParams());

  const saveSearch = async () => {
    if (!user) { window.location.href = "/inloggen"; return; }
    const defaultName = [type !== "Alle types" && type, brand !== "Alle merken" && brand, q].filter(Boolean).join(" ").trim() || "Mijn zoekopdracht";
    const name = prompt("Naam voor deze zoekopdracht:", defaultName);
    if (!name) return;
    setSaving(true);
    try {
      await createSavedSearch(user.id, name, { q, type, brand, maxPrice });
      toast({ title: "Zoekopdracht bewaard", description: "Je krijgt push-meldingen bij nieuwe matches." });
    } catch (e) {
      toast({ title: "Niet gelukt", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const activeFilters = [
    type !== "Alle types" && type,
    brand !== "Alle merken" && brand,
    maxPrice > 0 && `tot € ${maxPrice.toLocaleString("nl-BE")}`,
    q && `"${q}"`,
  ].filter(Boolean) as string[];

  const FilterPanel = (
    <aside className="space-y-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zoekterm</label>
        <Input className="mt-2" placeholder="bv. Trek Domane" value={q} onChange={(e) => setParam("q", e.target.value)} />
      </div>
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
      <Button variant="outline" className="w-full" onClick={clearAll}>Filters wissen</Button>
      <Button variant="hero" className="w-full gap-2" onClick={saveSearch} disabled={saving}>
        <Bookmark className="h-4 w-4" /> Zoekopdracht bewaren
      </Button>
    </aside>
  );

  return (
    <Layout>
      <div className="bg-surface border-b border-border">
        <div className="container py-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Zoeken</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? "Laden..." : `${results.length} fietsen gevonden`}</p>
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold">
                  {f}
                </span>
              ))}
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> wissen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">{FilterPanel}</div>

        <div>
          <div className="flex items-center justify-between mb-5 gap-3">
            <Button variant="outline" size="sm" className="lg:hidden gap-2" onClick={() => setOpen((o) => !o)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground hidden sm:inline">Sorteer:</span>
              <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Nieuwste</SelectItem>
                  <SelectItem value="price-asc">Prijs (laag → hoog)</SelectItem>
                  <SelectItem value="price-desc">Prijs (hoog → laag)</SelectItem>
                  <SelectItem value="year-desc">Nieuwste bouwjaar</SelectItem>
                  <SelectItem value="km-asc">Minste km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {open && (<div className="lg:hidden mb-6 p-5 rounded-xl border border-border bg-card">{FilterPanel}</div>)}

          {isLoading ? (
            <BikeGridSkeleton count={6} />
          ) : results.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">Geen fietsen gevonden met deze filters.</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>Wis filters</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((b: Bike) => (
                <Link key={b.id} to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
