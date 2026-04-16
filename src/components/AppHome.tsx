import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickFilterChips } from "@/components/QuickFilterChips";
import { BikeListRow } from "@/components/BikeListRow";
import { useBikes, useBikeCount } from "@/hooks/useBikes";
import { supabase } from "@/integrations/supabase/client";

type EnrichedBike = Awaited<ReturnType<typeof fetchEnriched>>[number];

const fetchEnriched = async () => {
  const { data } = await supabase
    .from("bikes")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
};

/**
 * App-style home: zoekbalk → quick chips → list-feed van fietsen.
 * Native marktplaats-feel (AutoScout/Vinted), geen marketing-tagline.
 */
export const AppHome = () => {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const { data: count } = useBikeCount();
  const { data: latest = [], isLoading } = useBikes({ sort: "relevance" });
  const [enriched, setEnriched] = useState<EnrichedBike[]>([]);

  useEffect(() => {
    let active = true;
    fetchEnriched().then((d) => active && setEnriched(d));
    return () => { active = false; };
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    nav(`/zoeken${usp.toString() ? `?${usp.toString()}` : ""}`);
  };

  const enrichedById = new Map(enriched.map((b) => [b.id, b]));

  return (
    <div className="pb-2">
      {/* Search section */}
      <section className="bg-header text-header-foreground px-4 pt-3 pb-4">
        <form onSubmit={onSearch} className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek merk, model of trefwoord"
              className="pl-9 h-11 bg-card border-0 text-foreground"
            />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Postcode"
                inputMode="numeric"
                maxLength={4}
                className="pl-9 h-11 bg-card border-0 text-foreground"
              />
            </div>
            <Button type="submit" size="lg" variant="hero" className="h-11 px-6">
              Zoek
            </Button>
          </div>
          <p className="text-xs text-header-foreground/70 text-center pt-1">
            {count ? `${count.toLocaleString("nl-BE")} fietsen beschikbaar` : "Doorzoek alle fietsen"}
          </p>
        </form>
      </section>

      {/* Quick filter chips */}
      <div className="px-4 border-b border-border">
        <QuickFilterChips />
      </div>

      {/* Feed */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold">Nieuwste fietsen</h2>
          <button
            onClick={() => nav("/zoeken")}
            className="text-xs font-semibold text-primary"
          >
            Alle bekijken →
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-2.5 bg-card border border-border rounded-xl">
                <div className="w-28 h-28 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-5 bg-muted rounded animate-pulse w-1/3 mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Nog geen fietsen geplaatst.
          </div>
        ) : (
          <div className="space-y-2.5">
            {latest.slice(0, 15).map((b) => {
              const raw = enrichedById.get(b.id);
              return (
                <BikeListRow
                  key={b.id}
                  bike={b}
                  previousPrice={raw?.previous_price}
                  createdAt={raw?.created_at}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
