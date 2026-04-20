import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@/lib/server/d1";

declare global {
  interface CloudflareEnv {
    DB?: D1Database;
  }
}

export const getDb = async (): Promise<D1Database> => {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("Missing Cloudflare D1 binding: DB");
  }

  await env.DB.exec("PRAGMA foreign_keys = ON;");
  return env.DB;
};
