import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export function TabNav<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="sticky top-0 z-20 -mx-1 border-b-2 border-[var(--line-2)] bg-[color-mix(in_oklch,var(--bg)_92%,transparent)] backdrop-blur-md"
    >
      <div className="flex gap-0 overflow-x-auto px-1 scrollbar-none">
        {tabs.map((tab) => {
          const on = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative -mb-0.5 inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 bg-transparent px-3.5 py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors",
                on
                  ? "border-[var(--brand)] font-bold text-[var(--brand-ink)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink-2)]"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={on ? 2 : 1.6} />
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span
                  className={cn(
                    "font-mono-data inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 text-[10.5px] font-semibold",
                    on
                      ? "bg-[var(--brand)] text-white"
                      : "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
