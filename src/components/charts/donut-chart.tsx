"use client";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 168,
  thickness = 22,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--line-2)"
            strokeWidth={thickness}
          />
          {total > 0 &&
            data.map((d) => {
              const fraction = d.value / total;
              const dash = fraction * circumference;
              const circle = (
                <circle
                  key={d.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-500"
                />
              );
              offset += dash;
              return circle;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[30px] font-semibold text-[var(--ink)]">{total}</span>
          <span className="font-mono-data text-[10px] tracking-widest text-[var(--faint)]">EQUIP.</span>
        </div>
      </div>

      <div className="grid min-w-[150px] flex-1 gap-2">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.label} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
              <span className="flex-1 text-[13px] text-[var(--ink-2)]">{d.label}</span>
              <span className="font-mono-data text-[13px] font-semibold text-[var(--ink)]">{d.value}</span>
              <span className="font-mono-data w-9 text-right text-[11.5px] text-[var(--faint)]">{pct}%</span>
            </div>
          );
        })}
        {total === 0 && <p className="text-sm text-[var(--faint)]">Sem dados no período.</p>}
      </div>
    </div>
  );
}
