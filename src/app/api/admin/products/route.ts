import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;

  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search } } : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(p => ({
    ...p,
    images: JSON.parse(p.images || "[]"),
    tags: JSON.parse(p.tags || "[]"),
  })));
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, description, basePrice, comparePrice, imageUrl, categoryId, isCustomizable, isFeatured, tags } = body;

  const slug = slugify(name);

  const product = await prisma.product.create({
    data: {
      name, slug, description,
      basePrice: Number(basePrice),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      imageUrl,
      images: JSON.stringify([imageUrl]),
      categoryId,
      isCustomizable: Boolean(isCustomizable),
      isFeatured: Boolean(isFeatured),
      tags: JSON.stringify(tags || []),
    },
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
