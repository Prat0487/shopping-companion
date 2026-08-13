// ---------------------------------------------------------------------------
// DEMO DATA
// Every product, price, order and payment method in this file is fictional
// sample data used to demonstrate the app. No real retailer, bank or courier
// integration exists. Prices are in INR.
// ---------------------------------------------------------------------------

export type Category =
  | "Electronics"
  | "Home"
  | "Fashion"
  | "Beauty"
  | "Fitness"
  | "Kitchen";

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export type PricePoint = { date: string; price: number };

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: Category;
  price: number;
  listPrice: number;
  rating: number;
  reviews: number;
  seller: string;
  sellerRating: number;
  deliveryDays: number;
  deliveryNote: string;
  warrantyMonths: number;
  returnDays: number;
  availability: Availability;
  tags: string[];
  specs: { label: string; value: string }[];
  history: PricePoint[];
  blurb: string;
};

export type Collection = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

export type WishlistItem = {
  productId: string;
  collectionId: string;
  addedAt: string;
  note?: string;
  targetPrice?: number;
};

export type Alert = {
  id: string;
  productId: string;
  targetPrice: number;
  lastKnownPrice: number;
  active: boolean;
  createdAt: string;
  lastCheckedAt: string;
};

export type OrderStatus = "processing" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
export type ReturnStatus = "none" | "requested" | "pickup_scheduled" | "in_transit" | "refund_initiated" | "refunded";

export type OrderItem = { productId: string; quantity: number; unitPrice: number };

export type Order = {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  placedAt: string;
  eta: string;
  deliveredAt?: string;
  seller: string;
  carrier: string;
  tracking: string;
  shippingFee: number;
  total: number;
  addressId: string;
  paymentId: string;
  returnWindowEnds: string;
  returnStatus: ReturnStatus;
  returnReason?: string;
  refundAmount?: number;
  refundEta?: string;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  label: string;
  kind: "card" | "upi" | "netbanking" | "wallet";
  issuer: string;
  masked: string;
  expiry?: string;
  isDefault: boolean;
};

export type Preferences = {
  displayName: string;
  email: string;
  currency: "INR" | "USD";
  theme: "light" | "dark" | "system";
  favouriteCategories: Category[];
  preferredSellers: string[];
  priceDropAlerts: boolean;
  backInStockAlerts: boolean;
  deliveryUpdates: boolean;
  weeklyDigest: boolean;
  monthlyBudget: number;
};

/** Builds 12 weekly price points ending today-ish, from a multiplier drift. */
const hist = (current: number, drift: number[]): PricePoint[] => {
  const start = new Date("2026-05-25T00:00:00Z").getTime();
  return drift.map((d, i) => ({
    date: new Date(start + i * 7 * 86400000).toISOString().slice(0, 10),
    price: Math.round((current * d) / 10) * 10,
  }));
};

