import { useId } from "react";
import type { PricePoint } from "@/lib/shop/data";
import { formatPrice } from "@/lib/shop/store";
import { cn } from "@/lib/utils";

export function PriceChart({
  history,
  targetPrice,
  currency = "INR",
  className,
}: {
  history: PricePoint[];
  targetPrice?: number | undefined;
  currency?: "INR" | "USD" | undefined;
  className?: string | undefined;
}) {
  const gradientId = useId();
  const values = history.map((h) => h.price);
  const min = Math.min(...values, targetPrice ?? Infinity);
  const max = Math.max(...values, targetPrice ?? -Infinity);
  const span = max - min || 1;

  const W = 320;
  const H = 120;
  const pad = 6;
  const x = (i: number) => (i / (history.length - 1)) * (W - pad * 2) + pad;
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);

  const line = history.map((h, i) => `${x(i).toFixed(1)},${y(h.price).toFixed(1)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  const targetY = targetPrice != null ? y(targetPrice) : null;

  const lowest = Math.min(...values);
  const highest = Math.max(...values);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label={`Price history over the last ${history.length} weeks (sample data)`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} className="text-primary" fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary"
          vectorEffect="non-scaling-stroke"
        />
        {targetY != null ? (
          <line
            x1={pad}
            x2={W - pad}
            y1={targetY}
            y2={targetY}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            className="stroke-success"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <circle
          cx={x(history.length - 1)}
          cy={y(values[values.length - 1]!)}
          r={3.5}
          className="fill-primary"
        />
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{history[0]?.date}</span>
        <span>
          Low <span className="font-semibold text-success">{formatPrice(lowest, currency)}</span> · High{" "}
          <span className="font-semibold text-foreground">{formatPrice(highest, currency)}</span>
        </span>
        <span>{history[history.length - 1]?.date}</span>
      </div>
    </div>
  );
}
