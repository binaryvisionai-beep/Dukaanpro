import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  lastRestocked: string;
  salesVelocity: number; // units per week
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Bill {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMode: "cash" | "upi" | "card";
  customerName: string;
  customerPhone: string;
  date: string;
  status: "paid" | "pending" | "partial";
}

export interface FeedItem {
  id: string;
  type: "news" | "offer" | "tip" | "reel";
  title: string;
  body: string;
  image: string;
  author: string;
  authorAvatar: string;
  likes: number;
  liked: boolean;
  date: string;
  category: string;
}

export interface StoryItem {
  id: string;
  title: string;
  image: string;
  read: boolean;
  category: "trending" | "offers" | "tips";
}

export interface DailySales {
  day: string;
  revenue: number;
  profit: number;
}

export interface ShopProfile {
  name: string;
  owner: string;
  phone: string;
  address: string;
  gstNumber: string;
  logo: string;
}

type Language = "en" | "hi" | "mr" | "gu" | "ta" | "te";

interface AppState {
  // Products
  products: Product[];
  addProduct: (p: Product) => void;
  updateStock: (id: string, delta: number) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Bills
  bills: Bill[];
  addBill: (bill: Bill) => void;

  // Feed
  feedItems: FeedItem[];
  stories: StoryItem[];
  toggleLike: (id: string) => void;
  markStoryRead: (id: string) => void;

  // Analytics
  dailySales: DailySales[];

  // Profile
  shop: ShopProfile;
  updateShop: (s: Partial<ShopProfile>) => void;

  // Preferences
  language: Language;
  setLanguage: (l: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currency: string;

  // Active tab
  activeTab: number;
  setActiveTab: (t: number) => void;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Tata Salt",
    nameHi: "टाटा नमक",
    sku: "TS-001",
    barcode: "8901725133601",
    category: "Grocery",
    costPrice: 22,
    sellingPrice: 28,
    stock: 45,
    minStock: 10,
    unit: "1kg",
    image: "🧂",
    lastRestocked: "2026-04-10",
    salesVelocity: 12,
  },
  {
    id: "p2",
    name: "Parle-G Biscuit",
    nameHi: "पारले-जी बिस्कुट",
    sku: "PG-002",
    barcode: "8901725133602",
    category: "Snacks",
    costPrice: 5,
    sellingPrice: 10,
    stock: 120,
    minStock: 30,
    unit: "pack",
    image: "🍪",
    lastRestocked: "2026-04-12",
    salesVelocity: 35,
  },
  {
    id: "p3",
    name: "Amul Butter 500g",
    nameHi: "अमूल मक्खन",
    sku: "AB-003",
    barcode: "8901725133603",
    category: "Dairy",
    costPrice: 240,
    sellingPrice: 280,
    stock: 8,
    minStock: 5,
    unit: "500g",
    image: "🧈",
    lastRestocked: "2026-04-08",
    salesVelocity: 4,
  },
  {
    id: "p4",
    name: "Red Label Tea",
    nameHi: "रेड लेबल चाय",
    sku: "RL-004",
    barcode: "8901725133604",
    category: "Beverages",
    costPrice: 180,
    sellingPrice: 220,
    stock: 25,
    minStock: 8,
    unit: "500g",
    image: "🍵",
    lastRestocked: "2026-04-11",
    salesVelocity: 8,
  },
  {
    id: "p5",
    name: "Maggi Noodles",
    nameHi: "मैगी नूडल्स",
    sku: "MN-005",
    barcode: "8901725133605",
    category: "Snacks",
    costPrice: 12,
    sellingPrice: 14,
    stock: 200,
    minStock: 50,
    unit: "pack",
    image: "🍜",
    lastRestocked: "2026-04-13",
    salesVelocity: 42,
  },
  {
    id: "p6",
    name: "Surf Excel 1kg",
    nameHi: "सर्फ एक्सेल",
    sku: "SE-006",
    barcode: "8901725133606",
    category: "Household",
    costPrice: 120,
    sellingPrice: 155,
    stock: 15,
    minStock: 5,
    unit: "1kg",
    image: "🧹",
    lastRestocked: "2026-04-09",
    salesVelocity: 6,
  },
  {
    id: "p7",
    name: "Fortune Oil 1L",
    nameHi: "फॉर्चून तेल",
    sku: "FO-007",
    barcode: "8901725133607",
    category: "Grocery",
    costPrice: 140,
    sellingPrice: 175,
    stock: 20,
    minStock: 8,
    unit: "1L",
    image: "🫒",
    lastRestocked: "2026-04-10",
    salesVelocity: 7,
  },
  {
    id: "p8",
    name: "Dairy Milk Silk",
    nameHi: "डेयरी मिल्क सिल्क",
    sku: "DM-008",
    barcode: "8901725133608",
    category: "Snacks",
    costPrice: 80,
    sellingPrice: 99,
    stock: 3,
    minStock: 10,
    unit: "piece",
    image: "🍫",
    lastRestocked: "2026-04-05",
    salesVelocity: 15,
  },
  {
    id: "p9",
    name: "Colgate Toothpaste",
    nameHi: "कोलगेट",
    sku: "CT-009",
    barcode: "8901725133609",
    category: "Personal Care",
    costPrice: 55,
    sellingPrice: 72,
    stock: 30,
    minStock: 10,
    unit: "100g",
    image: "🪥",
    lastRestocked: "2026-04-11",
    salesVelocity: 9,
  },
  {
    id: "p10",
    name: "Lays Classic Salted",
    nameHi: "लेज़ क्लासिक",
    sku: "LC-010",
    barcode: "8901725133610",
    category: "Snacks",
    costPrice: 18,
    sellingPrice: 20,
    stock: 60,
    minStock: 20,
    unit: "pack",
    image: "🥔",
    lastRestocked: "2026-04-14",
    salesVelocity: 25,
  },
  {
    id: "p11",
    name: "Aashirvaad Atta 5kg",
    nameHi: "आशीर्वाद आटा",
    sku: "AA-011",
    barcode: "8901725133611",
    category: "Grocery",
    costPrice: 220,
    sellingPrice: 275,
    stock: 12,
    minStock: 5,
    unit: "5kg",
    image: "🌾",
    lastRestocked: "2026-04-07",
    salesVelocity: 5,
  },
  {
    id: "p12",
    name: "Vim Dishwash Bar",
    nameHi: "विम बार",
    sku: "VD-012",
    barcode: "8901725133612",
    category: "Household",
    costPrice: 10,
    sellingPrice: 15,
    stock: 40,
    minStock: 15,
    unit: "piece",
    image: "🧽",
    lastRestocked: "2026-04-12",
    salesVelocity: 11,
  },
];

