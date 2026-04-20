type RateLimitInput = {
  key: string;
  windowMs: number;
  maxRequests: number;
};

type RateLimitResult = {
  isLimited: boolean;
  remaining: number;
};

const rateLimitStore = new Map<string, number[]>();
const MAX_RATE_LIMIT_KEYS = 5_000;

const trimExpired = (timestamps: number[], now: number, windowMs: number): number[] =>
  timestamps.filter((timestamp) => now - timestamp < windowMs);

const evictIfNeeded = () => {
  while (rateLimitStore.size > MAX_RATE_LIMIT_KEYS) {
    const oldestKey = rateLimitStore.keys().next().value;
    if (!oldestKey) {
      return;
    }
    rateLimitStore.delete(oldestKey);
  }
};

export const consumeRateLimit = (input: RateLimitInput): RateLimitResult => {
  const now = Date.now();
  const recent = trimExpired(rateLimitStore.get(input.key) ?? [], now, input.windowMs);
  const next = [...recent, now];
  rateLimitStore.set(input.key, next);
  evictIfNeeded();

  return {
    isLimited: next.length > input.maxRequests,
    remaining: Math.max(input.maxRequests - next.length, 0),
  };
};

export const getRequestIp = (request: Request): string => {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) {
    return cfIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor && forwardedFor.trim()) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "unknown";
};
