# Teti Betti

Minimal Next.js UI foundation using the App Router, TypeScript, Tailwind CSS, and ESLint.

## Local Development

```bash
npm install
npm run dev
```

## Cloudflare Deploy (OpenNext)

Build settings for Cloudflare Pages/Workers using the OpenNext Cloudflare adapter:

- Build command: `npm run build:cf`
- Build output directory: `.open-next`
- Root directory: `/`
- This project is migrated off `@cloudflare/next-on-pages`; keep using `@opennextjs/cloudflare`.
- Pages build output for static assets is `.vercel/output/static` (see `wrangler.toml`).

## Styling Notes

- Fonts: Playfair Display for headings, Inter for body/UI, Great Vibes for the brand wordmark.
- Brand colors: soft, blush, beige, slateBlue, deep (see `app/globals.css`).

## Localization (next-intl)

- Supported locales: `en`, `uk`
- Default locale: `en`
- Locale routing: `/en/...`, `/uk/...`
- Messages live in:
  - `messages/en.json`
  - `messages/uk.json`
- i18n setup files:
  - `i18n/routing.ts`
  - `i18n/navigation.ts`
  - `i18n/request.ts`
  - `proxy.ts`
- App routes are locale-segmented under `app/[locale]/...`.

### Add a new language

1. Add the locale to `i18n/routing.ts` and keep a default locale configured.
2. Create `messages/<locale>.json`.
3. Add locale content in `content/products.tsx` if product copy needs localization.
4. Rebuild and verify routes and metadata for the new locale.

### Translate a new page or component

1. Add keys in `messages/en.json`.
2. Add translated values in `messages/uk.json`.
3. Use `getTranslations` in server components/pages or `useTranslations` in client components.
4. Keep navigation links locale-safe via `@/i18n/navigation`.

## Project Structure

- `app/layout.tsx` root HTML layout
- `app/globals.css` Tailwind and design tokens
- `app/page.tsx` root redirect to default locale
- `app/[locale]/layout.tsx` locale layout with providers/header/footer
- `app/[locale]/page.tsx` localized home page
- `app/[locale]/shop/page.tsx` localized shop page
- `app/[locale]/products/[slug]/page.tsx` localized dynamic product page
- `content/products.tsx` locale-aware product config