const MOCK_BILLS: Bill[] = [
  {
    id: "B001",
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2 },
      { product: MOCK_PRODUCTS[4], quantity: 5 },
    ],
    subtotal: 126,
    discount: 6,
    gst: 5.4,
    total: 125.4,
    paymentMode: "upi",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    date: "2026-04-16T09:30:00",
    status: "paid",
  },
  {
    id: "B002",
    items: [
      { product: MOCK_PRODUCTS[3], quantity: 1 },
      { product: MOCK_PRODUCTS[6], quantity: 2 },
    ],
    subtotal: 570,
    discount: 20,
    gst: 24.75,
    total: 574.75,
    paymentMode: "cash",
    customerName: "Priya Patel",
    customerPhone: "9876543211",
    date: "2026-04-16T10:15:00",
    status: "paid",
  },
  {
    id: "B003",
    items: [{ product: MOCK_PRODUCTS[7], quantity: 3 }],
    subtotal: 297,
    discount: 0,
    gst: 13.37,
    total: 310.37,
    paymentMode: "card",
    customerName: "Amit Kumar",
    customerPhone: "9876543212",
    date: "2026-04-15T18:00:00",
    status: "pending",
  },
  {
    id: "B004",
    items: [
      { product: MOCK_PRODUCTS[1], quantity: 10 },
      { product: MOCK_PRODUCTS[9], quantity: 5 },
    ],
    subtotal: 200,
    discount: 10,
    gst: 8.55,
    total: 198.55,
    paymentMode: "cash",
    customerName: "Walk-in",
    customerPhone: "",
    date: "2026-04-15T14:00:00",
    status: "paid",
  },
];

const MOCK_DAILY_SALES: DailySales[] = [
  { day: "Mon", revenue: 4200, profit: 890 },
  { day: "Tue", revenue: 3800, profit: 720 },
  { day: "Wed", revenue: 5100, profit: 1050 },
  { day: "Thu", revenue: 4600, profit: 940 },
  { day: "Fri", revenue: 6200, profit: 1380 },
  { day: "Sat", revenue: 7800, profit: 1720 },
  { day: "Sun", revenue: 5500, profit: 1100 },
];

