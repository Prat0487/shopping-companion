import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultAddresses,
  defaultAlerts,
  defaultCollections,
  defaultOrders,
  defaultPayments,
  defaultPreferences,
  defaultRecentlyViewed,
  defaultWishlist,
  products,
  type Address,
  type Alert,
  type Collection,
  type Order,
  type PaymentMethod,
  type Preferences,
  type Product,
  type ReturnStatus,
  type WishlistItem,
} from "./data";

const STORAGE_KEY = "market-superapp-v2";

/** Demo "today" so the sample dataset always reads consistently. */
export const TODAY = "2026-08-10";

type ShopState = {
  collections: Collection[];
  wishlist: WishlistItem[];
  alerts: Alert[];
  orders: Order[];
  addresses: Address[];
  payments: PaymentMethod[];
  preferences: Preferences;
  recentlyViewed: string[];
  compare: string[];
};

const initialState: ShopState = {
  collections: defaultCollections,
  wishlist: defaultWishlist,
  alerts: defaultAlerts,
  orders: defaultOrders,
  addresses: defaultAddresses,
  payments: defaultPayments,
  preferences: defaultPreferences,
  recentlyViewed: defaultRecentlyViewed,
  compare: [],
};

export type Budget = {
  monthlyBudget: number;
  committed: number;
  remaining: number;
  wishlistPotential: number;
  usedPct: number;
};

