import crypto from "crypto";

const SECRET = process.env.SUCCESS_ORDER_SECRET ?? process.env.JWT_SECRET ?? "dev-success-secret";

export function signOrderId(orderId: string): string {
  return crypto.createHmac("sha256", SECRET).update(orderId).digest("hex");
}

export function verifyOrderId(orderId: string, sig: string | null): boolean {
  if (!sig || !/^[a-f0-9]+$/i.test(sig)) return false;
  const expected = signOrderId(orderId);
  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
