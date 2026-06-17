import * as React from "react";
import { ImageLightbox, type ImageData } from "./image-viewer";
import { useImageZoom } from "@hooks/use-image-zoom";

type ArticleImageViewerProps = {
  containerId: string;
};

function ArticleImageViewer({ containerId }: ArticleImageViewerProps) {
  const [open, setOpen] = React.useState(false);
  const [images, setImages] = React.useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

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
    <ImageLightbox
      images={images}
      open={open}
      onOpenChange={setOpen}
      currentIndex={currentIndex}
      onPrev={goToPrev}
      onNext={goToNext}
      zoom={zoom}
    />
  );
}

export { ArticleImageViewer };
