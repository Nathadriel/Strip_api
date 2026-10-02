import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "T-shirt Next.js",
      description: "T-shirt en coton, logo Next.js",
      price: 24.99,
      image: "/products/tshirt.png",
    },
    {
      name: "Mug Stripe",
      description: "Mug céramique 350ml",
      price: 12.99,
      image: "/products/mug.png",
    },
    {
      name: "Sticker Pack",
      description: "Lot de 10 stickers développeur",
      price: 6.99,
      image: "/products/stickers.png",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  console.log(`${products.length} produits insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
