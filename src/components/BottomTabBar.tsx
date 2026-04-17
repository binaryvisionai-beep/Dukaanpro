import { motion } from "framer-motion";
import { useStore } from "../stores/useStore";

const tabs = [
  { icon: "🏠", label: "Home" },
  { icon: "📦", label: "Inventory" },
  { icon: "scan", label: "Scan" },
  { icon: "📰", label: "Feed" },
  { icon: "👤", label: "Profile" },
];

export function BottomTabBar() {
  const { activeTab, setActiveTab, cart } = useStore();
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="tab-bar bg-card border-t border-border safe-bottom">
      <div className="flex items-end justify-around px-2 pt-1 pb-2">
        {tabs.map((tab, i) => {
          const isCenter = i === 2;
          const isActive = activeTab === i;

          if (isCenter) {
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className="relative -mt-6 flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 ${
                    isActive ? "ring-4 ring-primary/20" : ""
                  }`}
                >
                  {/* Barcode scan icon */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <line x1="7" y1="8" x2="7" y2="16" />
                    <line x1="11" y1="8" x2="11" y2="16" />
                    <line x1="15" y1="8" x2="15" y2="12" />
                    <line x1="17" y1="8" x2="17" y2="16" />
                  </svg>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
                <span className="mt-1 text-[10px] font-semibold text-primary">
                  Scan
                </span>
              </button>
            );
          }

          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="flex flex-col items-center gap-0.5 py-1 px-3"
            >
              <motion.span
                className="text-xl"
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {tab.icon}
              </motion.span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="h-0.5 w-4 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
