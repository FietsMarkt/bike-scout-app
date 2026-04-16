import { useEffect, useState } from "react";
import { X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedImage } from "@/lib/image";
import { haptic } from "@/lib/haptic";

type Props = {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  alt: string;
};

/**
 * Fullscreen image lightbox with embla swipe + dots. iOS-friendly:
 * locks body scroll while open, supports tap-to-close on backdrop.
 */
export const ImageLightbox = ({ images, initialIndex = 0, onClose, alt }: Props) => {
  const [emblaRef, embla] = useEmblaCarousel({ startIndex: initialIndex, loop: false });
  const [active, setActive] = useState(initialIndex);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setActive(embla.selectedScrollSnap());
      haptic("light");
    };
    embla.on("select", onSelect);
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        aria-label="Sluiten"
        className="absolute z-10 grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur text-white"
        style={{
          top: "calc(env(safe-area-inset-top) + 0.75rem)",
          right: "0.875rem",
        }}
      >
        <X className="h-5 w-5" />
      </button>

      <div className="absolute z-10 left-3 text-white text-sm font-semibold"
        style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}>
        {active + 1} / {images.length}
      </div>

      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 h-full grid place-items-center px-2">
              <img
                src={getOptimizedImage(src, 1600, 90)}
                alt={`${alt} ${i + 1}`}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div
          className="absolute inset-x-0 flex justify-center gap-1.5"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => embla?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
