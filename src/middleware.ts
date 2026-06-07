import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { canAccessRoute } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";

const { auth } = NextAuth(authConfig);

const publicPaths = [
  "/login",
  "/solicitar",
  "/fornecedor",
  "/equipamento/",
  "/api/auth",
  "/api/public",
  "/api/health",
  "/manifest.webmanifest",
  "/sw.js",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/"
  ) {
    if (pathname === "/" && req.auth) {
      const role = req.auth.user?.role as UserRole;
      const routes: Record<UserRole, string> = {
        ADMIN: "/dashboard/engenharia",
        ENGENHARIA_CLINICA: "/dashboard/engenharia",
        MEDICO: "/dashboard/medico",
        FORNECEDOR: "/dashboard/fornecedor",
        CENTRO_CIRURGICO: "/dashboard/centro-cirurgico",
        CME_CCIH_NSP: "/dashboard/cme",
      };
      return NextResponse.redirect(new URL(routes[role] ?? "/login", req.url));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/dashboard") {
    return NextResponse.next();
  }

  const role = req.auth.user?.role as UserRole;
  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
