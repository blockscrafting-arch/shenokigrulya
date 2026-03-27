import { NextRequest, NextResponse } from "next/server";
import { calculateDelivery } from "@/lib/cdek";
import { z } from "zod";

const GoodSchema = z.object({
  weight: z.number().positive(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
});

const RequestSchema = z.object({
  deliveryCityCode: z.number().int().positive(),
  deliveryType: z.enum(["CDEK_PVZ", "CDEK_DOOR"]),
  goods: z.array(GoodSchema).min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { deliveryCityCode, deliveryType, goods } = parsed.data;
  const tariffCode = deliveryType === "CDEK_DOOR" ? 139 : 136;

  const totalWeight = goods.reduce((acc, g) => acc + g.weight, 0);
  const maxLength = Math.max(...goods.map((g) => g.length));
  const maxWidth = Math.max(...goods.map((g) => g.width));
  const maxHeight = Math.max(...goods.map((g) => g.height));

  const fromCityCode = process.env.CDEK_FROM_CITY_CODE ?? "44";

  try {
    const quote = await calculateDelivery({
      fromLocation: fromCityCode,
      toLocation: String(deliveryCityCode),
      weight: totalWeight,
      length: maxLength * 10,
      width: maxWidth * 10,
      height: maxHeight * 10,
      tariffCode,
    });
    return NextResponse.json({
      deliveryCost: quote.sum,
      periodMin: quote.deliveryMin,
      periodMax: quote.deliveryMax,
    });
  } catch (err) {
    console.warn("[delivery/price] CDEK error:", err);
    return NextResponse.json({ error: "CDEK unavailable" }, { status: 502 });
  }
}
