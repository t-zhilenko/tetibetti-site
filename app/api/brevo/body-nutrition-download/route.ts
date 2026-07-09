import { handleBrevoAction } from "@/lib/brevo/actions";

export async function POST(request: Request) {
  return handleBrevoAction(request, "body_nutrition_download");
}
