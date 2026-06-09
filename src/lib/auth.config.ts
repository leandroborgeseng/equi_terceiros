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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as UserRole;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.realId = user.id;
        token.realRole = user.role as UserRole;
        token.realName = user.name ?? undefined;
        token.realEmail = user.email ?? undefined;
        token.impersonating = false;
      }

      if (trigger === "update" && session?.impersonate) {
        const imp = session.impersonate as {
          id: string;
          role: UserRole;
          name: string;
          email: string;
        };
        if (!token.realId) {
          token.realId = token.id;
          token.realRole = token.role as UserRole;
          token.realName = token.name;
          token.realEmail = token.email;
        }
        token.id = imp.id;
        token.role = imp.role;
        token.name = imp.name;
        token.email = imp.email;
        token.impersonating = true;
      }

      if (trigger === "update" && session?.stopImpersonate) {
        if (token.realId) token.id = token.realId;
        if (token.realRole) token.role = token.realRole;
        if (token.realName) token.name = token.realName;
        if (token.realEmail) token.email = token.realEmail;
        token.impersonating = false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.realId = token.realId as string | undefined;
        session.user.realRole = token.realRole as UserRole | undefined;
        session.user.impersonating = !!token.impersonating;
      }
      return session;
    },
  },
};
