import { Link } from "@tanstack/react-router";
import { GitCompareArrows, X } from "lucide-react";
import { useShop } from "@/lib/shop/store";
import { Button } from "@/components/ui/button";

export function CompareBar() {
  const { compare, getProduct, toggleCompare, clearCompare } = useShop();
  if (compare.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-3 md:bottom-4 md:left-64">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-3xl border border-border bg-card/95 p-3 shadow-lift backdrop-blur">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
          <GitCompareArrows className="h-4 w-4" />
        </span>
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {compare.map((id) => {
            const p = getProduct(id);
            if (!p) return null;
            return (
              <li
                key={id}
                className="inline-flex max-w-[9rem] items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
              >
                <span className="truncate">{p.title}</span>
                <button
                  type="button"
                  aria-label={`Remove ${p.title} from comparison`}
                  onClick={() => toggleCompare(id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={clearCompare}>
            Clear
          </Button>
          <Button asChild size="sm" className="rounded-full" disabled={compare.length < 2}>
            <Link to="/compare">Compare {compare.length}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
