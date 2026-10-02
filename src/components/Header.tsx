"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-semibold">
        paiement-stripe
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/products">Produits</Link>
        {status === "loading" ? null : session ? (
          <>
            <span className="text-gray-500">{session.user?.email}</span>
            {session.user?.hasPaid && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">Premium</span>
            )}
            <button onClick={() => signOut()} className="text-red-600">
              Déconnexion
            </button>
          </>
        ) : (
          <Link href="/login">Connexion</Link>
        )}
      </nav>
    </header>
  );
}
