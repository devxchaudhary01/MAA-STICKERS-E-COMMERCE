import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guestName, guestEmail, guestPhone,
      shippingAddress, paymentMethod,
      items, subtotal, shippingCost, discount = 0, total,
    } = body;

    if (!items?.length || !guestEmail || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        guestName,
        guestEmail,
        guestPhone,
        shippingAddress,
        paymentMethod,
        status: "confirmed",
        paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
        subtotal,
        shippingCost,
        discount,
        total,
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            productImage: string;
            quantity: number;
            price: number;
            variantInfo?: string;
            customization?: string;
            uploadedImage?: string;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
            variantInfo: item.variantInfo,
            customization: item.customization,
            uploadedImage: item.uploadedImage,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber");

    if (!email && !orderNumber) {
      return NextResponse.json({ error: "email or orderNumber required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        ...(orderNumber ? { orderNumber } : {}),
        ...(email ? { guestEmail: email } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
