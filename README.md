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

## Project Structure

- `app/layout.tsx` global layout with header/footer
- `app/globals.css` Tailwind and design tokens
- `app/page.tsx` home page
- `app/shop/page.tsx` shop page
- `app/product/[slug]/page.tsx` dynamic product page
- `app/blog/page.tsx` blog page
- `app/about/page.tsx` about page
- `app/faq/page.tsx` FAQ page
- `app/contact/page.tsx` contact page
- `app/privacy/page.tsx` privacy page
- `app/terms/page.tsx` terms page
- `app/refund/page.tsx` refund page
- `app/success/page.tsx` success page
