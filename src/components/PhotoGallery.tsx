import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Maximize2 } from "lucide-react";
import { getOptimizedImage } from "@/lib/image";
import { BlurImage } from "@/components/BlurImage";
import { ImageLightbox } from "@/components/ImageLightbox";
import { haptic } from "@/lib/haptic";

type Props = {
  images: string[];
  alt: string;
  /** Top safe-area inset for the first image, in iOS PWA */
  topInset?: boolean;
};

/**
 * Swipeable photo gallery with embla-carousel, dots, counter, and a tap
 * action to open a fullscreen lightbox. iOS PWA friendly.
 */
export const PhotoGallery = ({ images, alt, topInset }: Props) => {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setActive(embla.selectedScrollSnap());
      haptic("light");
    };
    embla.on("select", onSelect);
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  return (
    <>
      <div className="relative bg-muted">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((src, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0">
                <button
                  type="button"
                  onClick={() => { haptic("light"); setLightbox(true); }}
                  className="block w-full text-left"
                  aria-label={`Foto ${i + 1} vergroten`}
                >
                  <BlurImage
                    src={getOptimizedImage(src, 1200, 80)}
                    alt={`${alt} ${i + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                    containerClassName="w-full aspect-[4/3]"
                    style={topInset && i === 0 ? { paddingTop: "env(safe-area-inset-top)" } : undefined}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Counter + expand affordance */}
        <button
          type="button"
          onClick={() => { haptic("light"); setLightbox(true); }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          <Maximize2 className="h-3 w-3" strokeWidth={2.5} />
          {active + 1} / {images.length}
        </button>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <ImageLightbox
          images={images}
          initialIndex={active}
          alt={alt}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
};
