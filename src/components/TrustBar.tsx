import { ShieldCheck, Truck, Users, Sparkles } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Veilig betalen", text: "Met FietsGarant® bescherming tot € 10.000" },
  { icon: Truck, title: "Bezorging in NL/BE", text: "Inclusief track & trace en verzekerde verzending" },
  { icon: Users, title: "180.000 kopers", text: "Maandelijks actief op het platform" },
  { icon: Sparkles, title: "Geverifieerde dealers", text: "Meer dan 1.200 erkende fietswinkels" },
];

export const TrustBar = () => {
  return (
    <section className="bg-gradient-soft border-y border-border">
      <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
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
