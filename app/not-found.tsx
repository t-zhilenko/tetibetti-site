import Link from "next/link";

export default function RootNotFoundPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl text-deep/90">Page not found</h1>
      <p className="mt-3 text-sm text-deep/70">
        The page you requested does not exist.
      </p>
      <Link href="/en" className="mt-4 inline-block text-sm text-deep/70 underline underline-offset-4">
        Go to home
      </Link>
    </main>
  );
}
