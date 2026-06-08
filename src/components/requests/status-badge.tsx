import type { RequestStatus } from "@/lib/enums";
import { STATUS_TOKENS, statusBadgeClass } from "@/lib/status-tokens";
import { cn } from "@/lib/utils";

export function RequestStatusBadge({
  status,
  size = "md",
}: {
  status: RequestStatus;
  size?: "sm" | "md" | "lg";
}) {
  const token = STATUS_TOKENS[status] ?? { label: status, cls: "rascunho" };
  return (
    <span className={cn("gesteq-badge", statusBadgeClass(status), size === "sm" && "sm", size === "lg" && "lg")}>
      <span className="gesteq-dot" />
      {token.label}
    </span>
  );
}
