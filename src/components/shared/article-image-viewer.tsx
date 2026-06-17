import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogClose,
} from "@components/core/dialog";
import { cn } from "@lib/utils";
import { useImageZoom } from "@hooks/use-image-zoom";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";

type ArticleImageViewerProps = {
  containerId: string;
};

function ArticleImageViewer({ containerId }: ArticleImageViewerProps) {
  const [open, setOpen] = React.useState(false);
  const [images, setImages] = React.useState<{ src: string; alt: string }[]>(
    [],
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  const zoom = useImageZoom({ enabled: open });

  React.useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const imgEls = container.querySelectorAll<HTMLImageElement>("img");
    setImages(
      Array.from(imgEls).map((img) => ({ src: img.src, alt: img.alt })),
    );

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;
      if (!container.contains(target)) return;
      const idx = Array.from(imgEls).indexOf(target as HTMLImageElement);
      if (idx === -1) return;
      setCurrentIndex(idx);
      setOpen(true);
      e.preventDefault();
    };
    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
  }, [containerId]);

  const goToPrev = React.useCallback(() => {
    if (zoom.isZoomed) return;
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length, zoom.isZoomed]);

  const goToNext = React.useCallback(() => {
    if (zoom.isZoomed) return;
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length, zoom.isZoomed]);

  React.useEffect(() => {
    zoom.reset();
  }, [currentIndex, zoom.reset]);

  React.useEffect(() => {
    if (!open) {
      zoom.reset();
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goToPrev, goToNext, zoom.reset]);

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center overflow-hidden outline-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <DialogClose className="absolute top-4 right-4 z-10 text-white/70 transition-colors hover:text-white">
            <XIcon size={24} aria-label="Close" />
          </DialogClose>

          {hasMultiple && !zoom.isZoomed && (
            <button
              type="button"
              onClick={goToPrev}
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
              aria-label="Previous image"
            >
              <CaretLeftIcon size={32} />
            </button>
          )}

          {hasMultiple && !zoom.isZoomed && (
            <button
              type="button"
              onClick={goToNext}
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
              aria-label="Next image"
            >
              <CaretRightIcon size={32} />
            </button>
          )}

          <div className="absolute right-4 bottom-4 z-10 flex gap-2">
            {zoom.isZoomed && (
              <button
                type="button"
                onClick={zoom.reset}
                className="text-white/60 transition-colors hover:text-white"
                aria-label="Reset zoom"
              >
                1:1
              </button>
            )}
          </div>

          <figure
            className="flex flex-col items-center gap-2 px-4 select-none"
            onMouseMove={(e) => zoom.handleMouseMove(e.clientX, e.clientY)}
          >
            <img
              ref={zoom.imgRef}
              src={current?.src}
              alt={current?.alt ?? ""}
              className="rounded-lg"
              draggable={false}
              style={zoom.imageStyle}
              onClick={(e) => zoom.toggleZoom(e.clientX, e.clientY)}
            />
          </figure>

          {hasMultiple && !zoom.isZoomed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export { ArticleImageViewer };
