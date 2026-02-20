# Teti Betti

Minimal Next.js UI foundation using the App Router, TypeScript, Tailwind CSS, and ESLint.

## Local Development

```bash
npm install
npm run dev
```

## Cloudflare Pages Deploy

Settings for a standard Next.js App Router build:

- Framework preset: Next.js
- Build command: `npm run build`
- Build output directory: `.next`
- Root directory: `/`

Cloudflare Pages will run `npm install` automatically.

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
