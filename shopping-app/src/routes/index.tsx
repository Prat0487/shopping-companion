import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Clock,
  Flame,
  GitCompareArrows,
  History,
  Package,
  Search as SearchIcon,
  Sparkles,
  TrendingDown,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/shop/app-shell";
import { BudgetCard } from "@/components/shop/budget-card";
import { ProductCard, ProductTile } from "@/components/shop/product-card";
import { Sparkline } from "@/components/shop/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories, orderStatusLabel } from "@/lib/shop/data";
import { daysBetween, discountPct, formatDate, formatPrice, useShop, TODAY } from "@/lib/shop/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Market — Personal shopping companion for India" },
      {
        name: "description",
        content:
          "A decision-first shopping dashboard: personalised picks, price drops, alerts, deliveries and a monthly shopping budget in one place.",
      },
      { property: "og:title", content: "Market — Personal shopping companion for India" },
      {
        property: "og:description",
        content: "Personalised feed, price intelligence, comparisons and order tracking in INR.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { products, wishlist, alerts, orders, preferences, getProduct, recentlyViewed } = useShop();
  const c = preferences.currency;

  const forYou = products
    .filter((p) => preferences.favouriteCategories.includes(p.category))
    .sort((a, b) => b.rating * discountPct(b) - a.rating * discountPct(a))
    .slice(0, 4);
  const feed = forYou.length >= 4 ? forYou : products.slice(0, 4);

  const drops = [...products].sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 4);
  const expiring = [...products]
    .filter((p) => discountPct(p) >= 30 && p.availability !== "out_of_stock")
    .slice(0, 3);

  const recent = recentlyViewed.map(getProduct).filter(Boolean).slice(0, 6);
  const activeAlerts = alerts.filter((a) => a.active);
  const pending = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");

  const almostThere = activeAlerts
    .map((a) => ({ alert: a, product: getProduct(a.productId) }))
    .filter((x) => x.product)
    .sort((a, b) => a.product!.price - a.alert.targetPrice - (b.product!.price - b.alert.targetPrice))
    .slice(0, 3);

  const quick = [
    { label: "Search", to: "/search" as const, icon: SearchIcon },
    { label: "Compare", to: "/compare" as const, icon: GitCompareArrows },
    { label: "Alerts", to: "/alerts" as const, icon: Bell },
    { label: "Returns", to: "/returns" as const, icon: Package },
  ];

  return (
    <AppShell>
      <section className="overflow-hidden rounded-3xl bg-hero-gradient p-6 text-primary-foreground shadow-lift sm:p-9">
        <Badge className="rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur">
          Hi {preferences.displayName.split(" ")[0]} 👋
        </Badge>
        <h1 className="mt-4 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
          Decide faster on everything you're shopping for.
        </h1>
        <p className="mt-2 max-w-lg text-sm text-primary-foreground/85 sm:text-base">
          Compare across sellers, watch prices fall and keep every delivery, return and rupee on track.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
              Start a search <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <Link to="/wishlist">View collections</Link>
          </Button>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {quick.map((q) => (
          <Link
            key={q.label}
            to={q.to}
            className="card-hover flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-soft"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <q.icon className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-semibold">{q.label}</span>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold">
              <Truck className="h-4.5 w-4.5 text-primary" /> Pending deliveries
            </h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/orders">All orders</Link>
            </Button>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing on the way right now.</p>
          ) : (
            <ul className="grid gap-2">
              {pending.slice(0, 3).map((o) => {
                const first = getProduct(o.items[0]!.productId);
                const days = daysBetween(TODAY, o.eta);
                return (
                  <li key={o.id}>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 transition-colors hover:bg-muted"
                    >
                      {first ? (
                        <ProductTile product={first} className="h-12 w-12 shrink-0 aspect-auto rounded-xl" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{first?.title ?? o.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {orderStatusLabel[o.status]} · {o.carrier}
                        </p>
                      </div>
                      <span className="shrink-0 text-right text-xs font-semibold">
                        {days <= 0 ? "Arriving today" : `in ${days} day${days === 1 ? "" : "s"}`}
                        <span className="block font-normal text-muted-foreground">{formatDate(o.eta)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <BudgetCard />
      </div>

      {almostThere.length > 0 ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold">
              <TrendingDown className="h-4.5 w-4.5 text-success" /> Close to your target price
            </h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/alerts">All alerts</Link>
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {almostThere.map(({ alert, product }) => {
              const gap = product!.price - alert.targetPrice;
              return (
                <li key={alert.id} className="rounded-2xl bg-muted/60 p-3">
                  <Link
                    to="/product/$productId"
                    params={{ productId: product!.id }}
                    className="flex items-center gap-3"
                  >
                    <ProductTile product={product!} className="h-14 w-14 shrink-0 aspect-auto rounded-xl" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{product!.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Now {formatPrice(product!.price, c)} · target {formatPrice(alert.targetPrice, c)}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-sm font-semibold">
                      {gap <= 0 ? (
                        <span className="text-success">Target hit</span>
                      ) : (
                        <>{formatPrice(gap, c)} to go</>
                      )}
                    </p>
                    <Sparkline data={product!.history} className="h-7 w-16" />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Shop by category</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/search"
              search={{ q: "", category: cat, sort: "relevance" }}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft transition-colors hover:border-primary hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> Picked for you
          </h2>
          <span className="text-xs text-muted-foreground">
            Based on {preferences.favouriteCategories.join(", ")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {feed.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-muted-foreground" /> Recently viewed
          </h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {recent.map((p) => (
              <Link
                key={p!.id}
                to="/product/$productId"
                params={{ productId: p!.id }}
                className="card-hover w-40 shrink-0 rounded-2xl border border-border bg-card p-2 shadow-soft"
              >
                <ProductTile product={p!} className="rounded-xl" />
                <p className="mt-2 line-clamp-2 px-1 text-xs font-semibold">{p!.title}</p>
                <p className="px-1 pb-1 text-xs text-muted-foreground">{formatPrice(p!.price, c)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {expiring.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-warning/40 bg-warning/10 p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold">
            <Clock className="h-4.5 w-4.5" /> Deals ending soon
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sample promotional window — ends {formatDate("2026-08-14")}.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {expiring.map((p) => (
              <li key={p.id}>
                <Link
                  to="/product/$productId"
                  params={{ productId: p.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft"
                >
                  <ProductTile product={p} className="h-12 w-12 shrink-0 aspect-auto rounded-xl" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="text-xs font-semibold text-primary">
                      {discountPct(p)}% off · {formatPrice(p.price, c)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold">
            <Flame className="h-5 w-5 text-primary" /> Biggest price drops
          </h2>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/search" search={{ q: "", category: "all", sort: "discount" }}>
              See all
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {drops.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        {wishlist.length} saved items · {activeAlerts.length} active alerts · demo data only
      </p>
    </AppShell>
  );
}
