import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, FolderPlus, Heart, Pencil, Trash2, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { EmptyState } from "@/components/shop/empty-state";
import { ProductTile } from "@/components/shop/product-card";
import { Sparkline } from "@/components/shop/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { discountPct, formatPrice, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist & collections — Market" },
      {
        name: "description",
        content:
          "Group saved products into collections with notes, target prices, live price-drop percentages and alert status.",
      },
      { property: "og:title", content: "Wishlist & collections — Market" },
      { property: "og:description", content: "Every saved product, grouped the way you shop." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const {
    collections,
    wishlist,
    getProduct,
    getAlert,
    removeFromWishlist,
    moveToCollection,
    updateWishlistItem,
    addCollection,
    removeCollection,
    upsertAlert,
    preferences,
    budget,
  } = useShop();
  const c = preferences.currency;
  const [tab, setTab] = useState("all");
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftTarget, setDraftTarget] = useState("");

  const items = wishlist
    .filter((w) => tab === "all" || w.collectionId === tab)
    .map((w) => ({ ...w, product: getProduct(w.productId) }))
    .filter((w) => w.product);

  const total = items.reduce((sum, i) => sum + i.product!.price, 0);
  const editingItem = wishlist.find((w) => w.productId === editing);
  const editingProduct = editing ? getProduct(editing) : undefined;

  const openEditor = (productId: string) => {
    const item = wishlist.find((w) => w.productId === productId);
    setEditing(productId);
    setDraftNote(item?.note ?? "");
    setDraftTarget(item?.targetPrice ? String(item.targetPrice) : "");
  };

  return (
    <AppShell>
      <PageHeader
        title="Saved"
        subtitle={`${wishlist.length} items · ${formatPrice(total, c)} in this view`}
      />

      {budget.wishlistPotential > budget.remaining ? (
        <p className="mb-4 rounded-2xl bg-warning/15 p-3 text-sm text-warning-foreground">
          Buying everything saved would cost {formatPrice(budget.wishlistPotential, c)} —{" "}
          {formatPrice(budget.wishlistPotential - Math.max(budget.remaining, 0), c)} more than your
          remaining monthly budget.
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <TabsList className="h-auto flex-wrap rounded-full bg-muted p-1">
          <TabsTrigger value="all" className="rounded-full px-4">
            All
          </TabsTrigger>
          {collections.map((col) => (
            <TabsTrigger key={col.id} value={col.id} className="rounded-full px-4">
              <span className="mr-1">{col.emoji}</span>
              {col.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name"
          aria-label="New collection name"
          className="h-10 w-full max-w-xs rounded-full bg-card"
        />
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            if (!newName.trim()) return;
            addCollection(newName.trim());
            setNewName("");
            toast.success("Collection created");
          }}
        >
          <FolderPlus className="h-4 w-4" /> Add collection
        </Button>
        {tab !== "all" ? (
          <Button
            variant="ghost"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => {
              removeCollection(tab);
              setTab("all");
              toast.message("Collection deleted");
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete collection
          </Button>
        ) : null}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved here yet"
            description="Tap the heart on any product to keep it here and watch its price over time."
            action={
              <Button asChild className="rounded-full">
                <Link to="/search" search={{ q: "", category: "all", sort: "relevance" }}>
                  Browse products
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => {
              const p = item.product!;
              const alert = getAlert(p.id);
              const target = item.targetPrice ?? alert?.targetPrice;
              const drop = discountPct(p);
              const gap = target ? p.price - target : null;
              return (
                <li key={p.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:flex sm:items-start">
                    <Link to="/product/$productId" params={{ productId: p.id }} className="shrink-0">
                      <ProductTile product={p} className="h-20 w-20 aspect-auto rounded-2xl" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {collections.find((col) => col.id === item.collectionId)?.name ?? "Unsorted"}
                        </Badge>
                        {alert?.active ? (
                          <Badge className="rounded-full bg-primary/15 text-xs text-primary">
                            <Bell className="mr-1 h-3 w-3" /> Alert on
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full text-xs">
                            No alert
                          </Badge>
                        )}
                        {drop > 0 ? (
                          <Badge className="rounded-full bg-success/15 text-xs text-success">
                            <TrendingDown className="mr-1 h-3 w-3" /> {drop}% off list
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 font-semibold">
                        <Link
                          to="/product/$productId"
                          params={{ productId: p.id }}
                          className="hover:text-primary"
                        >
                          {p.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {p.seller} · saved {item.addedAt}
                      </p>
                      {item.note ? (
                        <p className="mt-2 rounded-2xl bg-muted/60 p-2.5 text-xs italic text-muted-foreground">
                          “{item.note}”
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="font-display text-lg font-bold">{formatPrice(p.price, c)}</span>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(p.listPrice, c)}
                        </span>
                        {target ? (
                          <span className="text-xs">
                            Target{" "}
                            <span className="font-semibold text-success">{formatPrice(target, c)}</span>
                            {gap !== null && gap > 0 ? (
                              <span className="text-muted-foreground"> · {formatPrice(gap, c)} to go</span>
                            ) : (
                              <span className="font-semibold text-success"> · reached</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No target set</span>
                        )}
                        <Sparkline data={p.history} className="h-6 w-16" />
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-auto sm:flex-col sm:items-end">
                      <Select value={item.collectionId} onValueChange={(v) => moveToCollection(p.id, v)}>
                        <SelectTrigger className="h-9 w-40 rounded-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((col) => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.emoji} {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => openEditor(p.id)}
                        >
                          <Pencil className="h-4 w-4" /> Note
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-destructive hover:text-destructive"
                          onClick={() => {
                            removeFromWishlist(p.id);
                            toast.message("Removed from wishlist");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DemoNote className="mt-6" />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct?.title ?? "Saved item"}</DialogTitle>
            <DialogDescription>
              Add a note and a target price. Setting a target also creates a price alert.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Why are you saving this?"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="target">Target price ({c})</Label>
              <Input
                id="target"
                type="number"
                inputMode="numeric"
                value={draftTarget}
                onChange={(e) => setDraftTarget(e.target.value)}
                placeholder={editingProduct ? String(Math.round(editingProduct.price * 0.9)) : ""}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                if (!editing || !editingItem) return;
                const value = Number(draftTarget);
                const hasTarget = draftTarget.trim() !== "" && Number.isFinite(value) && value > 0;
                updateWishlistItem(editing, {
                  note: draftNote.trim(),
                  ...(hasTarget ? { targetPrice: Math.round(value) } : {}),
                });
                if (hasTarget) upsertAlert(editing, Math.round(value));
                setEditing(null);
                toast.success("Saved item updated");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
