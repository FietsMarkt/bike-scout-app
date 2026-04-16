import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Heart, MapPin, Calendar, Gauge, Zap, Share2, ShieldCheck, Mail, ChevronLeft, CheckCircle2,
} from "lucide-react";
import { fetchBikeById } from "@/lib/bikes";
import type { Bike } from "@/components/BikeCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fmt = new Intl.NumberFormat("nl-NL");

const BikeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const fav = useFavorites();
  const { user } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [sellerName, setSellerName] = useState<string>("Verkoper");
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Hallo, is deze fiets nog beschikbaar?");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBikeById(id).then(async (res) => {
      if (res) {
        setBike(res.bike);
        setRaw(res.raw);
        const sellerId = res.raw.user_id as string;
        const { data: prof } = await supabase
          .from("profiles").select("display_name").eq("user_id", sellerId).maybeSingle();
        if (prof?.display_name) setSellerName(prof.display_name);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { if (bike) document.title = `${bike.title} | FietsMarkt`; }, [bike]);

  if (loading) {
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

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Bericht verstuurd", description: "We hebben je vraag naar de verkoper gestuurd." });
    setContactOpen(false);
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
              <img src={images[activeImage]} alt={bike.title} className="h-full w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {images.slice(0, 8).map((src, i) => (
                  <button key={i} type="button" onClick={() => setActiveImage(i)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden bg-muted border-2 transition-smooth ${
                      activeImage === i ? "border-primary" : "border-border"
                    }`}>
                    <img src={src} alt={`${bike.title} foto ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
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
          </div>

          <aside className="lg:sticky lg:top-20 self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <Badge className="bg-gradient-indigo border-0 mb-3">{(raw.type as string)}</Badge>
              <h1 className="font-display text-2xl font-extrabold leading-tight">{bike.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{bike.subtitle}</p>

              <div className="mt-4 font-display text-3xl font-extrabold text-primary">€ {fmt.format(bike.price)}</div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {bike.year}</span>
                {bike.km !== undefined && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {fmt.format(bike.km)} km</span>}
                {bike.motor && <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> {bike.motor}</span>}
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {bike.location}</span>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button variant="hero" size="lg" className="w-full" onClick={() => {
                  setContactOpen((o) => !o);
                  if (user?.email) setEmail(user.email);
                }}>
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

              {contactOpen && (
                <form onSubmit={submitContact} className="mt-5 pt-5 border-t border-border space-y-3">
                  <Input placeholder="Je naam" required value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="Je e-mailadres" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                  <Button type="submit" variant="hero" className="w-full">Verstuur bericht</Button>
                </form>
              )}

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
