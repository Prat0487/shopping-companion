import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, MapPin, Plus, ShieldCheck, Star, Trash2, User, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, DemoNote, PageHeader } from "@/components/shop/app-shell";
import { BudgetCard } from "@/components/shop/budget-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, sellers, type Category, type Preferences } from "@/lib/shop/data";
import { formatPrice, useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & preferences — Market" },
      {
        name: "description",
        content:
          "Set your shopping budget, favourite categories, preferred sellers, notifications, currency, theme, addresses and payment preferences.",
      },
      { property: "og:title", content: "Profile & preferences — Market" },
      { property: "og:description", content: "Tune Market around how you actually shop." },
    ],
  }),
  component: ProfilePage,
});

const notificationRows: { key: keyof Preferences; label: string; hint: string }[] = [
  { key: "priceDropAlerts", label: "Price drop alerts", hint: "When a watched product hits your target" },
  { key: "backInStockAlerts", label: "Back in stock", hint: "When an out-of-stock saved item returns" },
  { key: "deliveryUpdates", label: "Delivery updates", hint: "Status changes on active orders" },
  { key: "weeklyDigest", label: "Weekly digest", hint: "A Sunday summary of drops and deals" },
];

const emptyAddress = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function ProfilePage() {
  const {
    preferences,
    updatePreferences,
    addresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    payments,
    setDefaultPayment,
    removePayment,
    budget,
    resetAll,
  } = useShop();
  const c = preferences.currency;
  const [draft, setDraft] = useState(emptyAddress);
  const [budgetDraft, setBudgetDraft] = useState(String(preferences.monthlyBudget));

  const toggleCategory = (cat: Category) => {
    const has = preferences.favouriteCategories.includes(cat);
    updatePreferences({
      favouriteCategories: has
        ? preferences.favouriteCategories.filter((x) => x !== cat)
        : [...preferences.favouriteCategories, cat],
    });
  };

  const toggleSeller = (seller: string) => {
    const has = preferences.preferredSellers.includes(seller);
    updatePreferences({
      preferredSellers: has
        ? preferences.preferredSellers.filter((x) => x !== seller)
        : [...preferences.preferredSellers, seller],
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={preferences.displayName}
        subtitle={`${preferences.email} · budget ${formatPrice(preferences.monthlyBudget, c)} / month`}
      />

      <Tabs defaultValue="prefs">
        <TabsList className="h-auto flex-wrap rounded-full bg-muted p-1">
          <TabsTrigger value="prefs" className="rounded-full px-4">
            <User className="mr-1.5 h-4 w-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="budget" className="rounded-full px-4">
            <Wallet className="mr-1.5 h-4 w-4" /> Budget
          </TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-full px-4">
            <MapPin className="mr-1.5 h-4 w-4" /> Addresses
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-full px-4">
            <CreditCard className="mr-1.5 h-4 w-4" /> Payments
          </TabsTrigger>
        </TabsList>

        {/* Preferences ---------------------------------------------------- */}
        <TabsContent value="prefs" className="mt-6 grid gap-4">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Account</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={preferences.displayName}
                  onChange={(e) => updatePreferences({ displayName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={preferences.email}
                  onChange={(e) => updatePreferences({ email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={preferences.currency}
                  onValueChange={(v) => updatePreferences({ currency: v as Preferences["currency"] })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian rupee</SelectItem>
                    <SelectItem value="USD">$ US dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(v) => updatePreferences({ theme: v as Preferences["theme"] })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">Match system</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Favourite categories</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Used to personalise your home feed.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => {
                const on = preferences.favouriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Preferred sellers</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Preferred sellers are highlighted in search and comparisons.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sellers.map((seller) => {
                const on = preferences.preferredSellers.includes(seller);
                return (
                  <button
                    key={seller}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSeller(seller)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      on
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {on ? <Star className="h-3.5 w-3.5 fill-primary" /> : null}
                    {seller}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Notifications</h2>
            <ul className="mt-3 grid gap-1">
              {notificationRows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-center justify-between gap-4 rounded-2xl px-1 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.hint}</p>
                  </div>
                  <Switch
                    checked={Boolean(preferences[row.key])}
                    aria-label={row.label}
                    onCheckedChange={(v) => updatePreferences({ [row.key]: v })}
                  />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Demo app — notifications are stored locally and never sent.
            </p>
          </section>

          <Button
            variant="outline"
            className="w-fit rounded-full text-destructive hover:text-destructive"
            onClick={() => {
              resetAll();
              toast.message("Everything reset to the sample data");
            }}
          >
            <Trash2 className="h-4 w-4" /> Reset demo data
          </Button>
        </TabsContent>

        {/* Budget --------------------------------------------------------- */}
        <TabsContent value="budget" className="mt-6 grid gap-4">
          <BudgetCard />
          <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-bold">Monthly shopping budget</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Informational only — Market never connects to a bank or card account.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <Label htmlFor="budget">Budget ({c})</Label>
                <Input
                  id="budget"
                  type="number"
                  inputMode="numeric"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                className="rounded-full"
                onClick={() => {
                  const value = Number(budgetDraft);
                  if (!Number.isFinite(value) || value <= 0) {
                    toast.error("Enter a budget above zero");
                    return;
                  }
                  updatePreferences({ monthlyBudget: Math.round(value) });
                  toast.success("Budget updated");
                }}
              >
                Save budget
              </Button>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Committed this month</dt>
                <dd className="mt-0.5 font-semibold">{formatPrice(budget.committed, c)}</dd>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Remaining</dt>
                <dd className="mt-0.5 font-semibold">{formatPrice(budget.remaining, c)}</dd>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Wishlist potential</dt>
                <dd className="mt-0.5 font-semibold">{formatPrice(budget.wishlistPotential, c)}</dd>
              </div>
            </dl>
          </section>
        </TabsContent>

        {/* Addresses ------------------------------------------------------ */}
        <TabsContent value="addresses" className="mt-6 grid gap-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{a.label}</p>
                  {a.isDefault ? (
                    <Badge className="rounded-full bg-primary/15 text-xs text-primary">Default</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.city}, {a.state} {a.pincode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{a.phone}</p>
                <div className="mt-3 flex gap-2">
                  {!a.isDefault ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setDefaultAddress(a.id)}
                    >
                      Make default
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive"
                    onClick={() => {
                      removeAddress(a.id);
                      toast.message("Address removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <section className="rounded-3xl border border-dashed border-border bg-card/50 p-5">
            <h2 className="text-sm font-bold">Add a delivery address</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["label", "Label (Home, Office)"],
                  ["name", "Full name"],
                  ["phone", "Phone"],
                  ["line1", "Address line 1"],
                  ["line2", "Address line 2 (optional)"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "PIN code"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
            <Button
              className="mt-4 rounded-full"
              onClick={() => {
                if (!draft.label.trim() || !draft.line1.trim() || !draft.city.trim()) {
                  toast.error("Label, address line 1 and city are required");
                  return;
                }
                addAddress(draft);
                setDraft(emptyAddress);
                toast.success("Address saved");
              }}
            >
              <Plus className="h-4 w-4" /> Save address
            </Button>
          </section>
        </TabsContent>

        {/* Payments ------------------------------------------------------- */}
        <TabsContent value="payments" className="mt-6 grid gap-4">
          <p className="inline-flex items-center gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
            Sample payment methods only. Numbers are masked placeholders — no real card, UPI or bank
            details are stored anywhere.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.label}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {p.kind} · {p.issuer}
                    </p>
                  </div>
                  {p.isDefault ? (
                    <Badge className="rounded-full bg-primary/15 text-xs text-primary">Default</Badge>
                  ) : null}
                </div>
                <p className="mt-3 font-mono text-sm">{p.masked}</p>
                {p.expiry ? (
                  <p className="text-xs text-muted-foreground">Expires {p.expiry}</p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  {!p.isDefault ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setDefaultPayment(p.id)}
                    >
                      Make default
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive"
                    onClick={() => {
                      removePayment(p.id);
                      toast.message("Payment method removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <DemoNote className="mt-6" />
    </AppShell>
  );
}
