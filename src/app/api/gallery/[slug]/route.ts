import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emptyPhotoArea } from "@/lib/mockup";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category || !category.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const templates = await prisma.product.findMany({
    where: { categoryId: category.id, isGalleryTemplate: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    category,
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      basePrice: t.basePrice,
      comparePrice: t.comparePrice,
      overlayImageUrl: t.overlayImageUrl,
      canvasWidth: t.canvasWidth,
      canvasHeight: t.canvasHeight,
      photoArea: t.photoArea ? JSON.parse(t.photoArea) : emptyPhotoArea(),
      textAreas: JSON.parse(t.textAreas || "[]"),
    })),
  });
}
