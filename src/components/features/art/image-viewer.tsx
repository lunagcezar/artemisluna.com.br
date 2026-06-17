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
import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";

type ImageData = {
  src: string;
  alt: string;
  caption?: string;
};

type ImageViewerProps = {
  images: ImageData[];
};

function ImageViewer({ images }: ImageViewerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;

  const openAt = React.useCallback((index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  }, []);

  const goToPrev = React.useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goToNext = React.useCallback(() => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  React.useEffect(() => {
    if (!open) return;
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
  }, [open, goToPrev, goToNext]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openAt(index)}
            className="w-full cursor-pointer text-left [&:not(:focus-visible)]:outline-hidden"
          >
            <Card className="p-0">
              <figure className="break-inside-avoid overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-auto w-full"
                  loading="lazy"
                />
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/80" />
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center outline-hidden",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            )}
          >
            <DialogClose className="absolute top-4 right-4 z-10 text-white/70 transition-colors hover:text-white">
              <XIcon size={24} aria-label="Close" />
            </DialogClose>

            {hasMultiple && (
              <button
                type="button"
                onClick={goToPrev}
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
                aria-label="Previous image"
              >
                <CaretLeftIcon size={32} />
              </button>
            )}

            {hasMultiple && (
              <button
                type="button"
                onClick={goToNext}
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
                aria-label="Next image"
              >
                <CaretRightIcon size={32} />
              </button>
            )}

            <figure className="flex flex-col items-center gap-2 px-4">
              <img
                src={current?.src}
                alt={current?.alt ?? ""}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
              {current?.caption && (
                <figcaption className="text-center text-sm text-white/70">
                  {current.caption}
                </figcaption>
              )}
            </figure>

            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

export { ImageViewer };
