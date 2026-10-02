"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PayNowButton({
  productId,
  label = "Payer maintenant",
}: {
  productId?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // 1. Appel API pour créer la session Stripe
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productId ? { productId } : {}),
    });
    const data = await res.json();
    // 2. Redirection vers Stripe Checkout
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Redirection..." : label}
    </button>
  );
}
