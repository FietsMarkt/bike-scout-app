import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Heart, MapPin, Calendar, Gauge, Zap, Share2, ShieldCheck, Phone, Mail, ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { getBikeById, getAllBikes } from "@/lib/bikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";
import { BikeCard } from "@/components/BikeCard";

const fmt = new Intl.NumberFormat("nl-NL");

const BikeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const fav = useFavorites();
  const bike = useMemo(() => (id ? getBikeById(id) : undefined), [id]);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Hallo, is deze fiets nog beschikbaar?");

  useEffect(() => {
    if (bike) document.title = `${bike.title} | FietsMarkt`;
  }, [bike]);

  if (!bike) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Fiets niet gevonden</h1>
          <Link to="/zoeken"><Button className="mt-4" variant="outline">Terug naar zoeken</Button></Link>
        </div>
      </Layout>
    );
  }

  const related = getAllBikes().filter((b) => b.id !== bike.id).slice(0, 4);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: bike.title, url }); return; } catch { /* ignore */ }
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Link gekopieerd", description: "Deel hem waar je wilt." });
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Bericht verstuurd", description: `We hebben je vraag naar de verkoper gestuurd.` });
    setContactOpen(false);
    setName(""); setEmail("");
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
              <img src={bike.image} alt={bike.title} className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[bike.image, bike.image, bike.image, bike.image].map((src, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border">
                  <img src={src} alt={`${bike.title} foto ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>

            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Beschrijving</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Deze {bike.title.toLowerCase()} verkeert in uitstekende staat en wordt verkocht door {bike.dealer ? "een geverifieerde dealer" : "een particulier"}.
                Bouwjaar {bike.year}{bike.km !== undefined ? ` met ${fmt.format(bike.km)} km op de teller` : ""}.
                Volledig onderhouden, klaar om mee te rijden. Originele aankoopbon en boekjes aanwezig.
                Te bezichtigen op afspraak in {bike.location}.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-xl font-bold mb-4">Specificaties</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {[
                  ["Bouwjaar", String(bike.year)],
                  ["Kilometerstand", bike.km !== undefined ? `${fmt.format(bike.km)} km` : "—"],
                  ["Motor", bike.motor ?? "—"],
                  ["Locatie", bike.location],
                  ["Verkoper", bike.dealer ? "Dealer" : "Particulier"],
                  ["Framemaat", "M (54 cm)"],
                  ["Kleur", "Zoals op foto"],
                  ["Versnellingen", "12-speed"],
                  ["Remmen", "Hydraulische schijfremmen"],
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
              {bike.badge && <Badge className="bg-gradient-indigo border-0 mb-3">{bike.badge}</Badge>}
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
                <Button variant="hero" size="lg" className="w-full" onClick={() => setContactOpen((o) => !o)}>
                  <Mail className="h-4 w-4" /> Stuur bericht
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => toast({ title: "06-12345678", description: "Bel de verkoper direct." })}>
                  <Phone className="h-4 w-4" /> Toon nummer
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fav.toggle(bike.id)}
                    className={fav.has(bike.id) ? "border-primary text-primary" : ""}
                  >
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
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Geverifieerde verkoper</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold mb-4">Vergelijkbare fietsen</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((b) => (
              <Link key={b.id} to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BikeDetail;
