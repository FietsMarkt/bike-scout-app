import { Loader2, ArrowDown } from "lucide-react";

type Props = {
  pull: number;
  threshold: number;
  refreshing: boolean;
};

/**
 * Visual indicator for pull-to-refresh. Stays positioned at the very
 * top, shows a downward chevron that becomes a spinner when triggered.
 */
export const PullIndicator = ({ pull, threshold, refreshing }: Props) => {
  if (pull <= 0 && !refreshing) return null;
  const progress = Math.min(pull / threshold, 1);
  const ready = pull >= threshold;

  return (
    <div
      className="fixed inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{
        top: `calc(env(safe-area-inset-top) + ${Math.min(pull * 0.5, 36)}px)`,
        opacity: Math.min(progress + 0.2, 1),
        transition: refreshing ? "top 0.2s ease" : undefined,
      }}
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-card/95 backdrop-blur shadow-elevated">
        {refreshing ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <ArrowDown
            className={`h-4 w-4 transition-transform duration-200 ${ready ? "rotate-180 text-primary" : "text-muted-foreground"}`}
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );
};
