import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { createProductSchema } from "@/lib/validators";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawBody: Record<string, unknown>;
  try {
    rawBody = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createProductSchema.safeParse({
    ...rawBody,
    price: typeof rawBody.price === "number" ? rawBody.price : rawBody.price != null ? Number(rawBody.price) : undefined,
    weight: rawBody.weight != null ? Number(rawBody.weight) : null,
    length: rawBody.length != null ? Number(rawBody.length) : null,
    width: rawBody.width != null ? Number(rawBody.width) : null,
    height: rawBody.height != null ? Number(rawBody.height) : null,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        composition: data.composition ?? null,
        price: data.price,
        ozonUrl: data.ozonUrl || null,
        badges: data.badges,
        images: data.images,
        videoUrl: data.videoUrl ?? null,
        weight: data.weight ?? null,
        length: data.length ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        cdekFulfillmentProductId: data.cdekFulfillmentProductId ?? null,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("[products POST] prisma create:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
