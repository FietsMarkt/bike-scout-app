import { useNavigate, useSearchParams } from "react-router-dom";

type Chip = { label: string; params: Record<string, string> };

const CHIPS: Chip[] = [
  { label: "Onder €500", params: { maxPrice: "500" } },
  { label: "Onder €1000", params: { maxPrice: "1000" } },
  { label: "E-bike", params: { type: "E-bike" } },
  { label: "Racefiets", params: { type: "Racefiets" } },
  { label: "Mountainbike", params: { type: "Mountainbike" } },
  { label: "Gravel", params: { type: "Gravel" } },
  { label: "Bakfiets", params: { type: "Bakfiets" } },
  { label: "Vouwfiets", params: { type: "Vouwfiets" } },
];

/**
 * Horizontal scrollable quick-filter chips (AutoScout/Vinted style).
 * Tapping a chip navigates to /zoeken with the params applied.
 */
export const QuickFilterChips = ({ activeOnSearch = false }: { activeOnSearch?: boolean }) => {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const apply = (chip: Chip) => {
    if (activeOnSearch) {
      const next = new URLSearchParams(params);
      Object.entries(chip.params).forEach(([k, v]) => next.set(k, v));
      setParams(next);
      return;
    }
    const usp = new URLSearchParams(chip.params);
    nav(`/zoeken?${usp.toString()}`);
  };

  const isActive = (chip: Chip) =>
    activeOnSearch &&
    Object.entries(chip.params).every(([k, v]) => params.get(k) === v);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none -mx-4 snap-x">
      {CHIPS.map((c) => {
        const active = isActive(c);
        return (
          <button
            key={c.label}
            onClick={() => apply(c)}
            className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
};
