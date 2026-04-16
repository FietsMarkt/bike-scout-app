import heroBike from "@/assets/hero-bike.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BIKE_TYPES, BIKE_BRANDS, PRICE_OPTIONS } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [tab, setTab] = useState<"kopen" | "verkopen">("kopen");
  const [type, setType] = useState(BIKE_TYPES[0]);
  const [brand, setBrand] = useState(BIKE_BRANDS[0]);
  const [maxPrice, setMaxPrice] = useState("0");
  const [postcode, setPostcode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "verkopen") { nav("/plaatsen"); return; }
    const params = new URLSearchParams();
    if (type !== BIKE_TYPES[0]) params.set("type", type);
    if (brand !== BIKE_BRANDS[0]) params.set("brand", brand);
    if (Number(maxPrice) > 0) params.set("maxPrice", maxPrice);
    if (postcode) params.set("postcode", postcode);
    nav(`/zoeken?${params.toString()}`);
  };

  return (
    <section className="relative bg-header text-header-foreground overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBike} alt="Premium gravel fiets tegen minimalistische muur"
          className="h-full w-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      <div className="container relative py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            {t("hero.tagline")}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.05]">
            {t("hero.title")} <span className="bg-gradient-to-r from-white to-primary-soft bg-clip-text text-transparent">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="mt-4 text-lg text-header-foreground/80 max-w-xl">
            {t("hero.subtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 rounded-2xl bg-card text-card-foreground shadow-elevated overflow-hidden max-w-5xl">
          <div className="flex border-b border-border">
            {(["kopen", "verkopen"] as const).map((tabKey) => (
              <button
                key={tabKey} type="button" onClick={() => setTab(tabKey)}
                className={`px-6 py-4 text-sm font-semibold transition-smooth border-b-2 ${
                  tab === tabKey ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tabKey === "kopen" ? t("hero.tabBuy") : t("hero.tabSell")}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground">{t("hero.type")}</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{BIKE_TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-muted-foreground">{t("hero.brand")}</label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">{BIKE_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">{t("hero.priceUpTo")}</label>
              <Select value={maxPrice} onValueChange={setMaxPrice}>
                <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{PRICE_OPTIONS.map((p) => <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">{t("hero.postcode")}</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="h-11 pl-9"
                  placeholder="1000"
                  inputMode="numeric"
                  pattern="[1-9][0-9]{3}"
                  maxLength={4}
                  title="Belgische postcode (4 cijfers, 1000-9999)"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button type="submit" variant="hero" size="lg" className="w-full h-11 gap-2">
                <Search className="h-4 w-4" /> {tab === "kopen" ? t("hero.search") : t("hero.place")}
              </Button>
            </div>
          </div>

          <div className="px-6 pb-5 -mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>{t("hero.results", { count: 84213 })}</span>
            <Link to="/zoeken" className="text-primary font-semibold hover:underline">{t("hero.advancedSearch")}</Link>
            <Link to="/favorieten" className="text-primary font-semibold hover:underline">{t("hero.savedSearches")}</Link>
          </div>
        </form>
      </div>
    </section>
  );
};
