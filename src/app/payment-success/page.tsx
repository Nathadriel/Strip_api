export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12 text-center">
      <h1 className="text-2xl font-bold">Paiement réussi 🎉</h1>
      <p className="mt-4 text-gray-600">
        Merci pour votre achat. La confirmation peut prendre quelques secondes
        le temps que le webhook Stripe synchronise la base de données.
      </p>
      <a href="/" className="mt-6 inline-block text-indigo-600 underline">
        Retour à l&apos;accueil
      </a>
    </main>
  );
}
