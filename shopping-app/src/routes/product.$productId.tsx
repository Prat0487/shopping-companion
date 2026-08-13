import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  BadgeCheck,
  GitCompareArrows,
  Heart,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, DemoNote } from "@/components/shop/app-shell";
import { BudgetImpact } from "@/components/shop/budget-card";
import { PriceChart } from "@/components/shop/price-chart";
import { ProductCard, ProductTile } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { availabilityLabel, products } from "@/lib/shop/data";
import { discountPct, formatPrice, priceTrendPct, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return { title: product.title, blurb: product.blurb };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Market" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.title} — Market` },
        { name: "description", content: loaderData.blurb },
        { property: "og:title", content: `${loaderData.title} — Market` },
        { property: "og:description", content: loaderData.blurb },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="rounded-3xl border border-dashed border-border p-10 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This item is no longer in the sample catalogue.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
            Back to search
          </Link>
        </Button>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <div role="alert" className="rounded-3xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <h1 className="text-lg font-bold">This product didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </AppShell>
  ),
});

function ProductPage() {
  const { productId } = Route.useParams();
  const {
    getProduct,
    preferences,
    isSaved,
    toggleWishlist,
    upsertAlert,
    getAlert,
    compare,
    toggleCompare,
    viewProduct,
  } = useShop();

  const product = getProduct(productId);
  const existingAlert = getAlert(productId);
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    viewProduct(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (product) setTarget(String(existingAlert?.targetPrice ?? Math.round(product.price * 0.9)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (!product) return null;

  const c = preferences.currency;
  const saved = isSaved(product.id);
  const inCompare = compare.includes(product.id);
  const discount = discountPct(product);
  const trend = priceTrendPct(product.history);
  const lowest = Math.min(...product.history.map((h) => h.price));
  const lastKnown = product.history[product.history.length - 2]?.price ?? product.price;

  const similar = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 rounded-full">
        <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <ProductTile product={product} className="aspect-4/3 w-full rounded-3xl" />
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Price history</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last 12 weeks · sample data for this demo
            </p>
            <PriceChart
              history={product.history}
              targetPrice={existingAlert?.targetPrice}
              currency={c}
              className="mt-3 text-primary"
            />
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-muted-foreground">Current</dt>
                <dd className="mt-1 font-display text-base font-bold">{formatPrice(product.price, c)}</dd>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-muted-foreground">Last known</dt>
                <dd className="mt-1 font-display text-base font-bold">{formatPrice(lastKnown, c)}</dd>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-muted-foreground">Your target</dt>
                <dd className="mt-1 font-display text-base font-bold text-success">
                  {existingAlert ? formatPrice(existingAlert.targetPrice, c) : "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              12-week low {formatPrice(lowest, c)} · overall {trend <= 0 ? "down" : "up"}{" "}
              {Math.abs(trend)}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{product.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.blurb}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-medium">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {product.rating}
              <span className="text-muted-foreground">({product.reviews.toLocaleString("en-IN")})</span>
            </span>
            <Badge variant="secondary" className="rounded-full">
              {availabilityLabel[product.availability]}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="font-display text-3xl font-black">{formatPrice(product.price, c)}</p>
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.listPrice, c)}
            </p>
            {discount > 0 ? (
              <Badge className="rounded-full bg-primary text-primary-foreground">-{discount}%</Badge>
            ) : null}
          </div>

          <div className="mt-4">
            <BudgetImpact price={product.price} />
          </div>

          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <li className="inline-flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              Delivery in {product.deliveryDays} day{product.deliveryDays === 1 ? "" : "s"} ·{" "}
              {product.deliveryNote}
            </li>
            <li className="inline-flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
              {product.seller} · {product.sellerRating}★ seller
            </li>
            <li className="inline-flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              {product.warrantyMonths > 0 ? `${product.warrantyMonths}-month warranty` : "No warranty"}
            </li>
            <li className="inline-flex items-center gap-2 rounded-2xl bg-muted/60 p-3">
              <PackageCheck className="h-4 w-4 shrink-0 text-primary" />
              {product.returnDays}-day returns
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              className="flex-1 rounded-full"
              onClick={() => {
                const added = toggleWishlist(product.id);
                toast[added ? "success" : "message"](added ? "Saved to wishlist" : "Removed from wishlist");
              }}
            >
              <Heart className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant={inCompare ? "default" : "outline"}
              className="flex-1 rounded-full"
              onClick={() => {
                const ok = toggleCompare(product.id);
                if (!ok) toast.error("You can compare up to 4 products");
              }}
            >
              <GitCompareArrows className="h-4 w-4" />
              {inCompare ? "In comparison" : "Add to compare"}
            </Button>
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold">
              <Bell className="h-4.5 w-4.5 text-primary" /> Price alert
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {existingAlert
                ? `Watching since ${existingAlert.createdAt}. Last checked ${existingAlert.lastCheckedAt}.`
                : "Tell us your target and we'll flag it here when the sample price drops."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={target}
                aria-label="Target price"
                onChange={(e) => setTarget(e.target.value)}
                className="h-10 w-40 rounded-full"
              />
              <Button
                className="rounded-full"
                onClick={() => {
                  const value = Number(target);
                  if (!Number.isFinite(value) || value <= 0) {
                    toast.error("Enter a valid target price");
                    return;
                  }
                  upsertAlert(product.id, Math.round(value));
                  toast.success(`Alert set at ${formatPrice(Math.round(value), c)}`);
                }}
              >
                {existingAlert ? "Update alert" : "Create alert"}
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/alerts">All alerts</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Key specs</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.specs.map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted/60 p-3 text-sm">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="mt-0.5 font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
            <DemoNote className="mt-3" />
          </div>
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">Similar in {product.category}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
