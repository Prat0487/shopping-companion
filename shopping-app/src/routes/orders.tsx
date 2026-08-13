import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductTile } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/lib/shop/data";
import { formatDate, formatPrice, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Market" },
      {
        name: "description",
        content:
          "Follow every order through a status timeline with seller, carrier, expected delivery, totals and return window.",
      },
      { property: "og:title", content: "Orders — Market" },
      { property: "og:description", content: "A timeline for every order you place." },
    ],
  }),
  component: OrdersPage,
});

export const statusMeta: Record<
  OrderStatus,
  { label: string; icon: typeof Truck; tone: string }
> = {
  processing: { label: "Processing", icon: Clock, tone: "bg-warning/20 text-warning-foreground" },
  packed: { label: "Packed", icon: Package, tone: "bg-secondary text-secondary-foreground" },
  shipped: { label: "Shipped", icon: Truck, tone: "bg-accent/30 text-accent-foreground" },
  out_for_delivery: {
    label: "Out for delivery",
    icon: PackageCheck,
    tone: "bg-primary/15 text-primary",
  },
  delivered: { label: "Delivered", icon: CheckCircle2, tone: "bg-success/20 text-foreground" },
  cancelled: { label: "Cancelled", icon: XCircle, tone: "bg-destructive/15 text-destructive" },
};

const timeline: OrderStatus[] = ["processing", "packed", "shipped", "out_for_delivery", "delivered"];

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function OrdersPage() {
  const { orders, getProduct, requestReturn, preferences, addresses } = useShop();
  const c = preferences.currency;
  const [tab, setTab] = useState("all");
  const [returning, setReturning] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const rows = orders
    .filter((o) =>
      tab === "all"
        ? true
        : tab === "active"
          ? o.status !== "delivered" && o.status !== "cancelled"
          : o.status === tab,
    )
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  const spend = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders · ${formatPrice(spend, c)} lifetime spend`}
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/returns">
              <RotateCcw className="h-4 w-4" /> Returns
            </Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap rounded-full bg-muted p-1">
          {filters.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="rounded-full px-4">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders in this view"
            description="Orders you place will show up here with live status, delivery estimates and return deadlines."
            action={
              <Button asChild className="rounded-full">
                <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
                  Start shopping
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4">
            {rows.map((order) => {
              const meta = statusMeta[order.status];
              const activeStep =
                order.status === "cancelled" ? -1 : timeline.indexOf(order.status);
              const address = addresses.find((a) => a.id === order.addressId);
              const canReturn = order.status === "delivered" && order.returnStatus === "none";

              return (
                <li key={order.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
                  <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`rounded-full ${meta.tone}`}>
                          <meta.icon className="mr-1 h-3.5 w-3.5" />
                          {meta.label}
                        </Badge>
                        {order.returnStatus !== "none" ? (
                          <Badge variant="outline" className="rounded-full text-xs">
                            Return in progress
                          </Badge>
                        ) : null}
                        <span className="text-xs text-muted-foreground">#{order.id}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Placed {formatDate(order.placedAt)} · {order.seller} · {order.carrier}{" "}
                        {order.tracking}
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold">{formatPrice(order.total, c)}</p>
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
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              <Link
                                to="/product/$productId"
                                params={{ productId: p.id }}
                                className="hover:text-primary"
                              >
                                {p.title}
                              </Link>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} · {formatPrice(item.unitPrice, c)} each
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {activeStep >= 0 ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5">
                        {timeline.map((s, i) => (
                          <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full ${i <= activeStep ? "bg-primary" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>
                          {order.status === "delivered"
                            ? `Delivered ${formatDate(order.deliveredAt ?? order.eta)}`
                            : `Expected ${formatDate(order.eta)}`}
                        </span>
                        <span>Returns until {formatDate(order.returnWindowEnds)}</span>
                        {address ? <span>To {address.label}</span> : null}
                        <span>
                          Shipping{" "}
                          {order.shippingFee === 0 ? "free" : formatPrice(order.shippingFee, c)}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {canReturn ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setReturning(order.id);
                          setReason("");
                        }}
                      >
                        <RotateCcw className="h-4 w-4" /> Start return
                      </Button>
                    ) : null}
                    {order.returnStatus !== "none" ? (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link to="/returns">Track return</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DemoNote className="mt-6" />

      <Dialog open={returning !== null} onOpenChange={(open) => !open && setReturning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a return</DialogTitle>
            <DialogDescription>
              Demo only — no pickup is actually scheduled. Your return will move through sample
              statuses on the returns page.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Wrong size, damaged in transit, changed my mind…"
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setReturning(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                if (!returning) return;
                requestReturn(returning, reason.trim() || "No reason given");
                setReturning(null);
                toast.success("Return requested — track it on the returns page");
              }}
            >
              Request return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
