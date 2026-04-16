import { ShieldCheck, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TrustBar = () => {
  const { t } = useTranslation();
  const items = [
    { icon: ShieldCheck, title: t("trust.secureTitle"), text: t("trust.secureText") },
    { icon: Users, title: t("trust.buyersTitle"), text: t("trust.buyersText") },
    { icon: Sparkles, title: t("trust.dealersTitle"), text: t("trust.dealersText") },
  ];

  return (
    <section className="bg-gradient-soft border-y border-border">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i.title} className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <i.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-sm">{i.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
