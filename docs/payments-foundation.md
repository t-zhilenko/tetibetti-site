# Payments Foundation

## What Was Added

- Cloudflare D1 binding configuration in `wrangler.toml`.
- Initial D1 schema migration in `migrations/0001_initial_schema.sql`.
- Typed paid product config in `config/products.ts`.
- Shared payment/order domain types in `lib/payments/types.ts`.
- D1 runtime access helper in `lib/server/db.ts`.
- Repository layer:
  - `lib/server/repositories/products.ts`
  - `lib/server/repositories/customers.ts`
  - `lib/server/repositories/orders.ts`
  - `lib/server/repositories/paymentAttempts.ts`
- Create-order endpoint: `app/api/checkout/create-order/route.ts`.
- Start-payment endpoint: `app/api/checkout/start-payment/route.ts`.
- Fondy webhook endpoint: `app/api/payments/webhook/fondy/route.ts`.
- Secure delivery and recovery endpoints/pages:
  - `app/access/[token]/page.tsx`
  - `app/order/lookup/page.tsx`
  - `app/api/orders/lookup/route.ts`
  - `app/api/orders/resend-access/route.ts`
  - `app/checkout/success/page.tsx`
  - `app/checkout/failed/page.tsx`
  - `app/checkout/pending/page.tsx`
- New payment/fulfillment repositories and services:
  - `lib/server/repositories/paymentEvents.ts`
  - `lib/server/repositories/deliveryTokens.ts`
  - `lib/server/repositories/emailDeliveries.ts`
  - `lib/server/fulfillment/paidProductDelivery.ts`
  - `lib/server/delivery/brevo.ts`

## D1 Configuration

- Wrangler file: `wrangler.toml`
- D1 binding name: `DB`
- Database:
  - `database_name = "teti-betti-prod"`
  - `database_id = "04ac9f33-5b6c-4055-9a46-d3b8b0577c33"`
  - `preview_database_id = "04ac9f33-5b6c-4055-9a46-d3b8b0577c33"`

## Migrations

- Migration directory: `migrations/`
- Migrations:
  - `migrations/0001_initial_schema.sql`
  - `migrations/0002_seed_products.sql` (consolidated post-schema bootstrap: product status + product commerce sync)
  - `migrations/0003_update_body_tracker_currency_to_uah.sql`
  - `migrations/0004_update_body_tracker_currency_to_usd.sql`

## Critical Environment Variables

- Payments:
  - `FONDY_MERCHANT_ID`
  - `FONDY_SECRET_KEY`
  - `APP_BASE_URL`
- Delivery/support email:
  - `BREVO_API_KEY`
  - `BREVO_SENDER_EMAIL`
  - `BREVO_SENDER_NAME`
  - `SUPPORT_EMAIL` (optional override; fallback is Brevo sender/support defaults)

## Product Commerce Source Of Truth

- Commerce fields now come from D1 for product-facing pages (`/`, `/shop`, `/products/[slug]`).
- DB-backed fields:
  - `name`
  - `slug`
  - `price_minor`
  - `currency`
  - `status`
  - `is_active`
  - `delivery_type`
  - `target_url`
- Long-form page content is still code-backed in `content/products.tsx`:
  - descriptions
  - feature sections
  - FAQ/accordion copy
  - media galleries and editorial text

### Safe Metadata Updates

1. Add a new SQL migration that updates product rows (do not edit already-applied migrations).
2. Apply migration locally and remotely (`npm run db:migrate:local`, `npm run db:migrate:remote`).
3. Keep `config/products.ts` aligned with DB values used by checkout/order creation.
4. Verify `/shop` and `/products/[slug]` reflect the updated title/price/status/CTA behavior.

### Apply Locally

```bash
npm run db:migrate:local
```

Equivalent command:

```bash
npx wrangler d1 migrations apply teti-betti-prod --local
```

### Apply Remotely

```bash
npm run db:migrate:remote
```

Equivalent command:

```bash
npx wrangler d1 migrations apply teti-betti-prod --remote
```

## Create-Order API

- Endpoint: `POST /api/checkout/create-order`
- Input JSON:
  - `email`
  - `productSlug`
