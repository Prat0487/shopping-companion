import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, IndianRupee, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductTile } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { returnStatusLabel, type ReturnStatus } from "@/lib/shop/data";
import { formatDate, formatPrice, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & refunds — Market" },
      {
        name: "description",
        content:
          "Track return pickups and refund progress for delivered orders, with refund amounts and expected credit dates.",
      },
      { property: "og:title", content: "Returns & refunds — Market" },
      { property: "og:description", content: "Every return and refund, in one place." },
    ],
  }),
  component: ReturnsPage,
});

const flow: ReturnStatus[] = [
  "requested",
  "pickup_scheduled",
  "in_transit",
  "refund_initiated",
  "refunded",
];

function ReturnsPage() {
  const { orders, getProduct, advanceReturn, cancelReturn, preferences } = useShop();
  const c = preferences.currency;

  const rows = orders
    .filter((o) => o.returnStatus !== "none")
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  const eligible = orders.filter((o) => o.status === "delivered" && o.returnStatus === "none");
  const refundTotal = rows.reduce((s, o) => s + (o.refundAmount ?? 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="Returns & refunds"
        subtitle={`${rows.length} in progress · ${formatPrice(refundTotal, c)} in refunds tracked`}
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/orders">All orders</Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No returns in progress"
          description={
            eligible.length > 0
              ? `${eligible.length} delivered order${eligible.length === 1 ? "" : "s"} are still inside their return window.`
              : "When you start a return from an order, its pickup and refund progress shows up here."
          }
          action={
            <Button asChild className="rounded-full">
              <Link to="/orders">Go to orders</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((order) => {
            const step = flow.indexOf(order.returnStatus);
            const done = order.returnStatus === "refunded";
            return (
              <li key={order.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
                <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`rounded-full ${done ? "bg-success/20 text-foreground" : "bg-primary/15 text-primary"}`}
                      >
                        {returnStatusLabel[order.returnStatus]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{order.id}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {order.seller} · reason: {order.returnReason ?? "not specified"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center font-display text-lg font-bold">
                      <IndianRupee className="mr-0.5 h-4 w-4" aria-hidden />
                      {formatPrice(order.refundAmount ?? order.total, c).replace(/^[^\d]+/, "")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {done ? "Refunded" : `Expected ${formatDate(order.refundEta ?? order.eta)}`}
                    </p>
                  </div>
                </header>

                <ul className="mt-4 grid gap-3">
                  {order.items.map((item) => {
                    const p = getProduct(item.productId);
                    if (!p) return null;
                    return (
                      <li key={item.productId} className="flex items-center gap-3">
                        <Link to="/product/$productId" params={{ productId: p.id }} className="shrink-0">
                          <ProductTile product={p} className="h-14 w-14 aspect-auto rounded-xl" />
                        </Link>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty {item.quantity} · {formatPrice(item.unitPrice, c)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <ol className="mt-4 grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {flow.map((s, i) => (
                      <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-3 text-[11px] text-muted-foreground">
                    {flow.map((s, i) => (
                      <span key={s} className={i <= step ? "font-medium text-foreground" : undefined}>
                        {returnStatusLabel[s]}
                      </span>
                    ))}
                  </div>
                </ol>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!done ? (
                    <>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          advanceReturn(order.id);
                          toast.success("Return moved to the next stage (demo)");
                        }}
                      >
                        Advance stage <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => {
                          cancelReturn(order.id);
                          toast.message("Return cancelled");
                        }}
                      >
                        <Undo2 className="h-4 w-4" /> Cancel return
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-success">
                      Refund of {formatPrice(order.refundAmount ?? order.total, c)} credited back to your
                      original payment method.
                    </p>
                  )}
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
