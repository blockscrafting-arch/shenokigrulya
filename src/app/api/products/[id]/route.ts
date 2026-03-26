import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdmin = await getAdminFromRequest();
  if (!isAdmin && !product.isActive) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.title != null && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.composition !== undefined && { composition: data.composition ?? null }),
      ...(data.price != null && { price: data.price }),
      ...(data.ozonUrl !== undefined && { ozonUrl: data.ozonUrl || null }),
      ...(data.badges !== undefined && { badges: data.badges }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl ?? null }),
      ...(data.weight !== undefined && { weight: data.weight ?? null }),
      ...(data.length !== undefined && { length: data.length ?? null }),
      ...(data.width !== undefined && { width: data.width ?? null }),
      ...(data.height !== undefined && { height: data.height ?? null }),
      ...(data.cdekFulfillmentProductId !== undefined && {
        cdekFulfillmentProductId: data.cdekFulfillmentProductId ?? null,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