const MOCK_FEED: FeedItem[] = [
  {
    id: "f1",
    type: "news",
    title: "ONDC Network Expands: 50% More Kiranas Onboarded This Quarter",
    body: "The Open Network for Digital Commerce sees massive adoption among small retailers across tier-2 and tier-3 cities.",
    image: "📰",
    author: "Business Today",
    authorAvatar: "📰",
    likes: 342,
    liked: false,
    date: "2026-04-16",
    category: "Industry",
  },
  {
    id: "f2",
    type: "offer",
    title: "🎉 Diwali Stock-Up Sale — Get 15% Off on Bulk Orders!",
    body: "Order ₹10,000+ wholesale from our partner network and get flat 15% discount. Offer valid till Oct 20.",
    image: "🎆",
    author: "DukaanPro Deals",
    authorAvatar: "🏷️",
    likes: 1205,
    liked: false,
    date: "2026-04-15",
    category: "Offers",
  },
  {
    id: "f3",
    type: "tip",
    title: "5 GST Filing Tips Every Shopkeeper Must Know",
    body: "Filing GST returns doesn't have to be painful. Here are 5 simple tips to stay compliant and save money.",
    image: "💡",
    author: "CA Neeraj Gupta",
    authorAvatar: "👨‍💼",
    likes: 89,
    liked: false,
    date: "2026-04-14",
    category: "Tips",
  },
  {
    id: "f4",
    type: "reel",
    title: "How I Increased My Shop Revenue by 3X Using Smart Billing",
    body: "Watch this 60-second reel about a Jaipur shopkeeper who transformed his business.",
    image: "🎬",
    author: "DukaanPro Stories",
    authorAvatar: "🎥",
    likes: 2340,
    liked: false,
    date: "2026-04-13",
    category: "Stories",
  },
  {
    id: "f5",
    type: "news",
    title: "UPI Transactions Cross 20 Billion Monthly Mark",
    body: "India's digital payment revolution continues to break records with rural adoption surging.",
    image: "📱",
    author: "Economic Times",
    authorAvatar: "📰",
    likes: 567,
    liked: false,
    date: "2026-04-12",
    category: "Industry",
  },
  {
    id: "f6",
    type: "tip",
    title: "Smart Inventory Management: The 80/20 Rule",
    body: "Learn how 20% of your products likely generate 80% of your revenue, and how to stock accordingly.",
    image: "📊",
    author: "Retail Expert",
    authorAvatar: "🎓",
    likes: 156,
    liked: false,
    date: "2026-04-11",
    category: "Tips",
  },
];

const MOCK_STORIES: StoryItem[] = [
  {
    id: "s1",
    title: "Trending",
    image: "🔥",
    read: false,
    category: "trending",
  },
  { id: "s2", title: "Offers", image: "🏷️", read: false, category: "offers" },
  { id: "s3", title: "GST Tips", image: "💡", read: true, category: "tips" },
  {
    id: "s4",
    title: "New Launch",
    image: "🚀",
    read: false,
    category: "trending",
  },
  { id: "s5", title: "Wholesale", image: "📦", read: true, category: "offers" },
  { id: "s6", title: "Marketing", image: "📣", read: false, category: "tips" },
];

export const useStore = create<AppState>((set) => ({
  products: MOCK_PRODUCTS,
  addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
  updateStock: (id, delta) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
      ),
    })),
  deleteProduct: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  cart: [],
  addToCart: (product, qty = 1) =>
    set((s) => {
      const existing = s.cart.find((c) => c.product.id === product.id);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.product.id === product.id
              ? { ...c, quantity: c.quantity + qty }
              : c,
          ),
        };
      }
      return { cart: [...s.cart, { product, quantity: qty }] };
    }),
  removeFromCart: (productId) =>
    set((s) => ({ cart: s.cart.filter((c) => c.product.id !== productId) })),
  updateCartQty: (productId, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter((c) => c.product.id !== productId)
          : s.cart.map((c) =>
              c.product.id === productId ? { ...c, quantity: qty } : c,
            ),
    })),
  clearCart: () => set({ cart: [] }),

  bills: MOCK_BILLS,
  addBill: (bill) => set((s) => ({ bills: [bill, ...s.bills] })),

  feedItems: MOCK_FEED,
  stories: MOCK_STORIES,
  toggleLike: (id) =>
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === id
          ? {
              ...f,
              liked: !f.liked,
              likes: f.liked ? f.likes - 1 : f.likes + 1,
            }
          : f,
      ),
    })),
  markStoryRead: (id) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id === id ? { ...st, read: true } : st,
      ),
    })),

  dailySales: MOCK_DAILY_SALES,

  shop: {
    name: "Sharma General Store",
    owner: "Rajesh Sharma",
    phone: "9876543210",
    address: "Shop No. 12, MG Road, Indore, MP",
    gstNumber: "23AABCS1234A1ZB",
    logo: "🏪",
  },
  updateShop: (s) => set((state) => ({ shop: { ...state.shop, ...s } })),

  language: "en",
  setLanguage: (l) => set({ language: l }),
  darkMode: false,
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return { darkMode: next };
    }),
  currency: "₹",

  activeTab: 0,
  setActiveTab: (t) => set({ activeTab: t }),
}));
