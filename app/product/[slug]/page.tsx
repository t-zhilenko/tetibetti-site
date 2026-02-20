type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold">Product</h1>
      <p className="text-sm">Slug: {params.slug}</p>
    </div>
  );
}
