import { DefaultSession } from "next-auth";

// Étend les types par défaut de NextAuth pour exposer id et hasPaid sur
// session.user, utilisés par la route checkout et la page d'accueil.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasPaid: boolean;
    } & DefaultSession["user"];
  }
}
