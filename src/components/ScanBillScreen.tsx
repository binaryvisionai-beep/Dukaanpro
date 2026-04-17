import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../stores/useStore";

export function ScanBillScreen() {
  const { products, cart, addToCart, clearCart, addBill, updateCartQty } = useStore();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedProduct, setScannedProduct] = useState<typeof products[0] | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.product.sellingPrice * c.quantity, 0);

  const simulateScan = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    setScannedProduct(randomProduct);
    setScanCount((c) => c + 1);
  };

  const handleAddScanned = () => {
    if (scannedProduct) {
      addToCart(scannedProduct);
      setScannedProduct(null);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const subtotal = cartTotal;
    const gst = subtotal * 0.05;
    addBill({
      id: `B${String(Date.now()).slice(-6)}`,
      items: [...cart],
      subtotal,
      discount: 0,
      gst,
      total: subtotal + gst,
      paymentMode: "upi",
      customerName: "Walk-in",
      customerPhone: "",
      date: new Date().toISOString(),
      status: "paid",
    });
    clearCart();
    setShowCart(false);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-24 flex flex-col items-center justify-center min-h-[70vh]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-xl font-bold font-heading">Bill Generated!</h2>
        <p className="text-sm text-muted-foreground mt-1">{scanCount} items scanned</p>
        <div className="flex gap-3 mt-6">
          <button className="rounded-xl bg-success px-6 py-3 text-sm font-bold text-success-foreground">
            📱 Share
          </button>
          <button
            onClick={() => { setShowSuccess(false); setScanCount(0); }}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            New Scan
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-80px)]">
      {/* Mock Camera View */}
      <div className="relative bg-foreground/95 mx-4 mt-2 rounded-2xl overflow-hidden" style={{ height: "55vh" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-56 h-56 border-2 border-primary/50 rounded-2xl">
            {/* Corner markers */}
            <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-3 border-l-3 border-primary rounded-tl-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-3 border-r-3 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-3 border-l-3 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-3 border-r-3 border-primary rounded-br-lg" />

            {/* Scanning line */}
            {isScanning && (
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_var(--color-primary)]"
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>

        {/* Overlay text */}
        <div className="absolute top-4 left-0 right-0 text-center">
          <p className="text-card text-sm font-semibold">Point at barcode</p>
          <p className="text-card/60 text-xs">Multi-scan mode active</p>
        </div>

        {/* Flash / Torch toggle */}
        <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-card/20 flex items-center justify-center">
          <span className="text-sm">🔦</span>
        </button>

        {/* Manual scan button */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={simulateScan}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg"
          >
            📷 Tap to Simulate Scan
          </motion.button>
        </div>
      </div>

      {/* Scanned Product Card */}
      <AnimatePresence>
        {scannedProduct && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="mx-4 mt-3 rounded-xl bg-card border-2 border-success p-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-5 rounded-full bg-success flex items-center justify-center text-[10px] text-success-foreground">✓</span>
              <span className="text-xs font-bold text-success">Product Found!</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{scannedProduct.image}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{scannedProduct.name}</p>
                <p className="text-xs text-muted-foreground">{scannedProduct.sku} · {scannedProduct.barcode}</p>
                <p className="text-lg font-bold font-mono-financial text-success mt-1">
                  ₹{scannedProduct.sellingPrice}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddScanned}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
              >
                Add to Bill
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Bubble */}
      {cartCount > 0 && !showCart && (
        <motion.button
          key={cartCount}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 right-4 max-w-[430px] z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3 shadow-xl shadow-primary/30"
        >
          <motion.span
            key={cartCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >
            🛒
          </motion.span>
          <span className="text-sm font-bold text-primary-foreground">
            {cartCount} items · ₹{cartTotal.toFixed(0)}
          </span>
          <span className="text-primary-foreground/60 text-xs">↑ View</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground z-40"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-2xl bg-card border-t border-border p-5 max-h-[70vh] overflow-y-auto"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
              <h3 className="text-lg font-bold font-heading mb-3">Cart ({cartCount} items)</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                    <span className="text-2xl">{item.product.image}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{item.product.name}</p>
                      <p className="text-xs font-mono-financial text-muted-foreground">₹{item.product.sellingPrice}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-xs font-bold"
                      >−</button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground"
                      >+</button>
                    </div>
                    <span className="text-sm font-bold font-mono-financial">
                      ₹{(item.product.sellingPrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold font-mono-financial">₹{(cartTotal * 1.05).toFixed(2)}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg"
                >
                  Checkout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
