import * as React from "react";

const CLICK_ZOOM = 2;

function computeTranslate(
  clientX: number,
  clientY: number,
  visualWidth: number,
  visualHeight: number,
) {
  const excessX = Math.max(0, visualWidth - window.innerWidth);
  const excessY = Math.max(0, visualHeight - window.innerHeight);
  const mx = clientX / window.innerWidth;
  const my = clientY / window.innerHeight;
  return {
    x: (0.5 - mx) * excessX,
    y: (0.5 - my) * excessY,
  };
}

function useImageZoom({ enabled = true }: { enabled?: boolean } = {}) {
  const [scale, setScale] = React.useState(1);
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const [transition, setTransition] = React.useState("none");
  const imgRef = React.useRef<HTMLImageElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const reset = React.useCallback(() => {
    clearTimeout(timeoutRef.current);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setTransition("none");
  }, []);

  const startTransition = React.useCallback(() => {
    setTransition("transform 0.2s");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTransition("none"), 200);
  }, []);

  const toggleZoom = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;
      const img = imgRef.current;
      if (!img) return;

      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        startTransition();
        return;
      }

      const rect = img.getBoundingClientRect();
      const t = computeTranslate(clientX, clientY, rect.width, rect.height);
      setTranslate(t);
      setScale(CLICK_ZOOM);
      startTransition();
    },
    [enabled, scale, startTransition],
  );

  const handleMouseMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (scale <= 1) return;
      const img = imgRef.current;
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const t = computeTranslate(clientX, clientY, rect.width, rect.height);
      setTranslate(t);
    },
    [scale],
  );

  const imageStyle: React.CSSProperties = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    transformOrigin: "center",
    transition,
    ...(scale > 1
      ? { cursor: "default" }
      : {
          cursor: enabled ? "zoom-in" : "default",
          maxHeight: "85vh",
          maxWidth: "90vw",
          objectFit: "contain" as const,
        }),
  };

  return {
    imgRef,
    scale,
    reset,
    toggleZoom,
    handleMouseMove,
    imageStyle,
    isZoomed: scale > 1,
  };
}

export { useImageZoom };
