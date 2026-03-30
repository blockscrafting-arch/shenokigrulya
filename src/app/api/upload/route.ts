import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function hasImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const gif =
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61;
  const webp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  return jpeg || png || gif || webp;
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      { error: "Разрешены только изображения: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext || ".jpg")) {
    return NextResponse.json(
      { error: "Недопустимое расширение файла" },
      { status: 400 }
    );
  }

  let buffer: Buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать файл" }, { status: 400 });
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Размер файла не должен превышать 5 МБ" },
      { status: 413 }
    );
  }
  if (!hasImageSignature(buffer)) {
    return NextResponse.json(
      { error: "Файл не является допустимым изображением (JPEG, PNG, WebP, GIF)" },
      { status: 400 }
    );
  }

  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, name);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("[upload] write failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const url = `/uploads/${name}`;
  return NextResponse.json({ url });
}
