import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return new NextResponse("Utilisateur introuvable", { status: 404 });

  // Le support ne montre pas cette étape, mais elle est indispensable en
  // pratique : on crée le client Stripe au premier achat, puis on le
  // réutilise (c'est lui qui est passé à stripe.checkout.sessions.create).
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  const body = await req.json().catch(() => ({}));
  const productId: string | undefined = body.productId;

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL;

  // Deux parcours possibles, distingués par la présence d'un productId :
  // achat d'un produit catalogue, ou upgrade vers l'accès Premium.
  let lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }>;
  let metadata: Record<string, string>;

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return new NextResponse("Produit introuvable", { status: 404 });

    lineItems = [
      {
        price_data: {
          currency: "eur",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100), // Stripe attend des CENTIMES
        },
        quantity: 1,
      },
    ];
    metadata = { userId: user.id, purchaseType: "product", productId: product.id };
  } else {
    lineItems = [
      {
        price_data: {
          currency: "eur",
          product_data: { name: "Accès Premium" },
          unit_amount: 499, // 4.99€ en CENTIMES
        },
        quantity: 1,
      },
    ];
    metadata = { userId: user.id, purchaseType: "premium" };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId, // Client Stripe
    mode: "payment", // Paiement unique
    line_items: lineItems,
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    metadata, // Pour le webhook
  });

  return NextResponse.json({ id: stripeSession.id });
}
