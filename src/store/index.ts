import { create } from 'zustand';
import { Bill, BillItem, FeedItem, Product } from '@/src/types/models';

type Language = 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te';
type DailySales = { day: string; revenue: number; profit: number };
type StoryItem = { id: string; label: string; seen: boolean };
type ShopProfile = { name: string; owner: string; phone: string; address: string; gstNumber: string };
type CartItem = BillItem;

interface AppState {
  products: Product[];
  bills: Bill[];
  cart: CartItem[];
  feedItems: FeedItem[];
  stories: StoryItem[];
  dailySales: DailySales[];
  shop: ShopProfile;
  language: Language;
  darkMode: boolean;
  addProduct: (product: Product) => void;
  updateStock: (id: string, delta: number) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createBill: (input: {
    customerName?: string;
    discount?: number;
    gstRate?: number;
    paymentMode: 'cash' | 'upi' | 'card';
  }) => Bill | null;
  toggleLike: (id: string) => void;
  toggleSavePost: (id: string) => void;
  markStoryRead: (id: string) => void;
  updateShop: (patch: Partial<ShopProfile>) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
}

const now = new Date().toISOString();
const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Tata Salt 1kg', sku: 'TS-001', category: 'Grocery', unit: 'kg', costPrice: 22, sellingPrice: 28, stock: 45, lowStockThreshold: 10, barcode: '8901725133601', createdAt: now },
  { id: 'p2', name: 'Parle-G Biscuit', sku: 'PG-002', category: 'Snacks', unit: 'pcs', costPrice: 5, sellingPrice: 10, stock: 120, lowStockThreshold: 30, barcode: '8901725133602', createdAt: now },
  { id: 'p3', name: 'Amul Butter 500g', sku: 'AB-003', category: 'Dairy', unit: 'pcs', costPrice: 240, sellingPrice: 280, stock: 8, lowStockThreshold: 5, barcode: '8901725133603', createdAt: now },
  { id: 'p4', name: 'Red Label Tea', sku: 'RL-004', category: 'Beverages', unit: 'box', costPrice: 180, sellingPrice: 220, stock: 25, lowStockThreshold: 8, barcode: '8901725133604', createdAt: now }
];

const MOCK_BILLS: Bill[] = [];

const MOCK_DAILY_SALES: DailySales[] = [
  { day: 'Mon', revenue: 4200, profit: 890 },
  { day: 'Tue', revenue: 3800, profit: 720 },
  { day: 'Wed', revenue: 5100, profit: 1050 },
  { day: 'Thu', revenue: 4600, profit: 940 },
  { day: 'Fri', revenue: 6200, profit: 1380 },
  { day: 'Sat', revenue: 7800, profit: 1720 },
  { day: 'Sun', revenue: 5500, profit: 1100 },
];

const MOCK_FEED: FeedItem[] = [
  {
    id: 'f1',
    type: 'post',
    title: 'GST filing dates updated for this quarter',
    description: 'Check compliance timeline and vendor invoice checklist.',
    source: 'Business Today',
    likes: 342,
    isLiked: false,
    isSaved: false,
    tags: ['news'],
    language: 'en',
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'f2',
    type: 'offer',
    title: 'Buy 10 snack boxes, get 1 free',
    description: 'Limited supplier offer for monthly restock.',
    source: 'DukaanPro Deals',
    likes: 1205,
    isLiked: false,
    isSaved: false,
    tags: ['offers'],
    language: 'en',
    publishedAt: new Date().toISOString(),
  },
];

const MOCK_STORIES: StoryItem[] = [
  { id: 's1', label: 'Trending', seen: false },
  { id: 's2', label: 'Offers', seen: false },
  { id: 's3', label: 'Tips', seen: true },
];

export const useStore = create<AppState>((set) => ({
  products: MOCK_PRODUCTS,
  addProduct: (product) => set((s) => ({ products: [product, ...s.products] })),
  updateStock: (id, delta) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      ),
    })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  cart: [],
  addToCart: (product, qty = 1) =>
    set((s) => {
      const existing = s.cart.find((c) => c.productId === product.id);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.productId === product.id ? { ...c, qty: c.qty + qty, total: (c.qty + qty) * c.unitPrice } : c
          ),
        };
      }
      return {
        cart: [
          ...s.cart,
          {
            productId: product.id,
            name: product.name,
            qty,
            unitPrice: product.sellingPrice,
            total: product.sellingPrice * qty,
          },
        ],
      };
    }),
  removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
  updateCartQty: (productId, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter((c) => c.productId !== productId)
          : s.cart.map((c) =>
              c.productId === productId ? { ...c, qty, total: qty * c.unitPrice } : c
            ),
    })),
  clearCart: () => set({ cart: [] }),

  bills: MOCK_BILLS,
  createBill: ({ customerName, discount = 0, gstRate = 5, paymentMode }) => {
    let nextBill: Bill | null = null;
    set((s) => {
      if (!s.cart.length) return s;
      const subtotal = s.cart.reduce((sum, item) => sum + item.total, 0);
      const gst = ((subtotal - discount) * gstRate) / 100;
      nextBill = {
        id: `bill-${Date.now()}`,
        billNumber: `${Math.floor(1000 + Math.random() * 8999)}`,
        items: s.cart,
        customerName,
        subtotal,
        discount,
        gst,
        total: subtotal - discount + gst,
        paymentMode,
        status: 'paid',
        createdAt: new Date().toISOString(),
      };
      return { bills: [nextBill, ...s.bills], cart: [] };
    });
    return nextBill;
  },

  feedItems: MOCK_FEED,
  stories: MOCK_STORIES,
  toggleLike: (id) =>
    set((s) => ({
      feedItems: s.feedItems.map((f) =>
        f.id === id
          ? {
              ...f,
              isLiked: !f.isLiked,
              likes: f.isLiked ? f.likes - 1 : f.likes + 1,
            }
          : f,
      ),
    })),
  toggleSavePost: (id) =>
    set((s) => ({
      feedItems: s.feedItems.map((f) => (f.id === id ? { ...f, isSaved: !f.isSaved } : f)),
    })),
  markStoryRead: (id) =>
    set((s) => ({
      stories: s.stories.map((st) => (st.id === id ? { ...st, seen: true } : st)),
    })),

  dailySales: MOCK_DAILY_SALES,

  shop: {
    name: 'Sharma General Store',
    owner: 'Rajesh Sharma',
    phone: '9876543210',
    address: 'Shop No. 12, MG Road, Indore, MP',
    gstNumber: '23AABCS1234A1ZB',
  },
  updateShop: (patch) => set((state) => ({ shop: { ...state.shop, ...patch } })),

  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
