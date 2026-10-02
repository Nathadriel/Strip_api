import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import PayNowButton from "@/components/PayNowButton";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hasPaid: true },
      })
    : null;

  const hasActiveSubscription = Boolean(user?.hasPaid);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Accès Premium — 4,99 €</h1>

      {!session ? (
        <p className="mt-4 text-gray-600">Connecte-toi pour acheter l&apos;accès Premium.</p>
      ) : !hasActiveSubscription ? (
        <div className="mt-6">
          <PayNowButton label="Payer maintenant" />
        </div>
      ) : (
        <div className="mt-6">
          <p>✅ Vous avez déjà un accès Premium !</p>
          <ul className="mt-2 list-disc pl-5 text-gray-600">
            <li>Accès à des contenus exclusifs</li>
            <li>Des réductions sur les produits</li>
            <li>Une expérience utilisateur améliorée</li>
          </ul>
        </div>
      )}
    </main>
  );
}