export const products: Product[] = [
  {
    id: "p1",
    title: "Soniq Aura ANC Wireless Headphones",
    brand: "Soniq",
    category: "Electronics",
    price: 12499,
    listPrice: 19990,
    rating: 4.5,
    reviews: 8421,
    seller: "GadgetKart",
    sellerRating: 4.4,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 12,
    returnDays: 10,
    availability: "in_stock",
    tags: ["anc", "40h battery", "usb-c"],
    specs: [
      { label: "Battery", value: "40 hours (ANC on)" },
      { label: "Driver", value: "40mm dynamic" },
      { label: "Codec", value: "LDAC, AAC, SBC" },
      { label: "Weight", value: "252 g" },
    ],
    history: hist(12499, [1.42, 1.4, 1.34, 1.3, 1.24, 1.18, 1.14, 1.12, 1.08, 1.05, 1.02, 1]),
    blurb: "Adaptive noise cancellation with 40 hours of playback and multipoint pairing.",
  },
  {
    id: "p2",
    title: "Soniq Pulse Buds Pro",
    brand: "Soniq",
    category: "Electronics",
    price: 4999,
    listPrice: 7999,
    rating: 4.3,
    reviews: 15230,
    seller: "GadgetKart",
    sellerRating: 4.4,
    deliveryDays: 1,
    deliveryNote: "Free next-day",
    warrantyMonths: 12,
    returnDays: 7,
    availability: "in_stock",
    tags: ["tws", "anc", "ipx5"],
    specs: [
      { label: "Battery", value: "8h + 28h case" },
      { label: "Water rating", value: "IPX5" },
      { label: "Codec", value: "AAC, SBC" },
      { label: "Weight", value: "4.6 g per bud" },
    ],
    history: hist(4999, [1.3, 1.28, 1.24, 1.22, 1.18, 1.16, 1.12, 1.08, 1.06, 1.04, 1.02, 1]),
    blurb: "Compact ANC earbuds tuned for commutes with low-latency game mode.",
  },
  {
    id: "p3",
    title: "Northline Wave 5 Bluetooth Headphones",
    brand: "Northline",
    category: "Electronics",
    price: 9499,
    listPrice: 13999,
    rating: 4.2,
    reviews: 3120,
    seller: "AudioBazaar",
    sellerRating: 4.1,
    deliveryDays: 4,
    deliveryNote: "₹49 delivery",
    warrantyMonths: 24,
    returnDays: 7,
    availability: "low_stock",
    tags: ["over-ear", "long battery"],
    specs: [
      { label: "Battery", value: "55 hours" },
      { label: "Driver", value: "40mm" },
      { label: "Codec", value: "AAC, SBC" },
      { label: "Weight", value: "268 g" },
    ],
    history: hist(9499, [1.24, 1.22, 1.2, 1.18, 1.14, 1.12, 1.1, 1.06, 1.04, 1.02, 1.01, 1]),
    blurb: "Marathon 55-hour battery with a two-year warranty and plush earcups.",
  },
  {
    id: "p4",
    title: "Vantage 27\" 4K Monitor",
    brand: "Vantage",
    category: "Electronics",
    price: 28990,
    listPrice: 41999,
    rating: 4.6,
    reviews: 1840,
    seller: "TechDirect India",
    sellerRating: 4.6,
    deliveryDays: 3,
    deliveryNote: "Free delivery",
    warrantyMonths: 36,
    returnDays: 10,
    availability: "in_stock",
    tags: ["4k", "usb-c 90w", "srgb"],
    specs: [
      { label: "Panel", value: "27\" IPS 4K 60Hz" },
      { label: "Colour", value: "99% sRGB" },
      { label: "Ports", value: "USB-C 90W, 2x HDMI" },
      { label: "Stand", value: "Height + pivot" },
    ],
    history: hist(28990, [1.34, 1.32, 1.3, 1.26, 1.22, 1.18, 1.14, 1.1, 1.06, 1.03, 1.01, 1]),
    blurb: "Single-cable 4K workstation display with 90W laptop charging.",
  },
  {
    id: "p5",
    title: "Kairo Smartwatch S3",
    brand: "Kairo",
    category: "Fitness",
    price: 6499,
    listPrice: 9999,
    rating: 4.1,
    reviews: 9870,
    seller: "FitStore",
    sellerRating: 4.0,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 12,
    returnDays: 7,
    availability: "in_stock",
    tags: ["amoled", "spo2", "gps"],
    specs: [
      { label: "Display", value: "1.43\" AMOLED" },
      { label: "Battery", value: "10 days" },
      { label: "Sensors", value: "HR, SpO2, GPS" },
      { label: "Rating", value: "5 ATM" },
    ],
    history: hist(6499, [1.28, 1.26, 1.22, 1.2, 1.16, 1.12, 1.1, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Bright AMOLED tracker with built-in GPS and ten-day battery.",
  },
  {
    id: "p6",
    title: "Kairo Air Running Shoes",
    brand: "Kairo",
    category: "Fitness",
    price: 3299,
    listPrice: 5499,
    rating: 4.4,
    reviews: 4210,
    seller: "SportsAdda",
    sellerRating: 4.3,
    deliveryDays: 3,
    deliveryNote: "Free delivery",
    warrantyMonths: 6,
    returnDays: 14,
    availability: "in_stock",
    tags: ["cushioned", "breathable"],
    specs: [
      { label: "Drop", value: "8 mm" },
      { label: "Weight", value: "245 g" },
      { label: "Upper", value: "Engineered mesh" },
      { label: "Use", value: "Daily road runs" },
    ],
    history: hist(3299, [1.32, 1.3, 1.26, 1.22, 1.2, 1.16, 1.12, 1.08, 1.05, 1.02, 1.01, 1]),
    blurb: "Everyday trainers with responsive foam and a breathable knit upper.",
  },
  {
    id: "p7",
    title: "Hearth Cast Iron Kadai 3L",
    brand: "Hearth",
    category: "Kitchen",
    price: 2499,
    listPrice: 3799,
    rating: 4.7,
    reviews: 2610,
    seller: "Kitchen Yard",
    sellerRating: 4.5,
    deliveryDays: 4,
    deliveryNote: "₹49 delivery",
    warrantyMonths: 60,
    returnDays: 10,
    availability: "in_stock",
    tags: ["pre-seasoned", "induction"],
    specs: [
      { label: "Capacity", value: "3 litres" },
      { label: "Material", value: "Pre-seasoned cast iron" },
      { label: "Hob", value: "Gas + induction" },
      { label: "Weight", value: "2.8 kg" },
    ],
    history: hist(2499, [1.22, 1.2, 1.18, 1.16, 1.14, 1.1, 1.08, 1.06, 1.03, 1.02, 1.01, 1]),
    blurb: "Naturally non-stick kadai that gets better with every tadka.",
  },
  {
    id: "p8",
    title: "Hearth 1.5L Electric Kettle",
    brand: "Hearth",
    category: "Kitchen",
    price: 1299,
    listPrice: 2199,
    rating: 4.2,
    reviews: 7420,
    seller: "Kitchen Yard",
    sellerRating: 4.5,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 24,
    returnDays: 10,
    availability: "in_stock",
    tags: ["auto cutoff", "steel"],
    specs: [
      { label: "Capacity", value: "1.5 litres" },
      { label: "Power", value: "1500 W" },
      { label: "Body", value: "304 stainless steel" },
      { label: "Safety", value: "Auto cut-off" },
    ],
    history: hist(1299, [1.35, 1.32, 1.28, 1.24, 1.2, 1.16, 1.12, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Fast-boil steel kettle with dry-boil protection and cool-touch handle.",
  },
  {
    id: "p9",
    title: "Loomcraft Cotton Bedsheet Set",
    brand: "Loomcraft",
    category: "Home",
    price: 1899,
    listPrice: 3499,
    rating: 4.3,
    reviews: 5310,
    seller: "HomeNest",
    sellerRating: 4.2,
    deliveryDays: 3,
    deliveryNote: "Free delivery",
    warrantyMonths: 0,
    returnDays: 14,
    availability: "in_stock",
    tags: ["300 tc", "king", "cotton"],
    specs: [
      { label: "Size", value: "King 274 x 274 cm" },
      { label: "Thread count", value: "300 TC" },
      { label: "Fabric", value: "100% cotton" },
      { label: "Includes", value: "1 sheet + 2 covers" },
    ],
    history: hist(1899, [1.4, 1.36, 1.3, 1.26, 1.22, 1.18, 1.14, 1.1, 1.05, 1.02, 1.01, 1]),
    blurb: "Breathable 300 TC cotton that stays cool through Indian summers.",
  },
  {
    id: "p10",
    title: "Lumen Smart LED Table Lamp",
    brand: "Lumen",
    category: "Home",
    price: 2299,
    listPrice: 3299,
    rating: 4.0,
    reviews: 1180,
    seller: "HomeNest",
    sellerRating: 4.2,
    deliveryDays: 5,
    deliveryNote: "₹79 delivery",
    warrantyMonths: 12,
    returnDays: 7,
    availability: "low_stock",
    tags: ["dimmable", "app control"],
    specs: [
      { label: "Brightness", value: "600 lumens" },
      { label: "Colour", value: "2700K–6500K" },
      { label: "Control", value: "App + touch" },
      { label: "Power", value: "9 W" },
    ],
    history: hist(2299, [1.24, 1.22, 1.2, 1.18, 1.14, 1.12, 1.1, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Tunable desk light with reading, focus and night presets.",
  },
  {
    id: "p11",
    title: "Terra Air Purifier A200",
    brand: "Terra",
    category: "Home",
    price: 11499,
    listPrice: 17999,
    rating: 4.5,
    reviews: 2960,
    seller: "TechDirect India",
    sellerRating: 4.6,
    deliveryDays: 3,
    deliveryNote: "Free delivery",
    warrantyMonths: 24,
    returnDays: 10,
    availability: "in_stock",
    tags: ["hepa", "pm2.5", "quiet"],
    specs: [
      { label: "Coverage", value: "Up to 450 sq ft" },
      { label: "Filter", value: "True HEPA H13" },
      { label: "Noise", value: "24–52 dB" },
      { label: "CADR", value: "380 m³/h" },
    ],
    history: hist(11499, [1.32, 1.3, 1.26, 1.24, 1.2, 1.16, 1.12, 1.08, 1.05, 1.02, 1.01, 1]),
    blurb: "H13 HEPA purifier with a real-time PM2.5 readout for city air.",
  },
  {
    id: "p12",
    title: "Indigo Weave Cotton Kurta",
    brand: "Indigo Weave",
    category: "Fashion",
    price: 1499,
    listPrice: 2799,
    rating: 4.2,
    reviews: 3340,
    seller: "StyleBazaar",
    sellerRating: 4.0,
    deliveryDays: 4,
    deliveryNote: "Free delivery",
    warrantyMonths: 0,
    returnDays: 14,
    availability: "in_stock",
    tags: ["handloom", "summer"],
    specs: [
      { label: "Fabric", value: "Handloom cotton" },
      { label: "Fit", value: "Regular" },
      { label: "Care", value: "Machine wash cold" },
      { label: "Origin", value: "Made in India" },
    ],
    history: hist(1499, [1.42, 1.38, 1.34, 1.28, 1.24, 1.2, 1.14, 1.1, 1.05, 1.02, 1.01, 1]),
    blurb: "Breathable handloom kurta with natural indigo dye.",
  },
  {
    id: "p13",
    title: "Trailhead Laptop Backpack 28L",
    brand: "Trailhead",
    category: "Fashion",
    price: 2199,
    listPrice: 3999,
    rating: 4.6,
    reviews: 6180,
    seller: "StyleBazaar",
    sellerRating: 4.0,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 36,
    returnDays: 10,
    availability: "in_stock",
    tags: ["water resistant", "15.6 inch"],
    specs: [
      { label: "Capacity", value: "28 litres" },
      { label: "Laptop", value: "Up to 15.6\"" },
      { label: "Fabric", value: "Water-resistant polyester" },
      { label: "Weight", value: "760 g" },
    ],
    history: hist(2199, [1.36, 1.34, 1.3, 1.26, 1.22, 1.18, 1.12, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Commuter backpack with a padded sleeve and hidden anti-theft pocket.",
  },
  {
    id: "p14",
    title: "Petal Lab Vitamin C Serum 30ml",
    brand: "Petal Lab",
    category: "Beauty",
    price: 899,
    listPrice: 1499,
    rating: 4.1,
    reviews: 11240,
    seller: "GlowMart",
    sellerRating: 4.3,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 0,
    returnDays: 7,
    availability: "in_stock",
    tags: ["vitamin c", "vegan"],
    specs: [
      { label: "Volume", value: "30 ml" },
      { label: "Key active", value: "10% Vitamin C" },
      { label: "Skin type", value: "All" },
      { label: "Shelf life", value: "12 months" },
    ],
    history: hist(899, [1.28, 1.26, 1.24, 1.2, 1.16, 1.14, 1.1, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Stabilised vitamin C for dullness, layered under sunscreen.",
  },
  {
    id: "p15",
    title: "Petal Lab Mineral Sunscreen SPF 50",
    brand: "Petal Lab",
    category: "Beauty",
    price: 649,
    listPrice: 999,
    rating: 4.4,
    reviews: 8730,
    seller: "GlowMart",
    sellerRating: 4.3,
    deliveryDays: 2,
    deliveryNote: "Free delivery",
    warrantyMonths: 0,
    returnDays: 7,
    availability: "out_of_stock",
    tags: ["spf 50", "no white cast"],
    specs: [
      { label: "Volume", value: "50 ml" },
      { label: "SPF", value: "50 PA++++" },
      { label: "Finish", value: "Matte, no white cast" },
      { label: "Type", value: "Mineral" },
    ],
    history: hist(649, [1.24, 1.22, 1.2, 1.18, 1.14, 1.12, 1.08, 1.06, 1.03, 1.02, 1.01, 1]),
    blurb: "Lightweight mineral SPF that layers well under makeup.",
  },
  {
    id: "p16",
    title: "FlexCore Adjustable Dumbbell 20kg",
    brand: "FlexCore",
    category: "Fitness",
    price: 7999,
    listPrice: 12999,
    rating: 4.5,
    reviews: 1420,
    seller: "FitStore",
    sellerRating: 4.0,
    deliveryDays: 6,
    deliveryNote: "₹149 delivery",
    warrantyMonths: 24,
    returnDays: 10,
    availability: "in_stock",
    tags: ["adjustable", "home gym"],
    specs: [
      { label: "Range", value: "2.5–20 kg" },
      { label: "Increments", value: "2.5 kg" },
      { label: "Material", value: "Cast iron + steel" },
      { label: "Includes", value: "Pair + tray" },
    ],
    history: hist(7999, [1.3, 1.28, 1.26, 1.22, 1.18, 1.15, 1.12, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Space-saving dial dumbbells that replace a full rack.",
  },
  {
    id: "p17",
    title: "Brewly Espresso Machine EM3",
    brand: "Brewly",
    category: "Kitchen",
    price: 18999,
    listPrice: 26999,
    rating: 4.4,
    reviews: 980,
    seller: "Kitchen Yard",
    sellerRating: 4.5,
    deliveryDays: 5,
    deliveryNote: "Free delivery",
    warrantyMonths: 24,
    returnDays: 10,
    availability: "low_stock",
    tags: ["15 bar", "steam wand"],
    specs: [
      { label: "Pressure", value: "15 bar" },
      { label: "Portafilter", value: "54 mm" },
      { label: "Tank", value: "1.8 litres" },
      { label: "Extras", value: "Steam wand" },
    ],
    history: hist(18999, [1.28, 1.26, 1.24, 1.22, 1.18, 1.14, 1.1, 1.08, 1.04, 1.02, 1.01, 1]),
    blurb: "Café-style espresso at home with a proper steam wand for lattes.",
  },
  {
    id: "p18",
    title: "Vantage Aero 14 Laptop",
    brand: "Vantage",
    category: "Electronics",
    price: 62990,
    listPrice: 78999,
    rating: 4.3,
    reviews: 640,
    seller: "TechDirect India",
    sellerRating: 4.6,
    deliveryDays: 3,
    deliveryNote: "Free delivery",
    warrantyMonths: 12,
    returnDays: 7,
    availability: "in_stock",
    tags: ["16gb", "oled", "thin"],
    specs: [
      { label: "CPU", value: "8-core, 16 threads" },
      { label: "Memory", value: "16 GB LPDDR5" },
      { label: "Storage", value: "512 GB NVMe" },
      { label: "Display", value: "14\" 2.8K OLED" },
    ],
    history: hist(62990, [1.22, 1.2, 1.18, 1.16, 1.13, 1.1, 1.07, 1.05, 1.03, 1.02, 1.01, 1]),
    blurb: "Featherweight 14-inch OLED laptop for travel-heavy workdays.",
  },
];

export const defaultCollections: Collection[] = [
  { id: "c1", name: "Desk setup", emoji: "🖥️", description: "The 2026 workstation rebuild" },
  { id: "c2", name: "Home refresh", emoji: "🛋️", description: "Slow upgrades for the flat" },
  { id: "c3", name: "Gift ideas", emoji: "🎁", description: "Birthdays and festive season" },
];

export const defaultWishlist: WishlistItem[] = [
  { productId: "p4", collectionId: "c1", addedAt: "2026-07-14", note: "Wait for a sub-₹27,000 dip", targetPrice: 26999 },
  { productId: "p10", collectionId: "c1", addedAt: "2026-07-21", targetPrice: 1999 },
  { productId: "p18", collectionId: "c1", addedAt: "2026-08-02", note: "Only if exchange offer returns" },
  { productId: "p11", collectionId: "c2", addedAt: "2026-06-30", targetPrice: 9999 },
  { productId: "p9", collectionId: "c2", addedAt: "2026-07-06" },
  { productId: "p17", collectionId: "c3", addedAt: "2026-08-01", note: "For Priya's housewarming" },
  { productId: "p7", collectionId: "c3", addedAt: "2026-07-02" },
];

export const defaultAlerts: Alert[] = [
  { id: "a1", productId: "p4", targetPrice: 26999, lastKnownPrice: 29990, active: true, createdAt: "2026-07-14", lastCheckedAt: "2026-08-10" },
  { id: "a2", productId: "p1", targetPrice: 10999, lastKnownPrice: 12999, active: true, createdAt: "2026-07-19", lastCheckedAt: "2026-08-10" },
  { id: "a3", productId: "p11", targetPrice: 9999, lastKnownPrice: 11999, active: true, createdAt: "2026-06-11", lastCheckedAt: "2026-08-10" },
  { id: "a4", productId: "p16", targetPrice: 8499, lastKnownPrice: 8299, active: false, createdAt: "2026-05-28", lastCheckedAt: "2026-08-09" },
];

export const defaultOrders: Order[] = [
  {
    id: "MKT-10455",
    items: [{ productId: "p13", quantity: 1, unitPrice: 2199 }],
    status: "out_for_delivery",
    placedAt: "2026-08-07",
    eta: "2026-08-10",
    seller: "StyleBazaar",
    carrier: "Bluewave Logistics",
    tracking: "BLW7741220983",
    shippingFee: 0,
    total: 2199,
    addressId: "ad1",
    paymentId: "pm2",
    returnWindowEnds: "2026-08-20",
    returnStatus: "none",
  },
  {
    id: "MKT-10441",
    items: [
      { productId: "p14", quantity: 1, unitPrice: 899 },
      { productId: "p15", quantity: 2, unitPrice: 649 },
    ],
    status: "shipped",
    placedAt: "2026-08-05",
    eta: "2026-08-12",
    seller: "GlowMart",
    carrier: "Indipost Express",
    tracking: "IPX5590183321",
    shippingFee: 49,
    total: 2246,
    addressId: "ad1",
    paymentId: "pm1",
    returnWindowEnds: "2026-08-19",
    returnStatus: "none",
  },
  {
    id: "MKT-10392",
    items: [{ productId: "p8", quantity: 1, unitPrice: 1299 }],
    status: "delivered",
    placedAt: "2026-07-24",
    eta: "2026-07-27",
    deliveredAt: "2026-07-27",
    seller: "Kitchen Yard",
    carrier: "Bluewave Logistics",
    tracking: "BLW7740012338",
    shippingFee: 0,
    total: 1299,
    addressId: "ad2",
    paymentId: "pm2",
    returnWindowEnds: "2026-08-06",
    returnStatus: "none",
  },
  {
    id: "MKT-10371",
    items: [{ productId: "p6", quantity: 1, unitPrice: 3299 }],
    status: "delivered",
    placedAt: "2026-07-12",
    eta: "2026-07-16",
    deliveredAt: "2026-07-16",
    seller: "SportsAdda",
    carrier: "Indipost Express",
    tracking: "IPX5590441002",
    shippingFee: 0,
    total: 3299,
    addressId: "ad1",
    paymentId: "pm3",
    returnWindowEnds: "2026-07-30",
    returnStatus: "refund_initiated",
    returnReason: "Size too small",
    refundAmount: 3299,
    refundEta: "2026-08-13",
  },
  {
    id: "MKT-10344",
    items: [{ productId: "p5", quantity: 1, unitPrice: 6499 }],
    status: "delivered",
    placedAt: "2026-06-28",
    eta: "2026-07-01",
    deliveredAt: "2026-07-01",
    seller: "FitStore",
    carrier: "Bluewave Logistics",
    tracking: "BLW7738810022",
    shippingFee: 0,
    total: 6499,
    addressId: "ad1",
    paymentId: "pm1",
    returnWindowEnds: "2026-07-08",
    returnStatus: "refunded",
    returnReason: "Ordered wrong variant",
    refundAmount: 6499,
    refundEta: "2026-07-12",
  },
  {
    id: "MKT-10480",
    items: [{ productId: "p12", quantity: 2, unitPrice: 1499 }],
    status: "processing",
    placedAt: "2026-08-09",
    eta: "2026-08-14",
    seller: "StyleBazaar",
    carrier: "Awaiting pickup",
    tracking: "—",
    shippingFee: 0,
    total: 2998,
    addressId: "ad2",
    paymentId: "pm2",
    returnWindowEnds: "2026-08-28",
    returnStatus: "none",
  },
];

export const defaultAddresses: Address[] = [
  {
    id: "ad1",
    label: "Home",
    name: "Ananya Sharma",
    phone: "+91 98•••• ••21",
    line1: "B-402, Sunrise Residency",
    line2: "Koramangala 5th Block",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560095",
    isDefault: true,
  },
  {
    id: "ad2",
    label: "Work",
    name: "Ananya Sharma",
    phone: "+91 98•••• ••21",
    line1: "7th Floor, Orion Tech Park",
    line2: "Outer Ring Road, Bellandur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    isDefault: false,
  },
  {
    id: "ad3",
    label: "Parents",
    name: "R. K. Sharma",
    phone: "+91 94•••• ••07",
    line1: "12, Gomti Nagar Extension",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226010",
    isDefault: false,
  },
];

export const defaultPayments: PaymentMethod[] = [
  { id: "pm1", label: "Everyday card", kind: "card", issuer: "HDFC Visa", masked: "•••• •••• •••• 4412", expiry: "07/29", isDefault: true },
  { id: "pm2", label: "UPI", kind: "upi", issuer: "UPI", masked: "ananya•••@okaxis", isDefault: false },
  { id: "pm3", label: "Rewards card", kind: "card", issuer: "ICICI Amex", masked: "•••• •••••• •1008", expiry: "11/28", isDefault: false },
  { id: "pm4", label: "Wallet", kind: "wallet", issuer: "MarketPay", masked: "Balance ₹1,240", isDefault: false },
];

export const defaultPreferences: Preferences = {
  displayName: "Ananya Sharma",
  email: "ananya@example.in",
  currency: "INR",
  theme: "light",
  favouriteCategories: ["Electronics", "Home", "Kitchen"],
  preferredSellers: ["TechDirect India", "Kitchen Yard"],
  priceDropAlerts: true,
  backInStockAlerts: true,
  deliveryUpdates: true,
  weeklyDigest: false,
  monthlyBudget: 15000,
};

export const defaultRecentlyViewed = ["p4", "p1", "p11", "p13", "p17"];

export const categoryTint: Record<Category, string> = {
  Electronics: "from-chart-4/25 to-chart-4/5",
  Home: "from-chart-2/30 to-chart-2/5",
  Fashion: "from-primary/25 to-primary/5",
  Beauty: "from-chart-5/30 to-chart-5/5",
  Fitness: "from-chart-2/25 to-chart-3/10",
  Kitchen: "from-chart-3/30 to-chart-3/5",
};

export const categories: Category[] = [
  "Electronics",
  "Home",
  "Fashion",
  "Beauty",
  "Fitness",
  "Kitchen",
];

export const sellers = Array.from(new Set(products.map((p) => p.seller))).sort();

export const availabilityLabel: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Only a few left",
  out_of_stock: "Out of stock",
};

export const orderStatusFlow: OrderStatus[] = [
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const returnStatusLabel: Record<ReturnStatus, string> = {
  none: "No return",
  requested: "Return requested",
  pickup_scheduled: "Pickup scheduled",
  in_transit: "Item in transit",
  refund_initiated: "Refund initiated",
  refunded: "Refunded",
};
