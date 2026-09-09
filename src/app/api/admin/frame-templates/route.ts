import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";
import { emptyPhotoArea } from "@/lib/mockup";

export async function GET(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;

  const templates = await prisma.product.findMany({
    where: { isGalleryTemplate: true, ...(categoryId ? { categoryId } : {}) },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates.map((t) => ({
    ...t,
    photoArea: t.photoArea ? JSON.parse(t.photoArea) : emptyPhotoArea(),
    textAreas: JSON.parse(t.textAreas || "[]"),
    images: JSON.parse(t.images || "[]"),
    tags: JSON.parse(t.tags || "[]"),
  })));
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, categoryId, basePrice, overlayImageUrl, canvasWidth, canvasHeight } = body;
  if (!name || !categoryId) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
  const template = await prisma.product.create({
    data: {
      name,
      slug,
      description: body.description || `${name} — customize with your own photo.`,
      basePrice: Number(basePrice) || 0,
      imageUrl: overlayImageUrl || "",
      overlayImageUrl: overlayImageUrl || null,
      categoryId,
      isGalleryTemplate: true,
      isCustomizable: true,
      canvasWidth: Number(canvasWidth) || 1000,
      canvasHeight: Number(canvasHeight) || 1000,
      photoArea: JSON.stringify(emptyPhotoArea()),
      textAreas: JSON.stringify([]),
    },
    include: { category: true },
  });

  return NextResponse.json(template, { status: 201 });
}
