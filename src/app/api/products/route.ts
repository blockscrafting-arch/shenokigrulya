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

  const body = await request.json();
  const parsed = createProductSchema.safeParse({
    ...body,
    price: typeof body.price === "number" ? body.price : body.price != null ? Number(body.price) : undefined,
    weight: body.weight != null ? Number(body.weight) : null,
    length: body.length != null ? Number(body.length) : null,
    width: body.width != null ? Number(body.width) : null,
    height: body.height != null ? Number(body.height) : null,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
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
}