- Flow:
  - validates JSON and required fields
  - loads product from D1 by slug (`products` table is source of truth for commerce fields)
  - if product is missing, returns `404` with `code = "PRODUCT_NOT_FOUND"`
  - if product is not purchasable (`is_active !== 1` or `status !== "active"`), returns `409` with `code = "PRODUCT_NOT_PURCHASABLE"`
  - gets or creates customer by email
  - creates order with:
    - `status = initiated`
    - `fulfillment_status = pending`
    - `provider = internal` for free products
    - `provider = fondy` for paid products
  - free flow (`price_minor = 0`):
    - creates order
    - does **not** create `payment_attempts`
    - returns `{ ok: true, flow: "free", orderId, product }`
  - paid flow (`price_minor > 0`):
    - creates order
    - creates payment attempt (`provider = fondy`, `status = created`)
    - returns `{ ok: true, flow: "paid", orderId, paymentAttemptId, product }`
- Error behavior:
  - invalid input: `400`
  - missing product: `404` (`PRODUCT_NOT_FOUND`)
  - not purchasable product: `409` (`PRODUCT_NOT_PURCHASABLE`)
  - unexpected errors: `500` with safe response body

## Start-Payment API

- Endpoint: `POST /api/checkout/start-payment`
- Input JSON:
  - `orderId`
- Website checkout page behavior:
  - frontend checkout page collects only order-preparation data (email + selected product)
  - card details are **not** entered on tetibetti.com
  - user is redirected to Fondy hosted checkout for actual payment entry
- Required server env vars:
  - `FONDY_MERCHANT_ID`
  - `FONDY_SECRET_KEY`
  - `APP_BASE_URL`
- Flow:
  - validates JSON and `orderId`
  - loads order from D1 and checks order is still payable (`paid/failed/expired` are rejected)
  - loads related product and customer from D1
  - ensures order product is paid (`price_minor > 0`) and purchasable (`is_active = 1`, `status = 'active'`)
  - loads latest `payment_attempt` for order
  - self-heals missing/inconsistent attempts by creating a fresh `fondy` attempt from order amount/currency
  - validates attempt status is still payable before redirect initialization
  - temporary compatibility switch:
    - `FONDY_MINIMAL_COMPAT_PAYLOAD_MODE=true` enables Magento-like minimal payload mode
    - `FONDY_MINIMAL_COMPAT_PAYLOAD_MODE=false` (or unset) keeps current full payload mode
  - minimal compatibility payload mode sends only:
    - `order_id`
    - `merchant_id`
    - `amount`
    - `order_desc`
    - `sender_email`
    - `product_id` (fixed value: `"Fondy"`)
    - `server_callback_url`
    - `response_url`
    - `currency`
  - in minimal mode, `merchant_data` is excluded
  - in full mode, `merchant_data` is included; `decline_url` is optional and currently disabled
  - signature consistency rule: every outgoing Fondy field except `signature` must be included in signature generation, or not sent at all
  - canonical checkout redirects:
    - success URL: `/checkout/success?orderId=<id>`
    - failed URL: `/checkout/failed?orderId=<id>` (available for optional `decline_url` in full mode; currently disabled)
  - keeps `order_desc` short/plain (product name only; no UUID in description)
  - calls Fondy checkout endpoint (`https://pay.fondy.eu/api/checkout/url`)
  - updates `payment_attempts`:
    - `status = pending`
    - `provider_order_id = tb_<orderId>`
    - `payload_json = { request, response }`
  - marks order as `processing`
  - returns:
    - `{ ok: true, checkout: { provider: "fondy", method: "redirect", checkoutUrl } }`
- Error behavior:
  - invalid input: `400`
  - missing order: `404`
  - non-payable order/product/payment attempt: `409`
  - missing payment config env: `500`
  - provider initialization failure: `502`
  - unexpected errors: `500` with safe response body
- State transition choice:
  - this endpoint does **not** mark order as paid
  - final payment confirmation and paid/failed/expired/manual-review status transitions are handled in webhook flow

### Fondy Logging

- Runtime logging is intentionally minimal in production:
  - order/payment event identifiers
  - provider HTTP status and compact response status/error codes
  - no outgoing payload dumps
  - no signature material/value dumps
- Signature/payload field-set mismatch is always treated as a blocking configuration error before request send.
- Secret handling:
  - `FONDY_SECRET_KEY` and Brevo API keys are never logged
  - raw delivery token values are never logged

## Fondy Webhook (Source Of Truth)

