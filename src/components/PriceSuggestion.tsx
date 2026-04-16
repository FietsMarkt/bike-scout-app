import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptic";

type Suggestion = {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
  sampleSize: number;
  cached: boolean;
};

type Props = {
  brand: string;
  model: string;
  type: string;
  year: number;
  km: number;
  onApply: (price: number) => void;
};

const fmt = (n: number) => `€ ${n.toLocaleString("nl-NL")}`;

export const PriceSuggestion = ({ brand, model, type, year, km, onApply }: Props) => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  const mutation = useMutation({
    mutationFn: async (): Promise<Suggestion> => {
      const { data, error } = await supabase.functions.invoke("suggest-price", {
        body: { brand, model, type, year, km },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as Suggestion;
    },
    onSuccess: (data) => {
      setSuggestion(data);
      haptic("success");
    },
    onError: (err) => {
      haptic("error");
      toast({
        title: "Kon geen suggestie ophalen",
        description: err instanceof Error ? err.message : "Probeer het opnieuw",
        variant: "destructive",
      });
    },
  });

  const canSuggest = brand && model.trim().length > 1 && type && year > 1980;

  const handleClick = () => {
    if (!canSuggest) {
      toast({ title: "Vul eerst merk, model, type en jaar in" });
      return;
    }
    haptic("light");
    mutation.mutate();
  };

  const handleApply = () => {
    if (!suggestion) return;
    haptic("medium");
    onApply(suggestion.recommended);
    toast({ title: "Prijs ingevuld", description: `${fmt(suggestion.recommended)} overgenomen` });
  };

  if (suggestion) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-bold">AI prijssuggestie</p>
            <p className="text-[11px] text-muted-foreground">
              {suggestion.sampleSize > 0
                ? `Op basis van ${suggestion.sampleSize} vergelijkbare advertenties`
                : "Op basis van marktkennis"}
              {suggestion.cached && " · cached"}
            </p>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Aanbevolen</p>
            <p className="font-display text-2xl font-extrabold text-primary">
              {fmt(suggestion.recommended)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Range</p>
            <p className="text-sm font-semibold">
              {fmt(suggestion.min)} – {fmt(suggestion.max)}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-foreground/80 border-l-2 border-primary/30 pl-3 italic">
          {suggestion.reasoning}
        </p>

        <div className="flex gap-2">
          <Button type="button" size="sm" variant="hero" className="flex-1" onClick={handleApply}>
            Gebruik {fmt(suggestion.recommended)}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSuggestion(null);
              mutation.reset();
            }}
          >
            Opnieuw
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Indicatie — definitieve prijs bepaal je zelf.
        </p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={mutation.isPending || !canSuggest}
      className="w-full gap-2 border-dashed"
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          AI denkt na…
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Stel prijs voor met AI
        </>
      )}
    </Button>
  );
};
