import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // Pont NextAuth <-> BDD
  session: { strategy: "jwt" }, // nécessaire pour que CredentialsProvider fonctionne avec l'adapter
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Email + Mot de passe
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.hashedPassword && (await bcrypt.compare(credentials.password, user.hashedPassword))) {
          return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // À la connexion, "user" est disponible : on y accroche l'id pour
      // pouvoir le relire dans la session (et requêter hasPaid à jour).
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // On relit hasPaid depuis la BDD à chaque session plutôt que de le
        // mettre en cache dans le token : sinon un achat ne serait reflété
        // qu'à la prochaine reconnexion.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { hasPaid: true },
        });
        session.user.hasPaid = dbUser?.hasPaid ?? false;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
