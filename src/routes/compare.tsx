import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, GitCompareArrows, Trash2 } from "lucide-react";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductTile } from "@/components/shop/product-card";
import { Sparkline } from "@/components/shop/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { availabilityLabel } from "@/lib/shop/data";
import { scoreProducts } from "@/lib/shop/compare";
import { discountPct, formatPrice, useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare products side by side — Market" },
      {
        name: "description",
        content:
          "Compare up to four products on price, rating, specs, seller, delivery and warranty, with a transparent best-value pick.",
      },
      { property: "og:title", content: "Compare products side by side — Market" },
      { property: "og:description", content: "A best-value recommendation that explains its reasons." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { compare, getProduct, toggleCompare, clearCompare, preferences } = useShop();
  const c = preferences.currency;
  const items = compare.map(getProduct).filter(Boolean) as NonNullable<
    ReturnType<ReturnType<typeof useShop>["getProduct"]>
  >[];
  const scored = scoreProducts(items);
  const winner = scored[0];

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Compare" subtitle="Pick 2–4 products to see them side by side" />
        <EmptyState
          icon={GitCompareArrows}
          title="Nothing to compare yet"
          description="Tap Compare on any product card, then come back here for a side-by-side breakdown and a best-value pick."
          action={
            <Button asChild className="rounded-full">
              <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
                Browse products
              </Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const rows: { label: string; render: (id: string) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (id) => {
        const p = items.find((x) => x.id === id)!;
        return (
          <span className="font-display text-base font-bold">
            {formatPrice(p.price, c)}
            <span className="ml-1 text-xs font-medium text-muted-foreground line-through">
              {formatPrice(p.listPrice, c)}
            </span>
          </span>
        );
      },
    },
    {
      label: "Discount",
      render: (id) => `${discountPct(items.find((x) => x.id === id)!)}%`,
    },
    {
      label: "Rating",
      render: (id) => {
        const p = items.find((x) => x.id === id)!;
        return `${p.rating}★ (${p.reviews.toLocaleString("en-IN")})`;
      },
    },
    { label: "Seller", render: (id) => items.find((x) => x.id === id)!.seller },
    {
      label: "Seller rating",
      render: (id) => `${items.find((x) => x.id === id)!.sellerRating}★`,
    },
    {
      label: "Delivery",
      render: (id) => {
        const p = items.find((x) => x.id === id)!;
        return `${p.deliveryDays} day${p.deliveryDays === 1 ? "" : "s"} · ${p.deliveryNote}`;
      },
    },
    {
      label: "Warranty",
      render: (id) => {
        const p = items.find((x) => x.id === id)!;
        return p.warrantyMonths > 0 ? `${p.warrantyMonths} months` : "—";
      },
    },
    { label: "Returns", render: (id) => `${items.find((x) => x.id === id)!.returnDays} days` },
    {
      label: "Availability",
      render: (id) => availabilityLabel[items.find((x) => x.id === id)!.availability],
    },
    {
      label: "12-week trend",
      render: (id) => (
        <Sparkline data={items.find((x) => x.id === id)!.history} className="h-7 w-20" />
      ),
    },
  ];

  const maxSpecs = Math.max(...items.map((p) => p.specs.length));

  return (
    <AppShell>
      <PageHeader
        title="Compare"
        subtitle={`${items.length} product${items.length === 1 ? "" : "s"} selected`}
        action={
          <Button variant="ghost" className="rounded-full" onClick={clearCompare}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        }
      />

      {items.length === 1 ? (
        <p className="mb-5 rounded-2xl bg-warning/15 p-3 text-sm text-warning-foreground">
          Add at least one more product to get a best-value recommendation.
        </p>
      ) : winner ? (
        <section className="mb-6 rounded-3xl border border-success/40 bg-success/10 p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold">
            <Award className="h-4.5 w-4.5 text-success" /> Best value: {winner.product.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Score {winner.score}/100 — weighted on price (35%), rating (25%), discount (15%), delivery
            speed (15%) and warranty (10%).
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {winner.reasons.map((r) => (
              <li key={r} className="inline-flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {r}
              </li>
            ))}
          </ul>
          <Button asChild size="sm" className="mt-4 rounded-full">
            <Link to="/product/$productId" params={{ productId: winner.product.id }}>
              View {winner.product.brand}
            </Link>
          </Button>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Side-by-side product comparison</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="w-32 p-4 text-xs font-semibold text-muted-foreground">
                Attribute
              </th>
              {items.map((p) => {
                const s = scored.find((x) => x.product.id === p.id);
                const isWinner = winner?.product.id === p.id && items.length > 1;
                return (
                  <th key={p.id} scope="col" className="min-w-[180px] p-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/product/$productId" params={{ productId: p.id }} className="min-w-0">
                        <ProductTile product={p} className="h-16 w-20 aspect-auto rounded-xl" />
                        <p className="mt-2 line-clamp-2 text-sm font-semibold hover:text-primary">
                          {p.title}
                        </p>
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${p.title}`}
                        onClick={() => toggleCompare(p.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {isWinner ? (
                        <Badge className="rounded-full bg-success text-xs text-primary-foreground">
                          Best value
                        </Badge>
                      ) : null}
                      {s ? (
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {s.score}/100
                        </Badge>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={cn("border-b border-border/70", i % 2 ? "bg-muted/40" : "")}>
                <th scope="row" className="p-4 text-xs font-semibold text-muted-foreground">
                  {row.label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-4 align-middle">
                    {row.render(p.id)}
                  </td>
                ))}
              </tr>
            ))}
            {Array.from({ length: maxSpecs }).map((_, idx) => (
              <tr key={`spec-${idx}`} className={cn("border-b border-border/70", idx % 2 ? "" : "bg-muted/40")}>
                <th scope="row" className="p-4 text-xs font-semibold text-muted-foreground">
                  {items[0]?.specs[idx]?.label ?? "Spec"}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-4 align-middle">
                    {p.specs[idx] ? (
                      <>
                        <span className="block text-xs text-muted-foreground">{p.specs[idx]!.label}</span>
                        {p.specs[idx]!.value}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DemoNote className="mt-4" />
    </AppShell>
  );
}
