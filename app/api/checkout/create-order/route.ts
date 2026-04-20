import {
  isFreeProduct,
  isPaidProduct,
  isProductPurchasable,
} from "@/lib/payments/product-helpers";
import { getDb } from "@/lib/server/db";
import { getOrCreateCustomerByEmail } from "@/lib/server/repositories/customers";
import { createOrder } from "@/lib/server/repositories/orders";
import { createPaymentAttempt } from "@/lib/server/repositories/paymentAttempts";
import { getProductBySlug } from "@/lib/server/repositories/products";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCT_SLUG_RE = /^[a-z0-9-]+$/;
const MAX_EMAIL_LENGTH = 320;
const MAX_PRODUCT_SLUG_LENGTH = 120;

type CreateOrderPayload = {
  email?: unknown;
  productSlug?: unknown;
};

type ErrorCode =
  | "INVALID_JSON"
  | "INVALID_EMAIL"
  | "MISSING_PRODUCT_SLUG"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_NOT_PURCHASABLE"
  | "CREATE_ORDER_FAILED";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const errorResponse = (code: ErrorCode, message: string, status: number) =>
  jsonResponse(
    {
      ok: false,
      code,
      message,
    },
    status,
  );

export async function POST(request: Request) {
  let payload: CreateOrderPayload;

  try {
    payload = (await request.json()) as CreateOrderPayload;
  } catch {
    return errorResponse("INVALID_JSON", "Invalid JSON", 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const productSlug =
    typeof payload.productSlug === "string" ? payload.productSlug.trim().toLowerCase() : "";

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return errorResponse("INVALID_EMAIL", "Invalid email", 400);
  }

  if (
    !productSlug ||
    productSlug.length > MAX_PRODUCT_SLUG_LENGTH ||
    !PRODUCT_SLUG_RE.test(productSlug)
  ) {
    return errorResponse("MISSING_PRODUCT_SLUG", "Missing productSlug", 400);
  }

  try {
    const db = await getDb();
    const product = await getProductBySlug(db, productSlug);

    if (!product) {
      return errorResponse("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    if (!isProductPurchasable(product)) {
      return errorResponse("PRODUCT_NOT_PURCHASABLE", "Product is not available for purchase", 409);
    }

    const customer = await getOrCreateCustomerByEmail(db, email);

    const orderId = crypto.randomUUID();

    const order = await createOrder(db, {
      id: orderId,
      customerId: customer.id,
      productId: product.id,
      amountMinor: product.priceMinor,
      currency: product.currency,
      status: "initiated",
      fulfillmentStatus: "pending",
      provider: isPaidProduct(product) ? "fondy" : "internal",
    });

    if (isFreeProduct(product)) {
      console.info("Create-order completed", {
        orderId: order.id,
        flow: "free",
        productSlug: product.slug,
      });

      return jsonResponse({
        ok: true,
        flow: "free",
        orderId: order.id,
        product: {
          slug: product.slug,
          name: product.name,
          priceMinor: product.priceMinor,
          currency: product.currency,
        },
      });
    }

    if (isPaidProduct(product)) {
      const paymentAttemptId = crypto.randomUUID();

      await createPaymentAttempt(db, {
        id: paymentAttemptId,
        orderId: order.id,
        provider: "fondy",
        status: "created",
        amountMinor: product.priceMinor,
        currency: product.currency,
      });

      console.info("Create-order completed", {
        orderId: order.id,
        flow: "paid",
        paymentAttemptId,
        productSlug: product.slug,
      });

      return jsonResponse({
        ok: true,
        flow: "paid",
        orderId: order.id,
        paymentAttemptId,
        product: {
          slug: product.slug,
          name: product.name,
          priceMinor: product.priceMinor,
          currency: product.currency,
        },
      });
    }

    return errorResponse("PRODUCT_NOT_PURCHASABLE", "Product is not available for purchase", 409);
  } catch (error) {
    console.error("Create-order failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return errorResponse("CREATE_ORDER_FAILED", "Unable to create order", 500);
  }
}
