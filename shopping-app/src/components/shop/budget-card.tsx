import { Link } from "@tanstack/react-router";
import { AlertTriangle, PiggyBank, Wallet } from "lucide-react";
import { formatPrice, useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function BudgetCard({ className }: { className?: string }) {
  const { budget, preferences } = useShop();
  const c = preferences.currency;
  const over = budget.remaining < 0;

  return (
    <section
      className={cn("rounded-3xl border border-border bg-card p-5 shadow-soft", className)}
      aria-label="Shopping budget"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold">
            <PiggyBank className="h-4.5 w-4.5 text-primary" /> August shopping budget
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Informational only — nothing is linked to your bank.
          </p>
        </div>
        <Link to="/profile" className="shrink-0 text-xs font-semibold text-primary hover:underline">
          Edit
        </Link>
      </div>

      <p className="mt-4 font-display text-2xl font-bold">
        {formatPrice(budget.committed, c)}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          of {formatPrice(budget.monthlyBudget, c)}
        </span>
      </p>
      <Progress value={budget.usedPct} className={cn("mt-3 h-2", over && "[&>div]:bg-destructive")} />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-muted/60 p-3">
          <dt className="text-xs text-muted-foreground">{over ? "Over budget by" : "Left this month"}</dt>
          <dd className={cn("mt-0.5 font-semibold", over ? "text-destructive" : "text-success")}>
            {formatPrice(Math.abs(budget.remaining), c)}
          </dd>
        </div>
        <div className="rounded-2xl bg-muted/60 p-3">
          <dt className="text-xs text-muted-foreground">Wishlist would cost</dt>
          <dd className="mt-0.5 font-semibold">{formatPrice(budget.wishlistPotential, c)}</dd>
        </div>
      </dl>

      {over ? (
        <p className="mt-3 inline-flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          You have committed more than your monthly budget. Consider waiting for a price drop.
        </p>
      ) : budget.wishlistPotential > budget.remaining ? (
        <p className="mt-3 inline-flex items-start gap-2 rounded-2xl bg-warning/15 p-3 text-xs font-medium text-warning-foreground">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
          Buying everything saved would exceed what's left this month by{" "}
          {formatPrice(budget.wishlistPotential - budget.remaining, c)}.
        </p>
      ) : null}
    </section>
  );
}

/** Inline warning for a single purchase decision. */
export function BudgetImpact({ price }: { price: number }) {
  const { budget, preferences } = useShop();
  const after = budget.remaining - price;
  const over = after < 0;

  return (
    <p
      className={cn(
        "rounded-2xl p-3 text-xs font-medium",
        over ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
      )}
    >
      {over
        ? `This purchase would put you ${formatPrice(Math.abs(after), preferences.currency)} over your monthly budget.`
        : `Fits your budget — ${formatPrice(after, preferences.currency)} would be left this month.`}
    </p>
  );
}
