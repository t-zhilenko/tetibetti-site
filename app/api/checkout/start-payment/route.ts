const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function POST() {
  return jsonResponse(
    {
      ok: false,
      code: "PAYMENTS_DISABLED",
      message: "Paid checkout is disabled. All products are free downloads.",
    },
    410,
  );
}
