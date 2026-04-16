import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BIKE_TYPES, BIKE_BRANDS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PlaceBike = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [type, setType] = useState("Racefiets");
  const [brand, setBrand] = useState("Trek");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [km, setKm] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast({ title: "Log eerst in", description: "Je moet ingelogd zijn om een fiets te plaatsen." });
      nav("/inloggen");
    }
  }, [user, loading, nav, toast]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).slice(0, 8 - files.length);
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, String(reader.result)]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!brand || !model || !price || !city) {
      toast({ title: "Vul alle verplichte velden in", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("bike-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("bike-photos").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
      if (imageUrls.length === 0) {
        imageUrls.push("https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=900");
      }

      const { data: row, error } = await supabase
        .from("bikes")
        .insert({
          user_id: user.id,
          type, brand, model,
          title: `${brand} ${model}`,
          subtitle: type,
          description,
          price, year, km,
          city,
          images: imageUrls,
          status: "active",
        })
        .select("id")
        .single();
      if (error) throw error;

      toast({ title: "Fiets geplaatst!", description: "Je advertentie staat live." });
      nav(`/fiets/${row.id}`);
    } catch (err) {
      toast({
        title: "Plaatsen mislukt",
        description: err instanceof Error ? err.message : "Probeer het opnieuw",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-hero text-header-foreground">
        <div className="container py-12">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">Plaats je fiets</h1>
          <p className="mt-2 text-header-foreground/80 max-w-xl">Bereik 180.000 kopers per maand. Plaatsen is gratis voor particulieren.</p>
        </div>
      </div>

      <form onSubmit={submit} className="container py-10 grid gap-8 lg:grid-cols-[1fr_360px] max-w-6xl">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold mb-4">Fiets gegevens</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type *">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BIKE_TYPES.filter((t) => t !== "Alle types").map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Merk *">
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">{BIKE_BRANDS.filter((b) => b !== "Alle merken").map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Model *">
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="bv. Domane SLR 7" required />
              </Field>
              <Field label="Bouwjaar">
                <Input type="number" min={1980} max={new Date().getFullYear() + 1} value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </Field>
              <Field label="Kilometerstand">
                <Input type="number" min={0} value={km} onChange={(e) => setKm(Number(e.target.value))} />
              </Field>
              <Field label="Prijs (€) *">
                <Input type="number" min={1} value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} placeholder="2500" required />
              </Field>
              <Field label="Stad *" className="sm:col-span-2">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="bv. Amsterdam, NH" required />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold mb-4">Beschrijving</h2>
            <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Vertel iets over de staat, onderhoud, accessoires…" />
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold mb-4">Foto's <span className="text-xs font-normal text-muted-foreground">(max 8)</span></h2>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-foreground/80 text-background opacity-0 group-hover:opacity-100 transition-smooth">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length < 8 && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-primary-soft transition-smooth">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <span className="font-semibold">Klik om foto's te uploaden</span>
                <span className="text-xs text-muted-foreground">JPG of PNG · meerdere foto's mogelijk</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
              </label>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-bold mb-3">Voorbeeld</h3>
            <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden flex items-center justify-center">
              {previews[0]
                ? <img src={previews[0]} alt="" className="h-full w-full object-cover" />
                : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
            </div>
            <div className="mt-3">
              <p className="font-display font-bold text-base line-clamp-1">{brand} {model || "—"}</p>
              <p className="text-xs text-muted-foreground">{type}</p>
              <p className="font-display text-lg font-extrabold text-primary mt-1">€ {price ? price.toLocaleString("nl-NL") : "0"}</p>
            </div>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy ? "Bezig met plaatsen..." : "Advertentie plaatsen"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Door te plaatsen ga je akkoord met onze voorwaarden.</p>
        </aside>
      </form>
    </Layout>
  );
};

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);

export default PlaceBike;
