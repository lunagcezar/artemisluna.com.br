# Image Viewer (lightbox)

A React-based interactive lightbox for the art section's detail pages.

## Files

| File                                           | Purpose                                           |
| ---------------------------------------------- | ------------------------------------------------- |
| `src/components/features/art/image-viewer.tsx` | React component: thumbnail grid + lightbox dialog |
| `src/hooks/use-image-zoom.ts`                  | Hook + pure function for zoom/pan math            |
| `src/components/core/dialog.tsx`               | shadcn Dialog primitive (radix-ui wrapper)        |

## Usage

In an Astro component, resolve images to their hashed URLs, then mount with `client:load`:

```astro
---
const resolvedImages = (data.images ?? []).map((img) => {
  const resolved = resolveImage(img.src);
  return {
    src: typeof resolved !== "string" ? resolved.src : resolved,
    alt: img.alt,
    caption: img.caption,
  };
});
---

<ImageViewer images={resolvedImages} client:load />
```

## Zoom & Pan

The lightbox uses `transform: translate(px, py) scale(S)` with `transform-origin: center`.

### `computeTranslate` (`src/lib/use-image-zoom.ts`)

The pure function that computes how much to shift the image based on mouse position:

```
excessX = max(0, visualWidth - viewportWidth)
mx = clientX / viewportWidth
tx = (0.5 - mx) * excessX
```

- `excessX` is how much wider the zoomed image is than the viewport. If the zoomed image still fits, excess is 0 and no panning occurs.
- `(0.5 - mx)` maps viewport mouse position (0=left, 0.5=center, 1=right) to a signed offset.
- The product gives the pixel translation: zero at center, max at edges.

### States

| State  | Transform                    | Cursor    | Transitions                     |
| ------ | ---------------------------- | --------- | ------------------------------- |
| Normal | `scale(1)`                   | `zoom-in` | none                            |
| Zoomed | `translate(tx, ty) scale(2)` | `default` | 0.2s on toggle, none during pan |

- Zoom toggles on image click. A 200ms CSS transition animates the scale/translate change.
- During panning (mouse move while zoomed), `transition` is set to `none` so movement stays instant.
- Arrow keys cycle between images only when not zoomed.
- Clicking the backdrop (the `Dialog.Content` element itself, not its children) closes the dialog.

## Dependencies

- `radix-ui` — Dialog primitives
- `@phosphor-icons/react` — CaretLeft, CaretRight, X icons
- `@components/core/dialog` — shadcn Dialog wrapper
- `@components/core/card` — shadcn Card for thumbnails
