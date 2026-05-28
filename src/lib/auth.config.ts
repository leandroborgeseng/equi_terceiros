import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/enums";
import { getAuthSecret } from "@/lib/env";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};