- Endpoint: `POST /api/payments/webhook/fondy`
- Behavior:
  - accepts JSON and `x-www-form-urlencoded` callback payloads
  - validates Fondy signature using `secret|sorted_values` (`sha1`)
  - computes deterministic idempotency key and stores raw callback in `payment_events`
  - ignores already-processed duplicate events
  - acknowledges fresh in-flight duplicates (short window) to reduce concurrent double-processing
  - resolves order from `order_id` (`tb_<orderId>`) and/or `merchant_data.orderId`
  - verifies callback amount/currency against stored order values
  - applies status transitions:
    - paid callback:
      - order: `paid`
      - fulfillment: `ready_for_delivery` (then `delivered` or `delivery_failed` by fulfillment service)
      - payment attempt: `paid`
    - failed callback:
      - order: `failed`
      - payment attempt: `failed`
    - expired/cancelled callback:
      - order: `expired`
      - payment attempt: `expired`
    - processing/pending callback:
      - order: `processing`
      - payment attempt: `pending`
    - amount/currency mismatch or unknown status:
      - order: `manual_review`
      - payment attempt marked with raw manual-review status
  - returns `200 OK` (`"OK"`) on accepted processing/duplicates

## Fulfillment & Secure Delivery

- Service: `lib/server/fulfillment/paidProductDelivery.ts`
- Delivery flow after successful webhook:
  1. load paid order with customer/product
  2. create/reuse secure delivery token record (`delivery_tokens`) and store token hash only
  3. create `email_deliveries` row (`pending`)
  4. send Brevo transactional email using template ID `6` with:
     - `product_name`
     - `access_url`
     - `support_email`
     and `access_url = ${APP_BASE_URL}/access/<token>`
  5. update `email_deliveries` to `sent` or `failed`
  6. update order fulfillment to `delivered` or `delivery_failed`

- Token access page: `/access/[token]`
  - validates hashed token against D1
  - validates token not revoked/expired
  - requires paid order before showing product access CTA
  - keeps route `noindex`

## Recovery Flows

- Success page: `/checkout/success`
  - shows callback-verification state
  - renders paid/processing/failed/manual-review state summary by `orderId` when available
  - reminds user to check inbox/spam
  - links to resend flow and support

- Failed page: `/checkout/failed`
  - calm failure message
  - retry checkout CTA + support/lookup links

- Pending page: `/checkout/pending`
  - lightweight verification state page while callback processing is in progress

- Order lookup:
  - page: `/order/lookup`
  - API: `POST /api/orders/lookup`
  - input: `email`
  - returns paid orders only (minimal safe fields)
  - enforces per-IP request throttling

- Resend access:
  - API: `POST /api/orders/resend-access`
  - input: `email` and/or `orderId`
  - requires paid order
  - reuses latest valid token when possible and sends new email attempt
  - enforces per-key request throttling and a short resend cooldown window

## Idempotency & Security Notes

- Webhook idempotency:
  - each callback is stored in `payment_events` with unique `idempotency_key`
  - already-processed duplicate callbacks are acknowledged without re-running state changes
  - short-window in-flight duplicates are acknowledged to reduce race-condition re-entry

- Fulfillment idempotency:
  - webhook-triggered fulfillment skips duplicate sends when order is already `delivered`
  - token reuse avoids unnecessary duplicate token creation for repeated success callbacks

- Security:
  - callback signature is validated before processing
  - payment amount/currency must match order values
  - raw product URL is exposed only after token validation on `/access/[token]`
  - paid delivery email includes secure `access_url`; raw product target URLs are not sent as template params
  - secrets are never logged (`FONDY_SECRET_KEY`, Brevo API key)

## Final Paid Flow

1. `POST /api/checkout/create-order`
2. `POST /api/checkout/start-payment`
3. browser redirects to Fondy hosted checkout
4. Fondy sends webhook to `/api/payments/webhook/fondy`
5. webhook validates signature and idempotency, then marks order/payment statuses
6. on paid event, secure token is created/reused
7. Brevo access email is sent and delivery records are persisted
8. customer opens `/access/[token]` to reach product access CTA

## Brevo Paid Delivery Template

- Template ID: `6`
- Provider: `brevo`
- Template params sent by backend:
  - `product_name`
  - `access_url`
  - `support_email`
- `access_url` always points to our secure route: `${APP_BASE_URL}/access/<token>`
- The email does not receive raw product/Notion target URLs directly.

## Checkout Flow

- Paid flow:
  1. `POST /api/checkout/create-order`
  2. `POST /api/checkout/start-payment`
  3. frontend redirects to Fondy `checkoutUrl`
- Free flow:
  - create-order returns `flow = "free"` and no payment attempt is created
- Coming soon / non-purchasable flow:
  - create-order returns `ok = false` and no order/payment rows are created

## Next Implementation Steps

1. Validate webhook behavior in Fondy merchant production mode after account approval.
2. Verify Brevo template ID `6` content/branding in production.
3. Add durable/distributed rate limiting (KV/Redis/D1-backed) if abuse patterns appear.
4. Implement free-flow secure token delivery reuse on top of the same fulfillment primitives.
