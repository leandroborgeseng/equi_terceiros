import type { UserRole } from "@/lib/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: UserRole;
    id: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      realId?: string;
      realRole?: UserRole;
      impersonating?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    name?: string;
    email?: string;
    realId?: string;
    realRole?: UserRole;
    realName?: string;
    realEmail?: string;
    impersonating?: boolean;
  }
}
