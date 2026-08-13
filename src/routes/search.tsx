import { createFileRoute } from "@tanstack/react-router";
import { SearchX, SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { categories, sellers } from "@/lib/shop/data";
import { discountPct, formatPrice, useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";

type SearchParams = { q: string; category: string; sort: string };

const MAX = 70000;

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "all",
    sort: typeof search["sort"] === "string" ? search["sort"] : "relevance",
  }),
  head: () => ({
    meta: [
      { title: "Search the catalogue — Market" },
      {
        name: "description",
        content:
          "Filter a sample Indian catalogue by category, price, rating, discount, seller and availability, then compare instantly.",
      },
      { property: "og:title", content: "Search the catalogue — Market" },
      { property: "og:description", content: "Unified product search built for fast comparison." },
    ],
  }),
  component: SearchPage,
});

const sorts = [
  { id: "relevance", label: "Relevance" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "discount", label: "Biggest discount" },
  { id: "delivery", label: "Fastest delivery" },
];

function SearchPage() {
  const { q, category, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, preferences } = useShop();

  const [maxPrice, setMaxPrice] = useState(MAX);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeSellers, setActiveSellers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const setParam = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, ...patch }) });

  const term = q.trim().toLowerCase();

  const resetFilters = () => {
    setMaxPrice(MAX);
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setActiveSellers([]);
  };

  let results = products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (p.price > maxPrice) return false;
    if (p.rating < minRating) return false;
    if (discountPct(p) < minDiscount) return false;
    if (inStockOnly && p.availability === "out_of_stock") return false;
    if (activeSellers.length > 0 && !activeSellers.includes(p.seller)) return false;
    if (!term) return true;
    return [p.title, p.brand, p.category, p.seller, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  results = [...results].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "discount") return discountPct(b) - discountPct(a);
    if (sort === "delivery") return a.deliveryDays - b.deliveryDays;
    return b.reviews - a.reviews;
  });

  const activeFilterCount =
    (maxPrice < MAX ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    activeSellers.length;

  return (
    <AppShell>
      <PageHeader
        title="Search"
        subtitle="One query across the whole sample catalogue"
        action={
          <Button
            variant="outline"
            className="rounded-full md:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeFilterCount ? (
              <Badge variant="secondary" className="ml-1 rounded-full">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
        }
      />

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setParam({ q: e.target.value })}
          placeholder="Search headphones, kadai, kurta, monitor…"
          aria-label="Search products"
          className="h-13 rounded-full border-border bg-card pl-11 text-base shadow-soft"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {["all", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setParam({ category: cat })}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className={cn("space-y-4 md:block", showFilters ? "block" : "hidden")}>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Filters</h2>

            <div className="mt-5">
              <Label className="text-xs text-muted-foreground">
                Max price · {formatPrice(maxPrice, preferences.currency)}
              </Label>
              <Slider
                value={[maxPrice]}
                min={500}
                max={MAX}
                step={500}
                onValueChange={([v]) => setMaxPrice(v ?? MAX)}
                className="mt-3"
              />
            </div>

            <div className="mt-5">
              <Label className="text-xs text-muted-foreground">
                Minimum rating · {minRating.toFixed(1)}★
              </Label>
              <Slider
                value={[minRating]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={([v]) => setMinRating(v ?? 0)}
                className="mt-3"
              />
            </div>

            <div className="mt-5">
              <Label className="text-xs text-muted-foreground">Minimum discount · {minDiscount}%</Label>
              <Slider
                value={[minDiscount]}
                min={0}
                max={60}
                step={5}
                onValueChange={([v]) => setMinDiscount(v ?? 0)}
                className="mt-3"
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Label htmlFor="stock" className="text-sm font-medium">
                Hide out of stock
              </Label>
              <Switch id="stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-muted-foreground">Sellers</p>
              <ul className="mt-2 space-y-2">
                {sellers.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <Checkbox
                      id={`seller-${s}`}
                      checked={activeSellers.includes(s)}
                      onCheckedChange={(checked) =>
                        setActiveSellers((prev) =>
                          checked ? [...prev, s] : prev.filter((x) => x !== s),
                        )
                      }
                    />
                    <Label htmlFor={`seller-${s}`} className="text-sm font-normal">
                      {s}
                    </Label>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="ghost" size="sm" className="mt-4 w-full rounded-full" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Sort</h2>
            <div className="mt-3 space-y-1">
              {sorts.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setParam({ sort: s.id })}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    sort === s.id ? "bg-secondary font-semibold" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <DemoNote />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
              {term ? ` for “${q}”` : ""}
            </p>
            <Badge variant="secondary" className="rounded-full">
              {sorts.find((s) => s.id === sort)?.label}
            </Badge>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matches yet"
              description="Try a broader term, raise your max price, or clear the category and seller filters."
              action={
                <Button
                  className="rounded-full"
                  onClick={() => {
                    resetFilters();
                    setParam({ q: "", category: "all" });
                  }}
                >
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
