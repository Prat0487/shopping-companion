import type { Product } from "./data";

export type CompareScore = {
  product: Product;
  score: number;
  reasons: string[];
};

const norm = (value: number, min: number, max: number) =>
  max === min ? 1 : (value - min) / (max - min);

/**
 * Transparent "best value" scoring across the selected products.
 * Weighted: price 35%, rating 25%, discount 15%, delivery speed 15%, warranty 10%.
 */
export function scoreProducts(items: Product[]): CompareScore[] {
  if (items.length === 0) return [];
  const prices = items.map((p) => p.price);
  const ratings = items.map((p) => p.rating);
  const discounts = items.map((p) => 1 - p.price / p.listPrice);
  const deliveries = items.map((p) => p.deliveryDays);
  const warranties = items.map((p) => p.warrantyMonths);

  const range = (arr: number[]) => [Math.min(...arr), Math.max(...arr)] as const;
  const [pMin, pMax] = range(prices);
  const [rMin, rMax] = range(ratings);
  const [dMin, dMax] = range(discounts);
  const [shipMin, shipMax] = range(deliveries);
  const [wMin, wMax] = range(warranties);

  return items
    .map((product) => {
      const priceScore = 1 - norm(product.price, pMin, pMax);
      const ratingScore = norm(product.rating, rMin, rMax);
      const discountScore = norm(1 - product.price / product.listPrice, dMin, dMax);
      const deliveryScore = 1 - norm(product.deliveryDays, shipMin, shipMax);
      const warrantyScore = norm(product.warrantyMonths, wMin, wMax);

      const score = Math.round(
        (priceScore * 0.35 +
          ratingScore * 0.25 +
          discountScore * 0.15 +
          deliveryScore * 0.15 +
          warrantyScore * 0.1) *
          100,
      );

      const reasons: string[] = [];
      if (product.price === pMin && pMin !== pMax) reasons.push("Lowest price in this comparison");
      if (product.rating === rMax && rMin !== rMax)
        reasons.push(`Highest rated at ${product.rating}★`);
      if (product.deliveryDays === shipMin && shipMin !== shipMax)
        reasons.push(`Fastest delivery (${product.deliveryDays} day${product.deliveryDays === 1 ? "" : "s"})`);
      if (product.warrantyMonths === wMax && wMin !== wMax && wMax > 0)
        reasons.push(`Longest warranty (${product.warrantyMonths} months)`);
      if (product.availability === "out_of_stock") reasons.push("Currently out of stock");
      if (reasons.length === 0) reasons.push("Balanced on price, rating and delivery");

      return { product, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}
