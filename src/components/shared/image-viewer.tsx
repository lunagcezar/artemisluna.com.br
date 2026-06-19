import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogClose,
} from "@components/core/dialog";
import { Card } from "@components/core/card";
import { cn } from "@lib/utils";
import { useImageZoom } from "@hooks/use-image-zoom";
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";

type ImageData = {
  src: string;
  alt: string;
  caption?: string;
};

type ImageLightboxProps = {
  images: ImageData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  zoom: ReturnType<typeof useImageZoom>;
};

function ImageLightbox({
  images,
  open,
  onOpenChange,
  currentIndex,
  onPrev,
  onNext,
  zoom,
}: ImageLightboxProps) {
  const current = images[currentIndex];
  const hasMultiple = images.length > 1;
  const didPanRef = React.useRef(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center overflow-hidden outline-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <DialogClose className="absolute top-4 right-4 z-10 text-white/70 transition-colors hover:text-white">
            <XIcon size={24} aria-label="Close" />
          </DialogClose>

          {hasMultiple && !zoom.isZoomed && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
              aria-label="Previous image"
            >
              <CaretLeftIcon size={32} />
            </button>
          )}

          {hasMultiple && !zoom.isZoomed && (
            <button
              type="button"
              onClick={onNext}
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
            onTouchStart={(e) => {
              zoom.handleTouchStart(e);
              if (zoom.isZoomed && e.touches.length === 1) {
                didPanRef.current = false;
              }
            }}
            onTouchMove={(e) => {
              zoom.handleTouchMove(e);
              if (zoom.isZoomed && e.touches.length === 1) {
                didPanRef.current = true;
              }
            }}
            onTouchEnd={(e) => {
              zoom.handleTouchEnd(e);
            }}
          >
            <img
              ref={zoom.imgRef}
              src={current?.src}
              alt={current?.alt ?? ""}
              className="rounded-lg"
              draggable={false}
              style={zoom.imageStyle}
              onClick={(e) => {
                if (didPanRef.current) {
                  didPanRef.current = false;
                  return;
                }
                zoom.toggleZoom(e.clientX, e.clientY);
              }}
            />
            {current?.caption && (
              <figcaption className="text-center text-sm text-white/70">
                {current.caption}
              </figcaption>
            )}
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

type ImageViewerProps = {
  images: ImageData[];
};

function ImageViewer({ images }: ImageViewerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const zoom = useImageZoom({ enabled: open });

  const openAt = React.useCallback((index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  }, []);

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

  return (
    <>
      <div className="grid grid-cols-1 gap-8">
        {images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openAt(index)}
            className="w-full cursor-pointer text-left not-focus-visible:outline-hidden"
          >
            <Card className="p-0">
              <figure className="break-inside-avoid overflow-hidden">
                <div className="relative">
                  <div className="bg-muted absolute inset-0 overflow-hidden rounded-lg">
                    <div className="animate-shimmer via-foreground/[0.07] absolute inset-0 bg-linear-to-r from-transparent to-transparent" />
                  </div>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="relative h-auto w-full"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <figcaption className="text-muted-foreground p-3 text-sm">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            </Card>
          </button>
        ))}
      </div>

      <ImageLightbox
        images={images}
        open={open}
        onOpenChange={setOpen}
        currentIndex={currentIndex}
        onPrev={goToPrev}
        onNext={goToNext}
        zoom={zoom}
      />
    </>
  );
}

export { ImageViewer, ImageLightbox };
export type { ImageData };
