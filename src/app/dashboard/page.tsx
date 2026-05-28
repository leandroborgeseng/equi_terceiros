import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROLE_ROUTES } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";

export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as UserRole;
  redirect(ROLE_ROUTES[role] ?? "/login");
}
