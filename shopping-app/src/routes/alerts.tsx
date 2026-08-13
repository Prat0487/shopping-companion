import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, Check, Trash2, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductTile } from "@/components/shop/product-card";
import { Sparkline } from "@/components/shop/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { formatDate, formatPrice, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Price alerts — Market" },
      {
        name: "description",
        content:
          "Track target prices against current and last-known prices, with 12-week history for every watched product.",
      },
      { property: "og:title", content: "Price alerts — Market" },
      { property: "og:description", content: "Know the moment a watched product hits your price." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts, getProduct, toggleAlert, removeAlert, preferences } = useShop();
  const c = preferences.currency;

  const rows = alerts
    .map((a) => ({ alert: a, product: getProduct(a.productId) }))
    .filter((r) => r.product)
    .sort((a, b) => {
      const ga = a.product!.price - a.alert.targetPrice;
      const gb = b.product!.price - b.alert.targetPrice;
      return ga - gb;
    });

  const hit = rows.filter((r) => r.product!.price <= r.alert.targetPrice && r.alert.active);

  return (
    <AppShell>
      <PageHeader
        title="Price alerts"
        subtitle={`${alerts.filter((a) => a.active).length} active · ${hit.length} target${hit.length === 1 ? "" : "s"} reached`}
      />

      {hit.length > 0 ? (
        <section className="mb-6 rounded-3xl border border-success/40 bg-success/10 p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold">
            <Check className="h-4.5 w-4.5 text-success" /> Ready to buy
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {hit.map(({ alert, product }) => (
              <li key={alert.id}>
                <Link
                  to="/product/$productId"
                  params={{ productId: product!.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft"
                >
                  <ProductTile product={product!} className="h-12 w-12 shrink-0 aspect-auto rounded-xl" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{product!.title}</p>
                    <p className="text-xs text-success">
                      Now {formatPrice(product!.price, c)} · target {formatPrice(alert.targetPrice, c)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No price alerts yet"
          description="Set a target price on any product and it will show up here with its full price history."
          action={
            <Button asChild className="rounded-full">
              <Link to="/search" search={{ q: "", category: "all", sort: "discount" }}>
                Find something to watch
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ alert, product }) => {
            const p = product!;
            const gap = p.price - alert.targetPrice;
            const reached = gap <= 0;
            const span = Math.max(p.listPrice - alert.targetPrice, 1);
            const progress = Math.min(100, Math.max(0, ((p.listPrice - p.price) / span) * 100));
            const changed = p.price - alert.lastKnownPrice;

            return (
              <li key={alert.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:flex sm:items-start">
                  <Link to="/product/$productId" params={{ productId: p.id }} className="shrink-0">
                    <ProductTile product={p} className="h-20 w-20 aspect-auto rounded-2xl" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={alert.active ? "default" : "secondary"}
                        className="rounded-full text-xs"
                      >
                        {alert.active ? "Watching" : "Paused"}
                      </Badge>
                      {reached ? (
                        <Badge className="rounded-full bg-success text-xs text-primary-foreground">
                          Target reached
                        </Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        Last checked {formatDate(alert.lastCheckedAt)}
                      </span>
                    </div>

                    <h3 className="mt-1.5 font-semibold">
                      <Link
                        to="/product/$productId"
                        params={{ productId: p.id }}
                        className="hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted-foreground">{p.seller}</p>

                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-2xl bg-muted/60 p-2.5">
                        <dt className="text-muted-foreground">Current</dt>
                        <dd className="mt-0.5 font-display text-sm font-bold">
                          {formatPrice(p.price, c)}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-muted/60 p-2.5">
                        <dt className="text-muted-foreground">Last known</dt>
                        <dd className="mt-0.5 font-display text-sm font-bold">
                          {formatPrice(alert.lastKnownPrice, c)}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-muted/60 p-2.5">
                        <dt className="text-muted-foreground">Target</dt>
                        <dd className="mt-0.5 font-display text-sm font-bold text-success">
                          {formatPrice(alert.targetPrice, c)}
                        </dd>
                      </div>
                    </dl>

                    <Progress value={progress} className="mt-3 h-1.5" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className={reached ? "font-semibold text-success" : "text-muted-foreground"}>
                        {reached ? "Buy now — below your target" : `${formatPrice(gap, c)} above target`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        {changed < 0 ? (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 text-success" />
                            Down {formatPrice(Math.abs(changed), c)} since last check
                          </>
                        ) : changed > 0 ? (
                          <>Up {formatPrice(changed, c)} since last check</>
                        ) : (
                          <>Unchanged since last check</>
                        )}
                      </span>
                      <Sparkline data={p.history} className="h-6 w-20" />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-3 sm:col-auto sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                      {alert.active ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={alert.active}
                        aria-label={`Toggle alert for ${p.title}`}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-destructive hover:text-destructive"
                      onClick={() => {
                        removeAlert(alert.id);
                        toast.message("Alert removed");
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <DemoNote className="mt-6" />
    </AppShell>
  );
}
