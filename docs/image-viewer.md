# Image Viewer (lightbox)

A React-based interactive lightbox for art, blog, and wiki detail pages.

## Files

| File                                                         | Purpose                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| `src/components/shared/image-viewer.tsx`                     | `ImageViewer` (thumbnail grid) + `ImageLightbox` (dialog)  |
| `src/components/shared/article-image-viewer.tsx`             | Scans DOM container for images, opens `ImageLightbox`      |
| `src/components/shared/_astro/AstroArticleImageViewer.astro` | Astro wrapper: renders Content + mounts ArticleImageViewer |
| `src/hooks/use-image-zoom.ts`                                | Hook + pure function for zoom/pan math                     |
| `src/components/core/dialog.tsx`                             | shadcn Dialog primitive (radix-ui wrapper)                 |

The `ImageLightbox` component is shared by both `ImageViewer` (art's explicit image list) and `ArticleImageViewer` (blog/wiki's DOM-scanned images). It handles the Dialog overlay, navigation arrows, zoom/pan, and keyboard interaction — all in one place.

## Usage

### Explicit image list (art)

```astro
<ImageViewer images={resolvedImages} client:load />
```

### Images inside markdown body (blog/wiki)

```astro
<AstroArticleImageViewer entry={entry} />
```

This renders the markdown `Content` inside a uniquely ID'd container with `article-content` class, then mounts `ArticleImageViewer` which scans the container for `<img>` elements and enables the lightbox on click.

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
