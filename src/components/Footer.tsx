import { Link } from "react-router-dom";
import { Bike } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Footer = () => {
  const { t } = useTranslation();

  const cols = [
    {
      title: t("footer.buy"),
      links: [
        { label: t("nav.buyBikes"), to: "/zoeken" },
        { label: "Racefietsen", to: "/zoeken?type=Racefiets" },
        { label: "E-bikes", to: "/zoeken?type=E-bike" },
        { label: "Mountainbikes", to: "/zoeken?type=Mountainbike" },
        { label: "Gravel", to: "/zoeken?type=Gravel" },
        { label: "Bakfietsen", to: "/zoeken?type=Bakfiets" },
        { label: "Vouwfietsen", to: "/zoeken?type=Vouwfiets" },
      ],
    },
    {
      title: t("footer.sell"),
      links: [
        { label: t("nav.placeBike"), to: "/plaatsen" },
        { label: t("nav.sellBike"), to: "/verkopen" },
        { label: t("nav.dealers"), to: "/dealers" },
      ],
    },
    {
      title: t("footer.service"),
      links: [
        { label: t("nav.favorites"), to: "/favorieten" },
        { label: t("nav.login"), to: "/inloggen" },
        { label: t("nav.magazine"), to: "/magazine" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: "About", to: "/magazine" },
        { label: "Contact", to: "/magazine" },
      ],
    },
  ];

  return (
    <footer className="bg-header text-header-foreground mt-8">
      <div className="container py-14 grid gap-10 md:grid-cols-5">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
              <Bike className="h-5 w-5" />
            </span>
            <span>Fiets<span className="text-primary">Markt</span></span>
          </Link>
          <p className="mt-4 text-sm text-header-foreground/70 max-w-xs">
            {t("footer.tagline")}
          </p>
          <div className="mt-4">
            <LanguageSwitcher variant="default" />
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-bold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-header-foreground/70 hover:text-header-foreground transition-smooth">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-header-foreground/60">
          <span>© {new Date().getFullYear()} FietsMarkt. {t("footer.rights")}</span>
          <div className="flex gap-4">
            <Link to="/magazine" className="hover:text-header-foreground">{t("footer.privacy")}</Link>
            <Link to="/magazine" className="hover:text-header-foreground">{t("footer.terms")}</Link>
            <Link to="/magazine" className="hover:text-header-foreground">{t("footer.cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
