import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const DEFAULT_SECRET = "dev-secret-change-in-production";

function loadJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret === DEFAULT_SECRET) {
      throw new Error(
        "JWT_SECRET must be set to a secure value in production. Do not use dev-secret-change-in-production."
      );
    }
  }
  return secret ?? DEFAULT_SECRET;
}

let _jwtSecret: string | undefined;
function getJwtSecret(): string {
  if (_jwtSecret === undefined) _jwtSecret = loadJwtSecret();
  return _jwtSecret;
}

const COOKIE_NAME = "admin_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { adminId: string; login: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { adminId: string; login: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { adminId: string; login: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(): Promise<{ adminId: string; login: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
