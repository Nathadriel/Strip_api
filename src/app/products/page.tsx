import { prisma } from "@/lib/prisma";
import PayNowButton from "@/components/PayNowButton";

export default async function ProductsPage() {
  const products = await prisma.product.findMany();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Nos produits</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{product.description}</p>
            <p className="mt-2 font-medium">{product.price.toFixed(2)} €</p>
            <div className="mt-4">
              <PayNowButton productId={product.id} label="Acheter" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
