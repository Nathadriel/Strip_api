import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  // 1. Lire le corps brut et la signature
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Signature manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Signature webhook invalide :", err.message);
    return new NextResponse(`Signature invalide : ${err.message}`, { status: 400 });
  }

  // 2. Traiter l'événement
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const purchaseType = session.metadata?.purchaseType;
      const productId = session.metadata?.productId;

      if (!userId) break;

      if (purchaseType === "product" && productId) {
        // Créer une commande avec son item
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          await prisma.order.create({
            data: {
              userId,
              status: "paid",
              total: product.price,
              items: {
                create: [{ productId: product.id, quantity: 1, price: product.price }],
              },
            },
          });
        }
      } else {
        // Activer l'accès premium
        await prisma.user.update({
          where: { id: userId },
          data: { hasPaid: true },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}