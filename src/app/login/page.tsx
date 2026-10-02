"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
    }
  };

  return (
    <main className="mx-auto max-w-sm px-6 py-12">
      <h1 className="text-2xl font-bold">Connexion</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white">
          Se connecter
        </button>
      </form>

      <a href="/register" className="mt-3 block text-sm text-indigo-600 underline">
        Créer un compte
      </a>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="rounded border px-4 py-2"
        >
          Se connecter avec Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="rounded border bg-gray-900 px-4 py-2 text-white"
        >
          Se connecter avec GitHub
        </button>
      </div>
    </main>
  );
}
