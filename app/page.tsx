export default function HomePage() {
  const palette = [
    { name: "soft", className: "bg-soft" },
    { name: "blush", className: "bg-blush" },
    { name: "beige", className: "bg-beige" },
    { name: "slateBlue", className: "bg-slateBlue" },
    { name: "deep", className: "bg-deep" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em]">Starter UI</p>
        <h1 className="text-4xl font-semibold">Teti Betti</h1>
        <p className="max-w-xl text-sm">
          Minimal Next.js + Tailwind foundation with a simple palette preview to
          verify deployments.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Palette</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {palette.map((color) => (
            <div
              key={color.name}
              className="border border-deep/10 rounded-lg overflow-hidden"
            >
              <div className={`h-20 ${color.className}`} />
              <div className="px-3 py-2 text-xs">{color.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
