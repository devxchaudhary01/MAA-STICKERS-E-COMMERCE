import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({
    include: { children: true, parent: true, _count: { select: { products: true } } },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, description, imageUrl, parentId, type, sortOrder } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const category = await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      description: description || null,
      imageUrl: imageUrl || null,
      parentId: parentId || null,
      type: type === "GALLERY" ? "GALLERY" : "STANDARD",
      sortOrder: Number(sortOrder) || 0,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
