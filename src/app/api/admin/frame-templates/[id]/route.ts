import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { emptyPhotoArea } from "@/lib/mockup";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const t = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...t,
    photoArea: t.photoArea ? JSON.parse(t.photoArea) : emptyPhotoArea(),
    textAreas: JSON.parse(t.textAreas || "[]"),
    images: JSON.parse(t.images || "[]"),
    tags: JSON.parse(t.tags || "[]"),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const template = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.basePrice !== undefined ? { basePrice: Number(body.basePrice) } : {}),
      ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
      ...(body.overlayImageUrl !== undefined ? { overlayImageUrl: body.overlayImageUrl, imageUrl: body.overlayImageUrl } : {}),
      ...(body.canvasWidth !== undefined ? { canvasWidth: Number(body.canvasWidth) } : {}),
      ...(body.canvasHeight !== undefined ? { canvasHeight: Number(body.canvasHeight) } : {}),
      ...(body.photoArea !== undefined ? { photoArea: JSON.stringify(body.photoArea) } : {}),
      ...(body.textAreas !== undefined ? { textAreas: JSON.stringify(body.textAreas) } : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...template,
    photoArea: template.photoArea ? JSON.parse(template.photoArea) : emptyPhotoArea(),
    textAreas: JSON.parse(template.textAreas || "[]"),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
