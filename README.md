# Shopping Companion

Decision-first personal shopping superapp: compare products, track prices, manage a wishlist, and stay on budget.

This repository is the archived shopping app extracted from [`Prat0487/shopping-app`](https://github.com/Prat0487/shopping-app) (`archive/shopping-app`). The original repo now hosts the Bite food-ordering app.

## Features

- Home dashboard with personalized feed, price drops, and pending deliveries
- Unified product search with price, rating, and discount filters
- Side-by-side comparison for 2–4 products with a weighted best-value recommendation
- Wishlist collections with notes and target prices
- 12-week price history charts
- Orders and returns tracking
- Monthly budget guardrails
- Saved addresses and masked payment methods

## Tech stack

- TanStack Start + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Client-side persistence via `localStorage`

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/Prat0487/shopping-companion.git
cd shopping-companion
npm i
npm run dev
```

Sample product data is seeded so the app feels complete on first load.

## Notes

- Persistence uses `localStorage`. If you also run the Bite app on the same origin, storage keys may overlap — use a different browser profile or clear storage when switching.
- This is a client-side-only build; no backend or database is required.
