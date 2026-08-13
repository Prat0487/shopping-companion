import { Link } from "@tanstack/react-router";
import { Bell, GitCompareArrows, Heart, Star, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { availabilityLabel, categoryTint, type Product } from "@/lib/shop/data";
import { discountPct, formatPrice, priceTrendPct, useShop } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "./sparkline";

export function ProductTile({ product, className }: { product: Product; className?: string }) {
  const initials = product.brand
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative grid aspect-4/3 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br",
        categoryTint[product.category],
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-display text-3xl font-black text-foreground/25">{initials}</span>
      <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        {product.category}
      </span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { isSaved, toggleWishlist, upsertAlert, preferences, compare, toggleCompare } = useShop();
  const saved = isSaved(product.id);
  const inCompare = compare.includes(product.id);
  const discount = discountPct(product);
  const trend = priceTrendPct(product.history);

  return (
    <article className="card-hover group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-soft">
      <div className="relative">
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          aria-label={`View ${product.title}`}
        >
          <ProductTile product={product} />
        </Link>
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save to wishlist"}
          aria-pressed={saved}
          onClick={() => {
            const added = toggleWishlist(product.id);
            toast[added ? "success" : "message"](added ? "Saved to wishlist" : "Removed from wishlist");
          }}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-primary"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
        </button>
        {discount > 0 ? (
          <Badge className="absolute left-2 top-2 rounded-full bg-primary text-primary-foreground">
            -{discount}%
          </Badge>
        ) : null}
        {product.availability !== "in_stock" ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
            {availabilityLabel[product.availability]}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
          <Link to="/product/$productId" params={{ productId: product.id }} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {product.rating}
          </span>
          <span>({product.reviews.toLocaleString("en-IN")})</span>
          <span className="truncate">· {product.seller}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold">
              {formatPrice(product.price, preferences.currency)}
            </p>
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.listPrice, preferences.currency)}
            </p>
          </div>
          <Sparkline data={product.history} className="h-8 w-20 shrink-0" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={inCompare ? "default" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => {
              const ok = toggleCompare(product.id);
              if (!ok) toast.error("You can compare up to 4 products");
            }}
          >
            <GitCompareArrows className="h-4 w-4" />
            {inCompare ? "Added" : "Compare"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            aria-label="Set price alert"
            onClick={() => {
              const target = Math.round((product.price * 0.9) / 10) * 10;
              upsertAlert(product.id, target);
              toast.success(`Alert set at ${formatPrice(target, preferences.currency)}`);
            }}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {trend < 0 ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
            <TrendingDown className="h-3.5 w-3.5" /> Down {Math.abs(trend)}% in 12 weeks
          </p>
        ) : trend > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Up {trend}% in 12 weeks
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Price steady recently</p>
        )}
      </div>
    </article>
  );
}
