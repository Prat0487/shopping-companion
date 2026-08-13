import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  GitCompareArrows,
  Heart,
  Home,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useShop } from "@/lib/shop/store";
import { Badge } from "@/components/ui/badge";
import { CompareBar } from "./compare-bar";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/wishlist", label: "Saved", icon: Heart },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/returns", label: "Returns", icon: RotateCcw },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const mobileNav = nav.filter((n) =>
  ["/", "/search", "/wishlist", "/orders", "/profile"].includes(n.to),
);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { wishlist, alerts, orders, compare } = useShop();

  const counts: Record<string, number> = {
    "/wishlist": wishlist.length,
    "/alerts": alerts.filter((a) => a.active).length,
    "/compare": compare.length,
    "/orders": orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    "/returns": orders.filter((o) => o.returnStatus !== "none" && o.returnStatus !== "refunded").length,
  };

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card/60 px-3 py-5 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-hero-gradient text-primary-foreground shadow-soft">
            <ShoppingBag className="h-4.5 w-4.5" />
          </span>
          <span className="truncate font-display text-lg font-bold">Market</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {counts[item.to] ? (
                <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-[11px]">
                  {counts[item.to]}
                </Badge>
              ) : null}
            </Link>
          ))}
        </nav>

        <p className="mt-4 rounded-2xl bg-muted/70 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          Demo mode — all products, prices and orders are sample data stored on this device.
        </p>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-hero-gradient text-primary-foreground shadow-soft">
                <ShoppingBag className="h-4.5 w-4.5" />
              </span>
              <span className="truncate font-display text-lg font-bold">Market</span>
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/compare"
                aria-label="Compare"
                className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground"
              >
                <GitCompareArrows className="h-5 w-5" />
                {compare.length ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
              <Link
                to="/alerts"
                aria-label="Alerts"
                className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground"
              >
                <Bell className="h-5 w-5" />
                {counts["/alerts"] ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
      </div>

      <CompareBar />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive(item.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {counts[item.to] ? (
                <span className="absolute right-[24%] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DemoNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Sample data · no live retailer or payment integration
    </p>
  );
}
