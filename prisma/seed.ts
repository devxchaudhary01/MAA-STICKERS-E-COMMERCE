import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Custom Stickers", slug: "stickers", description: "Die-cut, sheet & transparent stickers personalised with your photos", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", sortOrder: 1 },
  { name: "Fridge Magnets", slug: "magnets", description: "High-quality photo magnets for your fridge", imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop", sortOrder: 2 },
  { name: "Keychains", slug: "keychains", description: "Personalised acrylic & metal keychains", imageUrl: "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=400&h=300&fit=crop", sortOrder: 3 },
  { name: "Wall Decor", slug: "wall-decor", description: "Framed prints, collages & acrylic wall art", imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop", sortOrder: 4 },
  { name: "Photo Albums", slug: "albums", description: "Beautifully crafted personalised photo albums", imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop", sortOrder: 5 },
  { name: "Name Plates", slug: "nameplates", description: "Elegant acrylic & wooden name plates", imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=300&fit=crop", sortOrder: 6 },
];

async function main() {
  console.log("🌱 Seeding database…");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();

  const categories: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.category.create({ data: cat });
    categories[cat.slug] = c.id;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  const PRODUCTS = [
    {
      name: "Custom Photo Sticker Sheet",
      slug: "custom-photo-sticker-sheet",
      description: "Create your own sticker sheet with 12 premium die-cut stickers from your favourite photos. Waterproof, UV-resistant, and perfect for laptops, bottles, notebooks, and more!",
      basePrice: 249, comparePrice: 399,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop","https://images.unsplash.com/photo-1571935300617-d81a4c37a573?w=600&h=600&fit=crop"]),
      categorySlug: "stickers", isCustomizable: true, isFeatured: true,
      tags: JSON.stringify(["stickers","popular","bestseller"]),
      variants: [
        { name: "Size", options: JSON.stringify([{label:"Small (3×3 cm)",value:"small"},{label:"Medium (4×4 cm)",value:"medium"},{label:"Large (5×5 cm)",value:"large"}]), priceAdj: 0 },
        { name: "Finish", options: JSON.stringify([{label:"Glossy",value:"glossy"},{label:"Matte",value:"matte"},{label:"Transparent",value:"transparent"}]), priceAdj: 0 },
      ],
    },
    {
      name: "Round Sticker Pack (30 pcs)",
      slug: "round-sticker-pack",
      description: "Set of 30 circular stickers with your design or photo. Waterproof & UV-resistant coating. Perfect for gifting.",
      basePrice: 199, comparePrice: 299,
      imageUrl: "https://images.unsplash.com/photo-1571935300617-d81a4c37a573?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1571935300617-d81a4c37a573?w=600&h=600&fit=crop"]),
      categorySlug: "stickers", isCustomizable: true, isFeatured: false,
      tags: JSON.stringify(["stickers"]),
      variants: [
        { name: "Size", options: JSON.stringify([{label:"2cm diameter",value:"2cm"},{label:"3cm diameter",value:"3cm"},{label:"5cm diameter",value:"5cm"}]), priceAdj: 0 },
      ],
    },
    {
      name: "Personalised Fridge Magnet",
      slug: "personalised-fridge-magnet",
      description: "High-resolution fridge magnet printed with your photo. Strong magnetic backing holds firmly. Available in multiple shapes and sizes.",
      basePrice: 179, comparePrice: 279,
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop","https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"]),
      categorySlug: "magnets", isCustomizable: true, isFeatured: true,
      tags: JSON.stringify(["magnets","popular"]),
      variants: [
        { name: "Shape", options: JSON.stringify([{label:"Square",value:"square"},{label:"Round",value:"round"},{label:"Heart",value:"heart"}]), priceAdj: 0 },
        { name: "Size", options: JSON.stringify([{label:"2\" × 2\"",value:"2x2"},{label:"3\" × 3\"",value:"3x3"},{label:"4\" × 4\"",value:"4x4"}]), priceAdj: 0 },
      ],
    },
    {
      name: "Magnetic Photo Collage (4-in-1)",
      slug: "magnetic-photo-collage",
      description: "A beautiful 4-photo magnetic collage for your fridge. Tell your story through your favourite moments.",
      basePrice: 349, comparePrice: 499,
      imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"]),
      categorySlug: "magnets", isCustomizable: true, isFeatured: false,
      tags: JSON.stringify(["magnets"]),
      variants: [],
    },
    {
      name: "Acrylic Photo Keychain",
      slug: "acrylic-photo-keychain",
      description: "Crystal-clear acrylic keychain with your favourite photo. Lightweight, durable, and the perfect gift. Comes with a silver stainless steel key ring.",
      basePrice: 149, comparePrice: 249,
      imageUrl: "https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1583394293214-41cb213e2e55?w=600&h=600&fit=crop","https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"]),
      categorySlug: "keychains", isCustomizable: true, isFeatured: true,
      tags: JSON.stringify(["keychains","popular","bestseller"]),
      variants: [
        { name: "Shape", options: JSON.stringify([{label:"Square",value:"square"},{label:"Round",value:"round"},{label:"Heart",value:"heart"}]), priceAdj: 0 },
      ],
    },
    {
      name: "Metal Engraved Keychain",
      slug: "metal-engraved-keychain",
      description: "Premium stainless steel keychain with laser-engraved name or message. Ideal for couples, best friends, and corporate gifting.",
      basePrice: 299, comparePrice: 449,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"]),
      categorySlug: "keychains", isCustomizable: true, isFeatured: false,
      tags: JSON.stringify(["keychains"]),
      variants: [],
    },
    {
      name: "Wall Photo Collage (6 Photos)",
      slug: "wall-photo-collage",
      description: "Beautiful 6-photo premium wall collage printed on photo paper. Perfect for birthdays, anniversaries, and housewarming gifts.",
      basePrice: 449, comparePrice: 699,
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop"]),
      categorySlug: "wall-decor", isCustomizable: true, isFeatured: true,
      tags: JSON.stringify(["wall-decor","popular"]),
      variants: [
        { name: "Size", options: JSON.stringify([{label:"A4 (21×29 cm)",value:"a4"},{label:"A3 (29×42 cm)",value:"a3"}]), priceAdj: 0 },
      ],
    },
    {
      name: "Acrylic Name Plate",
      slug: "acrylic-name-plate",
      description: "Elegant laser-cut acrylic name plate for homes and offices. Customise with your family name, monogram or business name.",
      basePrice: 599, comparePrice: 899,
      imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=600&fit=crop",
      images: JSON.stringify(["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=600&fit=crop"]),
      categorySlug: "nameplates", isCustomizable: true, isFeatured: false,
      tags: JSON.stringify(["nameplates"]),
      variants: [
        { name: "Color", options: JSON.stringify([{label:"Clear",value:"clear"},{label:"Gold",value:"gold"},{label:"Rose Gold",value:"rose-gold"},{label:"Black",value:"black"}]), priceAdj: 0 },
      ],
    },
  ];

  for (const { categorySlug, variants, ...product } of PRODUCTS) {
    const p = await prisma.product.create({
      data: {
        ...product,
        categoryId: categories[categorySlug],
        variants: { create: variants },
      },
    });
    console.log(`  ✅ Product: ${p.name}`);
  }

  // ---------------------------------------------------------------------
  // Gallery categories: Acrylic Wall Frames & Wall Clocks.
  // Each has subcategories (Birth / Love / Dual). Subcategories are marked
  // type "GALLERY" so the storefront shows the upload-once auto-mockup
  // customizer instead of a plain product grid. Every design inside is a
  // Product with isGalleryTemplate=true, an overlay artwork PNG/SVG with a
  // transparent photo window, a normalized photoArea, and editable textAreas.
  // ---------------------------------------------------------------------
  const acrylicWall = await prisma.category.create({
    data: {
      name: "Acrylic Wall Frames",
      slug: "acrylic-wall",
      description: "Premium acrylic wall frames — upload one photo and see it applied across every design.",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=450&fit=crop",
      sortOrder: 7,
    },
  });
  const wallClock = await prisma.category.create({
    data: {
      name: "Wall Clocks",
      slug: "wall-clock",
      description: "Personalised photo wall clocks — one upload, styled onto every clock face instantly.",
      imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=450&fit=crop",
      sortOrder: 8,
    },
  });

  const SUBCATS = [
    { parent: acrylicWall, name: "Birth", slug: "acrylic-birth", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=375&fit=crop" },
    { parent: acrylicWall, name: "Love", slug: "acrylic-love", img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&h=375&fit=crop" },
    { parent: acrylicWall, name: "Dual", slug: "acrylic-dual", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=375&fit=crop" },
    { parent: wallClock, name: "Birth", slug: "clock-birth", img: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&h=375&fit=crop" },
    { parent: wallClock, name: "Love", slug: "clock-love", img: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=500&h=375&fit=crop" },
    { parent: wallClock, name: "Dual", slug: "clock-dual", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=375&fit=crop" },
  ];
  const sub: Record<string, string> = {};
  for (const s of SUBCATS) {
    const c = await prisma.category.create({
      data: { name: s.name, slug: s.slug, parentId: s.parent.id, type: "GALLERY", imageUrl: s.img, sortOrder: 0 },
    });
    sub[s.slug] = c.id;
    console.log(`  ✅ Subcategory: ${s.parent.name} → ${s.name}`);
  }

  // Reusable text-field factory (normalized 0-1 coordinates + default styling).
  const textField = (id: string, label: string, x: number, y: number, width: number, height: number, opts: Partial<{ fontSize: number; color: string; fontFamily: string }> = {}) => ({
    id, placeholder: label, x, y, width, height,
    align: "center", fontFamily: opts.fontFamily ?? "'Playfair Display', serif",
    fontSize: opts.fontSize ?? 46, color: opts.color ?? "#3b2414",
    fontWeight: "normal", fontStyle: "normal", maxLength: 40,
  });

  const GALLERY_TEMPLATES = [
    {
      name: "Golden Birth Frame", categorySlug: "acrylic-birth", basePrice: 599, comparePrice: 899,
      overlayImageUrl: "/uploads/seed/acrylic-birth-gold.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.115, y: 0.115, width: 0.77, height: 0.6, shape: "rect", rotation: 0 },
      textAreas: [
        textField("name", "Baby's Name", 0.13, 0.775, 0.74, 0.08, { fontSize: 48 }),
        textField("dob", "Date of Birth", 0.13, 0.855, 0.74, 0.06, { fontSize: 30, fontFamily: "sans-serif" }),
      ],
    },
    {
      name: "Pastel Baby Frame", categorySlug: "acrylic-birth", basePrice: 649, comparePrice: 949,
      overlayImageUrl: "/uploads/seed/acrylic-birth-pastel.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.12, y: 0.14, width: 0.76, height: 0.6, shape: "rect", rotation: 0 },
      textAreas: [
        textField("name", "Baby's Name", 0.14, 0.79, 0.72, 0.08, { fontSize: 46, color: "#5c8aa8" }),
        textField("dob", "Date of Birth", 0.14, 0.865, 0.72, 0.05, { fontSize: 26, color: "#5c8aa8", fontFamily: "sans-serif" }),
      ],
    },
    {
      name: "Heart Love Frame", categorySlug: "acrylic-love", basePrice: 699, comparePrice: 999,
      overlayImageUrl: "/uploads/seed/acrylic-love-heart.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.2, y: 0.12, width: 0.6, height: 0.6, shape: "heart", rotation: 0 },
      textAreas: [
        textField("message", "Since / Message", 0.17, 0.79, 0.66, 0.09, { fontSize: 42, color: "#b5304a" }),
      ],
    },
    {
      name: "Rose Gold Couple Frame", categorySlug: "acrylic-love", basePrice: 749, comparePrice: 1049,
      overlayImageUrl: "/uploads/seed/acrylic-love-rosegold.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.15, y: 0.15, width: 0.7, height: 0.53, shape: "rect", rotation: 0 },
      textAreas: [
        textField("name1", "Partner 1 Name", 0.14, 0.735, 0.34, 0.1, { fontSize: 34, color: "#a6644f" }),
        textField("name2", "Partner 2 Name", 0.52, 0.735, 0.34, 0.1, { fontSize: 34, color: "#a6644f" }),
        textField("since", "Since (Year)", 0.3, 0.865, 0.4, 0.06, { fontSize: 26, color: "#a6644f", fontFamily: "sans-serif" }),
      ],
    },
    {
      name: "Our Family Dual Frame", categorySlug: "acrylic-dual", basePrice: 799, comparePrice: 1099,
      overlayImageUrl: "/uploads/seed/acrylic-dual-classic.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.13, y: 0.13, width: 0.74, height: 0.58, shape: "rect", rotation: 0 },
      textAreas: [
        textField("name1", "Name 1", 0.13, 0.735, 0.35, 0.12, { fontSize: 32, color: "#3b5d50" }),
        textField("name2", "Name 2", 0.515, 0.735, 0.35, 0.12, { fontSize: 32, color: "#3b5d50" }),
      ],
    },
    {
      name: "Classic Round Photo Clock", categorySlug: "clock-love", basePrice: 899, comparePrice: 1299,
      overlayImageUrl: "/uploads/seed/wallclock-classic.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.07, y: 0.07, width: 0.86, height: 0.86, shape: "circle", rotation: 0 },
      textAreas: [
        textField("name", "Name", 0.33, 0.855, 0.34, 0.07, { fontSize: 30, color: "#ffffff", fontFamily: "sans-serif" }),
      ],
    },
    {
      name: "Minimal Square Photo Clock", categorySlug: "clock-birth", basePrice: 849, comparePrice: 1199,
      overlayImageUrl: "/uploads/seed/wallclock-minimal.svg", canvasWidth: 1000, canvasHeight: 1000,
      photoArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84, shape: "rect", rotation: 0 },
      textAreas: [
        textField("name", "Name", 0.35, 0.865, 0.3, 0.06, { fontSize: 26, color: "#ffffff", fontFamily: "sans-serif" }),
      ],
    },
  ];

  for (const t of GALLERY_TEMPLATES) {
    const {
      categorySlug,
      textAreas,
      photoArea,
      overlayImageUrl,
      ...rest
    } = t;

    await prisma.product.create({
      data: {
        ...rest,

        // Product.imageUrl is required by the Prisma schema.
        // The gallery template uses its overlay artwork as the product preview.
        imageUrl: overlayImageUrl,
        overlayImageUrl,

        slug: `${rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`,
        description: `${rest.name} — upload your photo and it's applied instantly. Add names/dates and order.`,
        categoryId: sub[categorySlug],
        isGalleryTemplate: true,
        isCustomizable: true,
        photoArea: JSON.stringify(photoArea),
        textAreas: JSON.stringify(textAreas),
      },
    });

    console.log(`  ✅ Gallery design: ${t.name}`);
  }

  // Seed coupons
  await prisma.coupon.createMany({
    data: [
      { code: "MAA20", type: "percent", value: 20, minOrder: 0, maxUses: 1000, isActive: true },
      { code: "FIRST50", type: "flat", value: 50, minOrder: 299, maxUses: 500, isActive: true },
      { code: "FREESHIP", type: "flat", value: 59, minOrder: 199, isActive: true },
    ],
  });
  console.log("  ✅ Coupons seeded");

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
