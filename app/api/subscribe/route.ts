import { handleSubscribe } from "@/lib/subscribe";

export const runtime = "edge";

export async function POST(request: Request) {
  return handleSubscribe(request, process.env.BREVO_API_KEY);
}
