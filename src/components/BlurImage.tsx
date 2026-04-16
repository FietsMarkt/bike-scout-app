import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  containerClassName?: string;
};

/**
 * Image with a smooth blur-up reveal. Uses a low-saturation skeleton
 * background while loading and fades in when decoded.
 */
export const BlurImage = ({
  src,
  alt,
  className,
  containerClassName,
  ...rest
}: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "linear-gradient(110deg, hsl(var(--muted)) 30%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 70%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
};
