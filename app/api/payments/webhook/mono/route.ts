const textResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function GET() {
  return textResponse("Payments disabled", 410);
}

export async function POST() {
  return textResponse("Payments disabled", 410);
}
