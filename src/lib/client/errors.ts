export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) {
    if (e.message === "Unauthorized") return fallback;
    return e.message;
  }
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return fallback;
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export async function compressImage(file: File, maxBytes: number): Promise<{
  dataUrl: string;
  contentType: "image/jpeg";
  bytes: number;
}> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress photo");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let quality = 0.72;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length * 0.75 > maxBytes && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  const bytes = Math.ceil((dataUrl.length * 3) / 4);
  if (bytes > maxBytes) throw new Error("Photo is too large even after compression");
  return { dataUrl, contentType: "image/jpeg", bytes };
}
