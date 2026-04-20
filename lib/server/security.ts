import { createHash, timingSafeEqual } from "node:crypto";

export const sha256Hex = (value: string): string =>
  createHash("sha256").update(value, "utf8").digest("hex").toLowerCase();

export const sha1Hex = (value: string): string =>
  createHash("sha1").update(value, "utf8").digest("hex").toLowerCase();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_RE.test(value);

export const safeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return timingSafeEqual(leftBuffer, rightBuffer);
};
