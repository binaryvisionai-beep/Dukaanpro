export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: 'kg' | 'pcs' | 'ltr' | 'box';
  costPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUri?: string;
  createdAt: string;
};

export type BillItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type Bill = {
  id: string;
  billNumber: string;
  items: BillItem[];
  customerName?: string;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMode: 'cash' | 'upi' | 'card';
  status: 'paid' | 'pending';
  createdAt: string;
};

export type StockTransaction = {
  id: string;
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment';
  qty: number;
  costPerUnit?: number;
  date: string;
};

export type FeedItem = {
  id: string;
  type: 'reel' | 'post' | 'story' | 'offer';
  source: string;
  sourceLogo?: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  language: 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te';
  publishedAt: string;
  ctaLabel?: string;
  ctaUrl?: string;
};
