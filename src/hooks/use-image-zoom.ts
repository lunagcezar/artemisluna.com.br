import * as React from "react";

const CLICK_ZOOM = 2;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const SNAP_THRESHOLD = 0.9;

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

function getPinchDistance(touches: React.TouchList) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getPinchCenter(touches: React.TouchList) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
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
  const pinchRef = React.useRef({
    startDist: 0,
    startScale: 1,
    isPinching: false,
  });

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

  const snapIfOutOfBounds = React.useCallback(() => {
    if (scale < 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      startTransition();
    } else if (scale > 1 && scale < SNAP_THRESHOLD) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      startTransition();
    }
  }, [scale, startTransition]);

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

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const startDist = getPinchDistance(e.touches);
      pinchRef.current = {
        startDist,
        startScale: scale,
        isPinching: true,
      };
    },
    [enabled, scale],
  );

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!pinchRef.current.isPinching) return;
    if (e.touches.length !== 2) return;
    e.preventDefault();

    const dist = getPinchDistance(e.touches);
    const ratio = dist / pinchRef.current.startDist;
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, pinchRef.current.startScale * ratio),
    );

    const img = imgRef.current;
    if (img) {
      const center = getPinchCenter(e.touches);
      const rect = img.getBoundingClientRect();
      const t = computeTranslate(center.x, center.y, rect.width, rect.height);
      setTranslate(t);
    }

    setScale(newScale);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (!pinchRef.current.isPinching) return;
    pinchRef.current.isPinching = false;

    if (scale < SNAP_THRESHOLD) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      startTransition();
    }
  }, [scale, startTransition]);

  const imageStyle: React.CSSProperties = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    transformOrigin: "center",
    transition,
    ...(scale > 1
      ? { cursor: "default", touchAction: "none" }
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
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    snapIfOutOfBounds,
    imageStyle,
    isZoomed: scale > 1,
  };
}

export { useImageZoom };
