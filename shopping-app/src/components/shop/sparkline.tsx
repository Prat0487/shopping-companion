import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  className,
  strokeClass = "stroke-primary",
}: {
  data: { price: number }[] | number[];
  className?: string;
  strokeClass?: string;
}) {
  const values = (data as (number | { price: number })[]).map((d) =>
    typeof d === "number" ? d : d.price,
  );
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 30 - ((v - min) / span) * 26 - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
