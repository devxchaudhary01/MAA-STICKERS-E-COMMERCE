# New Features: Acrylic Wall Frame & Wall Clock Photo Customizer

This adds the two features requested — modeled on omgs.in:

1. **Upload once, auto-applied everywhere.** Inside a subcategory (e.g. Acrylic Wall → Birth), the customer uploads **one photo** and it is instantly composited onto **every design/frame** in that subcategory as a live preview grid.
2. **Per-design text editor.** Clicking a design opens an editor where the customer can reposition/zoom their photo and type into the design's text fields (name, date, message, etc.), with controls for font, size, color, bold/italic, and alignment.

## How it works

- **Category** now supports parent/child categories (`parentId`) and a `type`: `STANDARD` (normal product grid) or `GALLERY` (the new upload-once customizer). E.g. `Acrylic Wall Frames` (parent) → `Birth`, `Love`, `Dual` (children, type `GALLERY`).
- Each individual frame/clock design is a normal **Product** with `isGalleryTemplate = true` plus:
  - `overlayImageUrl` — the frame/clock artwork **with a transparent window** where the photo shows through (drawn on top of the customer's photo).
  - `photoArea` — normalized `{x,y,width,height,shape}` for where the photo sits.
  - `textAreas` — a JSON array of editable text fields (position, font, size, color, alignment).
- Because each design is a real `Product` row, checkout/orders/cart needed **no changes** — a customized design just becomes a cart item like any other product, with the final baked image and the customer's text stored in `customization`/`uploadedImage`.
- All compositing happens **client-side on `<canvas>`** (`src/lib/mockup.ts`), so generating previews for dozens of designs at once is fast and needs no server rendering.

## Where things live

| Area | Path |
|---|---|
| Compositing engine | `src/lib/mockup.ts` |
| Admin: manage categories/subcategories | `/admin/categories` → `src/app/admin/(panel)/categories` |
| Admin: manage designs + visual slot editor | `/admin/frame-templates` → `src/app/admin/(panel)/frame-templates` |
| Visual drag-to-place editor | `src/components/admin/SlotEditor.tsx` |
| Storefront category browsing | `/categories`, `/categories/[slug]` |
| Upload-once gallery grid | `src/components/gallery/FrameGallery.tsx` |
| Per-design editor modal | `src/components/gallery/FrameStudio.tsx` |
| Public API | `/api/categories`, `/api/gallery/[slug]` |
| Admin API | `/api/admin/categories/*`, `/api/admin/frame-templates/*` |

## Adding your real designs (replacing the placeholders)

The seed data ships with **placeholder SVG artwork** (`public/uploads/seed/*.svg`) so the feature works out of the box. To add your real, licensed frame/clock artwork:

1. Go to **Admin → Categories** and create/confirm your subcategories (mark each as **Gallery** type).
2. Go to **Admin → Frame / Clock Designs → Add Design**.
3. Fill in name, subcategory, price, and **upload the artwork PNG** — it must have a transparent "window" cut out where the photo should show (design this in Photoshop/Illustrator/Canva and export as PNG with transparency).
4. Use the visual editor to drag the **orange box** onto the transparent window (this is the photo slot), and add/position **blue boxes** for any editable text (name, date, message).
5. Save — the design immediately appears in the storefront gallery for that subcategory.

## Known scope limits (worth confirming with the client)

- Each design currently supports **one** photo slot. If any real designs need two or more photos in a single frame, that's an extension to `photoArea` (making it an array) — not yet built.
- The photo shape options are rectangle, circle, and heart. Other cutout shapes (e.g. star) can be added the same way in `src/lib/mockup.ts`.
- Text wraps automatically but there's no dedicated "curved text" or multi-line rich formatting — matches typical frame-customizer scope, but flag if omgs.in's designs need more.

## Setup (this machine could not run these — no network access to Prisma's binary host)

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Then visit `/categories`, or the admin panel at `/admin/login` (see `.env` for `ADMIN_USERNAME`/`ADMIN_PASSWORD`) → **Categories** / **Frame / Clock Designs**.
