import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateOtp(length = 4): string {
  const n = 10 ** length;
  const buf = randomBytes(4);
  const val = buf.readUInt32BE(0) % n;
  return String(val).padStart(length, "0");
}

export function hashOtp(otp: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${otp}`).digest("hex");
}

export function newOtpSecret(otp: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: hashOtp(otp, salt) };
}

export function verifyOtpHash(otp: string, salt: string, expectedHash: string): boolean {
  const got = hashOtp(otp.trim(), salt);
  if (got.length !== expectedHash.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expectedHash));
}

export function isPlausibleOtp(otp: string): boolean {
  return /^\d{4,6}$/.test(otp.trim());
}
