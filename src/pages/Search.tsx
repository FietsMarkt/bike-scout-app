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
import { AppSearch } from "@/components/AppSearch";

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

  return <Layout><AppSearch /></Layout>;

};

export default Search;
