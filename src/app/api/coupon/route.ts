import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }
    if (orderTotal < coupon.minOrder) {
      return NextResponse.json({
        error: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
      }, { status: 400 });
    }

    const discount =
      coupon.type === "percent"
        ? Math.round(orderTotal * (coupon.value / 100))
        : coupon.value;

    return NextResponse.json({ code: coupon.code, discount, type: coupon.type, value: coupon.value });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