type ShopContextValue = ShopState & {
  hydrated: boolean;
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  budget: Budget;
  isSaved: (productId: string) => boolean;
  getAlert: (productId: string) => Alert | undefined;
  toggleWishlist: (productId: string, collectionId?: string) => boolean;
  updateWishlistItem: (productId: string, patch: Partial<WishlistItem>) => void;
  moveToCollection: (productId: string, collectionId: string) => void;
  removeFromWishlist: (productId: string) => void;
  addCollection: (name: string, emoji?: string) => void;
  removeCollection: (id: string) => void;
  upsertAlert: (productId: string, targetPrice: number) => void;
  toggleAlert: (id: string) => void;
  removeAlert: (id: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  advanceReturn: (orderId: string) => void;
  cancelReturn: (orderId: string) => void;
  viewProduct: (productId: string) => void;
  toggleCompare: (productId: string) => boolean;
  clearCompare: () => void;
  addAddress: (a: Omit<Address, "id" | "isDefault">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setDefaultPayment: (id: string) => void;
  removePayment: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetAll: () => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 9);

const returnFlow: ReturnStatus[] = [
  "requested",
  "pickup_scheduled",
  "in_transit",
  "refund_initiated",
  "refunded",
];

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as ShopState), compare: [] });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const theme = state.preferences.theme;
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const prefersDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", prefersDark);
  }, [theme, hydrated]);

  const patch = useCallback((fn: (s: ShopState) => ShopState) => setState((s) => fn(s)), []);

  const value = useMemo<ShopContextValue>(() => {
    const getProduct = (id: string) => products.find((p) => p.id === id);
    const isSaved = (productId: string) => state.wishlist.some((w) => w.productId === productId);

    const monthPrefix = TODAY.slice(0, 7);
    const committed = state.orders
      .filter((o) => o.placedAt.slice(0, 7) === monthPrefix && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total - (o.returnStatus === "refunded" ? (o.refundAmount ?? 0) : 0), 0);
    const wishlistPotential = state.wishlist.reduce(
      (sum, w) => sum + (getProduct(w.productId)?.price ?? 0),
      0,
    );
    const monthlyBudget = state.preferences.monthlyBudget;
    const budget: Budget = {
      monthlyBudget,
      committed,
      remaining: monthlyBudget - committed,
      wishlistPotential,
      usedPct: monthlyBudget > 0 ? Math.min(100, Math.round((committed / monthlyBudget) * 100)) : 0,
    };

    return {
      ...state,
      hydrated,
      products,
      getProduct,
      budget,
      isSaved,
      getAlert: (productId) => state.alerts.find((a) => a.productId === productId),
      toggleWishlist: (productId, collectionId) => {
        const saved = isSaved(productId);
        patch((s) => ({
          ...s,
          wishlist: saved
            ? s.wishlist.filter((w) => w.productId !== productId)
            : [
                ...s.wishlist,
                {
                  productId,
                  collectionId: collectionId ?? s.collections[0]?.id ?? "c1",
                  addedAt: TODAY,
                },
              ],
        }));
        return !saved;
      },
      updateWishlistItem: (productId, itemPatch) =>
        patch((s) => ({
          ...s,
          wishlist: s.wishlist.map((w) => (w.productId === productId ? { ...w, ...itemPatch } : w)),
        })),
      moveToCollection: (productId, collectionId) =>
        patch((s) => ({
          ...s,
          wishlist: s.wishlist.map((w) => (w.productId === productId ? { ...w, collectionId } : w)),
        })),
      removeFromWishlist: (productId) =>
        patch((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w.productId !== productId) })),
      addCollection: (name, emoji = "✨") =>
        patch((s) => ({
          ...s,
          collections: [...s.collections, { id: uid(), name, emoji, description: "Custom collection" }],
        })),
      removeCollection: (id) =>
        patch((s) => ({
          ...s,
          collections: s.collections.filter((c) => c.id !== id),
          wishlist: s.wishlist.filter((w) => w.collectionId !== id),
        })),
      upsertAlert: (productId, targetPrice) =>
        patch((s) => {
          const current = getProduct(productId)?.price ?? targetPrice;
          const existing = s.alerts.find((a) => a.productId === productId);
          return {
            ...s,
            alerts: existing
              ? s.alerts.map((a) =>
                  a.productId === productId
                    ? { ...a, targetPrice, active: true, lastCheckedAt: TODAY }
                    : a,
                )
              : [
                  ...s.alerts,
                  {
                    id: uid(),
                    productId,
                    targetPrice,
                    lastKnownPrice: current,
                    active: true,
                    createdAt: TODAY,
                    lastCheckedAt: TODAY,
                  },
                ],
          };
        }),
      toggleAlert: (id) =>
        patch((s) => ({
          ...s,
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),
      removeAlert: (id) => patch((s) => ({ ...s, alerts: s.alerts.filter((a) => a.id !== id) })),
      requestReturn: (orderId, reason) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  returnStatus: "requested" as ReturnStatus,
                  returnReason: reason,
                  refundAmount: o.total,
                }
              : o,
          ),
        })),
      advanceReturn: (orderId) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) => {
            if (o.id !== orderId || o.returnStatus === "none") return o;
            const idx = returnFlow.indexOf(o.returnStatus);
            const next = returnFlow[Math.min(idx + 1, returnFlow.length - 1)]!;
            return { ...o, returnStatus: next };
          }),
        })),
      cancelReturn: (orderId) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, returnStatus: "none" as ReturnStatus } : o,
          ),
        })),
      viewProduct: (productId) =>
        patch((s) => ({
          ...s,
          recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
        })),
      toggleCompare: (productId) => {
        const inList = state.compare.includes(productId);
        if (!inList && state.compare.length >= 4) return false;
        patch((s) => ({
          ...s,
          compare: inList ? s.compare.filter((id) => id !== productId) : [...s.compare, productId],
        }));
        return true;
      },
      clearCompare: () => patch((s) => ({ ...s, compare: [] })),
      addAddress: (a) =>
        patch((s) => ({ ...s, addresses: [...s.addresses, { ...a, id: uid(), isDefault: false }] })),
      removeAddress: (id) => patch((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) })),
      setDefaultAddress: (id) =>
        patch((s) => ({ ...s, addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })),
      setDefaultPayment: (id) =>
        patch((s) => ({ ...s, payments: s.payments.map((p) => ({ ...p, isDefault: p.id === id })) })),
      removePayment: (id) => patch((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) })),
      updatePreferences: (p) => patch((s) => ({ ...s, preferences: { ...s.preferences, ...p } })),
      resetAll: () => setState(initialState),
    };
  }, [state, hydrated, patch]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function formatPrice(value: number, currency: Preferences["currency"] = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPct(p: { price: number; listPrice: number }) {
  return Math.max(0, Math.round((1 - p.price / p.listPrice) * 100));
}

/** % change between the first and last point of a price history series. */
export function priceTrendPct(history: { price: number }[]) {
  const first = history[0]?.price;
  const last = history[history.length - 1]?.price;
  if (!first || !last) return 0;
  return Math.round(((last - first) / first) * 100);
}

export function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

export function formatDate(iso: string) {
  if (!iso || iso === "—") return iso;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
