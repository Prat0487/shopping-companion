# Archived Shopping App

This is a complete snapshot of the **decision-first personal shopping superapp** from commit `3d02ab4`, just before the Zomato-style "Bite" food redesign replaced it.

## What is here

- `src/components/shop/` — UI components (app shell, product card, budget card, price chart, compare bar, sparkline, empty state).
- `src/lib/shop/` — data layer, comparison engine, and persisted store.
- `src/routes/` — route pages for home, search, product detail, compare, wishlist, alerts, orders, returns, and profile.
- `src/router.tsx`, `src/routeTree.gen.ts`, `src/styles.css`, `src/start.ts`, `src/server.ts` — the TanStack Start wiring as it existed at that point.

## How to reuse it in another project

1. Open the target Lovable project.
2. Copy the `src/` folder from this archive into that project.
3. Resolve any duplicate route files (e.g., `src/routes/index.tsx`, `src/routes/search.tsx`, `src/routes/profile.tsx`) by keeping the shopping versions or merging them.
4. Install the same dependencies if needed (the original used `motion`, `lucide-react`, and shadcn/ui components already present in the template).
5. Run the dev server and verify the routes.

## Notes

- The app uses `localStorage` for persistence. If you run both this archive and the current Bite app on the same origin, their storage keys may overlap — use a different browser profile or clear storage when switching.
- This is a client-side-only build; no backend or database is required.
