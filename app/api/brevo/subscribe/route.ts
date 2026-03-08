export const runtime = "edge";

import { handleBrevoAction } from "@/lib/brevo/actions";

export async function POST(request: Request) {
  return handleBrevoAction(request, "subscribe");
}
