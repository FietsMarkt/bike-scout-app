import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Mail, MapPin, Calendar, Gauge, Zap, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBike, useSellerProfile } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation } from "@/lib/chat";
import { PhotoGallery } from "@/components/PhotoGallery";
import { haptic } from "@/lib/haptic";

const fmt = new Intl.NumberFormat("nl-BE");

/**
 * App-style bike detail: full-bleed photo carousel with dots, sticky CTA bar at bottom,
 * floating back/share/heart buttons over the image.
 */
export const AppBikeDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const fav = useFavorites();
  const { user } = useAuth();
  const { data: res, isLoading } = useBike(id);
  const bike = res?.bike;
  const raw = res?.raw;
  const sellerId = raw?.user_id as string | undefined;
  const { data: seller } = useSellerProfile(sellerId);
  const [contacting, setContacting] = useState(false);

  useEffect(() => { if (bike) document.title = `${bike.title} | FietsMarkt`; }, [bike]);

  if (isLoading) {
    return <div className="px-4 py-20 text-center text-sm text-muted-foreground">Laden…</div>;
  }
  if (!bike || !raw) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="font-display text-xl font-bold">Niet gevonden</h1>
        <Button onClick={() => nav("/zoeken")} variant="outline" className="mt-3">Terug</Button>
      </div>
    );
  }

  const images = ((raw.images as string[]) ?? []).length > 0 ? (raw.images as string[]) : [bike.image];
  const description = (raw.description as string) || `Deze ${bike.title.toLowerCase()} is in goede staat. Te bezichtigen op afspraak in ${bike.location}.`;
  const sellerName = seller?.display_name ?? "Verkoper";
  const previousPrice = raw.previous_price as number | null;
  const dropped = previousPrice && previousPrice > bike.price;
  const isFav = fav.has(bike.id);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: bike.title, url }); return; } catch { /* ignore */ }
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Link gekopieerd" });
  };

  const startChat = async () => {
    if (!user) { nav("/inloggen"); return; }
    if (!sellerId) return;
    if (sellerId === user.id) { toast({ title: "Dit is je eigen advertentie" }); return; }
    setContacting(true);
    try {
      const conv = await getOrCreateConversation(bike.id, sellerId, user.id);
      if (conv) nav(`/berichten/${conv.id}`);
      else toast({ title: "Niet gelukt", variant: "destructive" });
    } finally { setContacting(false); }
  };

  return (
    <div className="-mt-12 pb-24">
      {/* Full-bleed swipeable photo gallery + lightbox */}
      <div className="relative">
        <PhotoGallery images={images} alt={bike.title} topInset />

        {/* Floating top bar */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between p-3 z-10"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <button
            onClick={() => {
              haptic("light");
              if (window.history.length > 1) nav(-1);
              else nav("/");
            }}
            aria-label="Terug"
            className="grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur shadow-md active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { haptic("light"); onShare(); }}
              aria-label="Delen"
              className="grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur shadow-md active:scale-95 transition-transform"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => fav.toggle(bike.id)}
              aria-label={isFav ? "Verwijder favoriet" : "Bewaar"}
              className="grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur shadow-md active:scale-95 transition-transform"
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold">€ {fmt.format(bike.price)}</span>
            {dropped && (
              <span className="text-sm line-through text-muted-foreground">
                € {fmt.format(previousPrice as number)}
              </span>
            )}
          </div>
          <h1 className="font-display text-lg font-bold leading-tight mt-1">{bike.title}</h1>
          <p className="text-sm text-muted-foreground">{bike.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground border-y border-border py-3">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {bike.year}</span>
          {bike.km !== undefined && (
            <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {fmt.format(bike.km)} km</span>
          )}
          {bike.motor && (
            <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {bike.motor}</span>
          )}
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {bike.location}</span>
        </div>

        <section>
          <h2 className="font-display font-bold text-sm mb-2">Beschrijving</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-sm mb-2">Specificaties</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-xs">
            {[
              ["Merk", raw.brand as string],
              ["Model", raw.model as string],
              ["Type", raw.type as string],
              ["Bouwjaar", String(bike.year)],
              ["Km", bike.km !== undefined ? `${fmt.format(bike.km)} km` : "—"],
              ["Motor", bike.motor ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {sellerId && (
          <Link
            to={`/verkoper/${sellerId}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card active:scale-[0.99] transition-transform"
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-indigo text-white font-bold overflow-hidden shrink-0">
              {seller?.avatar_url
                ? <img src={seller.avatar_url} alt={sellerName} className="h-full w-full object-cover" />
                : sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm inline-flex items-center gap-1">
                {sellerName}
                {seller?.is_dealer && <Store className="h-3.5 w-3.5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">{seller?.city ?? bike.location}</p>
            </div>
            <span className="text-xs text-primary font-semibold">Profiel →</span>
          </Link>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> FietsGarant® bescherming tot € 10.000
        </div>
      </div>

      {/* Sticky CTA bar (above bottom-tab bar) */}
      <div
        className="fixed inset-x-0 z-40 bg-card border-t border-border px-4 py-3"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
      >
        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2"
          onClick={startChat}
          disabled={contacting || sellerId === user?.id}
        >
          <Mail className="h-4 w-4" />
          {sellerId === user?.id ? "Je eigen advertentie" : "Stuur bericht"}
        </Button>
      </div>
    </div>
  );
};
