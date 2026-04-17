import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../stores/useStore";
import type { Product } from "../stores/useStore";

const CATEGORIES = ["All", "Grocery", "Snacks", "Dairy", "Beverages", "Household", "Personal Care"];

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  const level = stock <= 0 ? "out" : stock <= minStock ? "low" : stock <= minStock * 2 ? "medium" : "good";
  const styles = {
    out: "bg-destructive/10 text-destructive",
    low: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    good: "bg-success/10 text-success",
  };
  const labels = { out: "OUT", low: "LOW", medium: "OK", good: "IN STOCK" };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function AddProductSheet({ onClose }: { onClose: () => void }) {
  const { addProduct, products } = useStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Grocery");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleAdd = () => {
    if (!name || !costPrice || !sellingPrice) return;
    const sku = `${name.slice(0, 2).toUpperCase()}-${String(products.length + 1).padStart(3, "0")}`;
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name,
      sku,
      barcode: `890${Date.now()}`,
      category,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock) || 0,
      minStock: 5,
      unit: "piece",
      image: "📦",
      lastRestocked: new Date().toISOString().split("T")[0],
      salesVelocity: 5,
    };
    addProduct(newProduct);
    onClose();
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-2xl bg-card border-t border-border p-5 shadow-2xl"
    >
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
      <h3 className="text-lg font-bold font-heading mb-4">Add New Product</h3>
      <div className="space-y-3">
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.slice(1).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            placeholder="Cost ₹"
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Sell ₹"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            Add Product
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function InventoryScreen() {
  const { products, updateStock, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="pb-24 px-4 pt-2 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-heading">Inventory</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          + Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        <input
          placeholder="Search products or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === c
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">📦</span>
            <p className="text-sm text-muted-foreground mt-2">No products found</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 text-sm text-primary font-semibold">
              + Add your first product
            </button>
          </div>
        )}

        <AnimatePresence>
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="relative overflow-hidden rounded-xl bg-card border border-border"
            >
              {/* Delete bg */}
              {swipedId === product.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-y-0 right-0 flex items-center bg-destructive px-4"
                >
                  <button
                    onClick={() => { deleteProduct(product.id); setSwipedId(null); }}
                    className="text-destructive-foreground text-xs font-bold"
                  >
                    Delete
                  </button>
                </motion.div>
              )}

              <div
                className="flex items-center gap-3 p-3 bg-card relative z-10"
                onClick={() => setSwipedId(swipedId === product.id ? null : product.id)}
              >
                <span className="text-3xl">{product.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{product.name}</p>
                    <StockBadge stock={product.stock} minStock={product.minStock} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    SKU: {product.sku} · {product.category}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground line-through font-mono-financial">
                      ₹{product.costPrice}
                    </span>
                    <span className="text-xs font-bold font-mono-financial text-success">
                      ₹{product.sellingPrice}
                    </span>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStock(product.id, -1); }}
                    className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-mono-financial font-bold">
                    {product.stock}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStock(product.id, 1); }}
                    className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Product Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground z-40"
              onClick={() => setShowAdd(false)}
            />
            <AddProductSheet onClose={() => setShowAdd(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
