import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type { Role } from "@devitinternational/db";
import { getAuthSecret } from "./lib/auth-secret";

const dashboardCookiePrefix = "devit-dashboard";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any),

  session: { strategy: "jwt" },

  cookies: {
    sessionToken: { name: `${dashboardCookiePrefix}.session-token` },
    callbackUrl: { name: `${dashboardCookiePrefix}.callback-url` },
    csrfToken: { name: `${dashboardCookiePrefix}.csrf-token` },
    pkceCodeVerifier: { name: `${dashboardCookiePrefix}.pkce.code_verifier` },
    state: { name: `${dashboardCookiePrefix}.state` },
    nonce: { name: `${dashboardCookiePrefix}.nonce` },
  },

  // Override to plain HS256 so backend can verify with jose directly
  jwt: {
    async encode({ token }): Promise<string> {
      return new SignJWT(token as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getAuthSecret());
    },
    async decode({ token }) {
      if (!token) return null;
      const { payload } = await jwtVerify(token, getAuthSecret(), {
        algorithms: ["HS256"],
      });
      // Cast to JWT — our token shape matches because we put id/role in the jwt callback
      return payload as import("next-auth/jwt").JWT;
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth: only ADMIN or CREATOR can access dashboard
      if (account?.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true },
        });
        if (!dbUser || dbUser.role === "LEARNER") return false;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user.role ?? "LEARNER") as Role;
      }
      // Always refresh role from DB — role changes take effect immediately
      if (typeof token.id === "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, name: true, email: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
