import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../stores/useStore";

export function BillingScreen() {
  const { products, cart, addToCart, removeFromCart, updateCartQty, clearCart, addBill } = useStore();
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "card">("cash");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBillId, setLastBillId] = useState("");

  const searchResults = search.length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  const subtotal = cart.reduce((sum, c) => sum + c.product.sellingPrice * c.quantity, 0);
  const gst = (subtotal - discount) * 0.05;
  const total = subtotal - discount + gst;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const billId = `B${String(Date.now()).slice(-6)}`;
    addBill({
      id: billId,
      items: [...cart],
      subtotal,
      discount,
      gst,
      total,
      paymentMode,
      customerName: customerName || "Walk-in",
      customerPhone: "",
      date: new Date().toISOString(),
      status: "paid",
    });
    setLastBillId(billId);
    clearCart();
    setShowSuccess(true);
    setCustomerName("");
    setDiscount(0);
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pb-24 px-4 pt-8 flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4"
        >
          <span className="text-4xl">✅</span>
        </motion.div>
        <h2 className="text-xl font-bold font-heading">Payment Successful!</h2>
        <p className="text-sm text-muted-foreground mt-1">Bill #{lastBillId}</p>

        {/* Thermal Receipt */}
        <div className="mt-6 w-full max-w-[300px] bg-card border border-border rounded-xl p-4 font-mono-financial text-[11px]">
          <div className="text-center border-b border-dashed border-border pb-2 mb-2">
            <p className="font-bold text-sm">SHARMA GENERAL STORE</p>
            <p className="text-muted-foreground">MG Road, Indore</p>
            <p className="text-muted-foreground">GST: 23AABCS1234A1ZB</p>
          </div>
          <p className="text-muted-foreground text-center text-[10px] mb-2">
            {new Date().toLocaleString("en-IN")}
          </p>
          <div className="border-b border-dashed border-border pb-2 mb-2">
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Item</span>
              <span>Amount</span>
            </div>
            <p className="text-muted-foreground text-center text-[10px]">
              (Items cleared after checkout)
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-dashed border-border pt-1">
              <span>TOTAL</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-center mt-3 pt-2 border-t border-dashed border-border">
            <p className="text-[10px] text-muted-foreground">Thank you for shopping!</p>
            <p className="text-[10px] text-muted-foreground">Powered by DukaanPro</p>
          </div>
        </div>

        <div className="flex gap-2 mt-6 w-full max-w-[300px]">
          <button className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-success-foreground">
            📱 WhatsApp
          </button>
          <button className="flex-1 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground">
            📄 PDF
          </button>
        </div>
        <button
          onClick={() => setShowSuccess(false)}
          className="mt-3 text-sm text-primary font-semibold"
        >
          ← New Bill
        </button>
      </motion.div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-2 space-y-3">
      <h1 className="text-xl font-bold font-heading">New Bill</h1>

      {/* Customer */}
      <input
        placeholder="Customer name (optional)"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Search Products */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        <input
          placeholder="Search or scan product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { addToCart(p); setSearch(""); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-xl">{p.image}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.sku} · Stock: {p.stock}</p>
                  </div>
                  <span className="text-sm font-mono-financial font-bold">₹{p.sellingPrice}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart */}
      {cart.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl">🛒</span>
          <p className="text-sm text-muted-foreground mt-2">Cart is empty</p>
          <p className="text-xs text-muted-foreground">Search products above to add them</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="flex items-center gap-3 rounded-xl bg-card border border-border p-3"
              >
                <span className="text-2xl">{item.product.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-financial">
                    ₹{item.product.sellingPrice} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                    className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono-financial">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                    className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-bold font-mono-financial w-14 text-right">
                  ₹{(item.product.sellingPrice * item.quantity).toFixed(0)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bill Summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-card border border-border p-4 space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono-financial">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Discount</span>
            <input
              type="number"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="₹0"
              className="w-20 text-right rounded-lg border border-border bg-input px-2 py-1 text-sm font-mono-financial outline-none"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST (5%)</span>
            <span className="font-mono-financial">₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
            <span>Total</span>
            <span className="font-mono-financial">₹{total.toFixed(2)}</span>
          </div>

          {/* Payment Mode */}
          <div className="flex gap-2 pt-2">
            {(["cash", "upi", "card"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                  paymentMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {mode === "cash" ? "💵" : mode === "upi" ? "📱" : "💳"} {mode.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 mt-2"
          >
            Checkout — ₹{total.toFixed(2)}
          </button>
        </motion.div>
      )}
    </div>
  );
}
