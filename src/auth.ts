import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail } from "@/lib/user-db";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost:
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = getUserByEmail(parsed.data.email);

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          email: user.email,
          id: user.id,
          name: user.name ?? user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }

      return session;
    },
  },
});
