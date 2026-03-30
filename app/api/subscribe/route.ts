import { handleBrevoAction } from "@/lib/brevo/actions";

export async function POST(request: Request) {
  const response = await handleBrevoAction(request, "subscribe");
  if (!response.ok) {
    return response;
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
