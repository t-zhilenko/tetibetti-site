# Teti Betti

Minimal Next.js UI foundation using the App Router, TypeScript, Tailwind CSS, and ESLint.

## Local Development

```bash
npm install
npm run dev
```

## Cloudflare Deploy (OpenNext)

Use OpenNext with **Cloudflare Workers Builds** (not `@cloudflare/next-on-pages`):

- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`
- Root directory: `/`
- Worker entry and assets are configured in `wrangler.toml`:
  - `main = ".open-next/worker.js"`
  - `assets.directory = ".open-next/assets"`
- Local commands:
  - `npm run build:cf`
  - `npm run deploy:cf`

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
  - `middleware.ts`
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
