import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MapPin, Calendar, Gauge, Zap, Share2, ShieldCheck, Mail, ChevronLeft, CheckCircle2, Store,
} from "lucide-react";
import { useBike, useSellerProfile } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation } from "@/lib/chat";
import { getOptimizedImage } from "@/lib/image";
import { useStandalone } from "@/hooks/useStandalone";
import { AppBikeDetail } from "@/components/AppBikeDetail";

const fmt = new Intl.NumberFormat("nl-BE");

const BikeDetail = () => {
  const isApp = useStandalone();
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const fav = useFavorites();
  const { user } = useAuth();
  const { data: res, isLoading } = useBike(id);
  const bike = res?.bike;
  const raw = res?.raw;
  const sellerId = (raw?.user_id as string | undefined);
  const { data: seller } = useSellerProfile(sellerId);
  const sellerName = seller?.display_name ?? "Verkoper";
  const [activeImage, setActiveImage] = useState(0);
  const [contacting, setContacting] = useState(false);

  useEffect(() => { if (bike) document.title = `${bike.title} | FietsMarkt`; }, [bike]);

  if (isApp) {
    return <Layout><AppBikeDetail /></Layout>;
  }

  if (isLoading) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;
  }
  if (!bike || !raw) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Fiets niet gevonden</h1>
          <Link to="/zoeken"><Button className="mt-4" variant="outline">Terug naar zoeken</Button></Link>
        </div>
      </Layout>
    );
  }

  const images = ((raw.images as string[]) ?? []).length > 0 ? (raw.images as string[]) : [bike.image];
  const description = (raw.description as string) || `Deze ${bike.title.toLowerCase()} is in goede staat. Te bezichtigen op afspraak in ${bike.location}.`;

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
    if (sellerId === user.id) {
      toast({ title: "Dit is je eigen advertentie" });
      return;
    }
    setContacting(true);
    try {
      const conv = await getOrCreateConversation(bike.id, sellerId, user.id);
      if (conv) nav(`/berichten/${conv.id}`);
      else toast({ title: "Niet gelukt", variant: "destructive" });
    } finally { setContacting(false); }
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/zoeken" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Terug naar resultaten
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
              <img src={getOptimizedImage(images[activeImage], 1200, 80)} alt={bike.title} className="h-full w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {images.slice(0, 8).map((src, i) => (
                  <button key={i} type="button" onClick={() => setActiveImage(i)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden bg-muted border-2 transition-smooth ${
                      activeImage === i ? "border-primary" : "border-border"
                    }`}>
                    <img src={getOptimizedImage(src, 200)} alt={`${bike.title} foto ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Beschrijving</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-xl font-bold mb-4">Specificaties</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {[
                  ["Merk", raw.brand as string],
                  ["Model", raw.model as string],
                  ["Type", raw.type as string],
                  ["Bouwjaar", String(bike.year)],
                  ["Kilometerstand", bike.km !== undefined ? `${fmt.format(bike.km)} km` : "—"],
                  ["Motor", bike.motor ?? "—"],
                  ["Locatie", bike.location],
                  ["Verkoper", sellerName],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-border pb-2">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {sellerId && (
              <section className="mt-8 rounded-xl border border-border bg-card p-5 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-indigo text-white font-bold overflow-hidden">
                  {seller?.avatar_url
                    ? <img src={seller.avatar_url} alt={sellerName} className="h-full w-full object-cover" />
                    : sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold inline-flex items-center gap-2">
                    {sellerName}
                    {seller?.is_dealer && <Store className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{seller?.city ?? bike.location}</p>
                </div>
                <Link to={`/verkoper/${sellerId}`}><Button variant="outline" size="sm">Bekijk profiel</Button></Link>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-20 self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <Badge className="bg-gradient-indigo border-0 mb-3">{(raw.type as string)}</Badge>
              <h1 className="font-display text-2xl font-extrabold leading-tight">{bike.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{bike.subtitle}</p>

              <div className="mt-4 font-display text-3xl font-extrabold text-primary">€ {fmt.format(bike.price)}</div>
              {(raw.previous_price as number | null) && (raw.previous_price as number) > bike.price && (
                <div className="mt-1 text-sm">
                  <span className="line-through text-muted-foreground">€ {fmt.format(raw.previous_price as number)}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-bold">Prijsdaling</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {bike.year}</span>
                {bike.km !== undefined && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {fmt.format(bike.km)} km</span>}
                {bike.motor && <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {bike.motor}</span>}
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {bike.location}</span>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button variant="hero" size="lg" className="w-full" onClick={startChat} disabled={contacting}>
                  <Mail className="h-4 w-4" /> Stuur bericht
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => fav.toggle(bike.id)}
                    className={fav.has(bike.id) ? "border-primary text-primary" : ""}>
                    <Heart className={`h-4 w-4 ${fav.has(bike.id) ? "fill-current" : ""}`} />
                    {fav.has(bike.id) ? "Opgeslagen" : "Bewaren"}
                  </Button>
                  <Button variant="outline" onClick={onShare}>
                    <Share2 className="h-4 w-4" /> Delen
                  </Button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> FietsGarant® bescherming</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Verkocht door {sellerName}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default BikeDetail;
