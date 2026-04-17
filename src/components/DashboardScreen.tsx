/// <reference types="nativewind/types" />
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useStore, Bill, Product } from "../store";

function AnimatedNumber({ value, prefix = "₹" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [value]);
  return (
    <Text className="font-mono-financial font-bold">
      {`${prefix}${display.toLocaleString("en-IN")}`}
    </Text>
  );
}

export function DashboardScreen() {
  const { shop, dailySales, products, bills } = useStore();

  const todaySales = bills
    .filter((b: Bill) => b.date.startsWith("2026-04-16"))
    .reduce((sum: number, b: Bill) => sum + b.total, 0);
  const todayProfit = todaySales * 0.22;
  const pendingDues = bills
    .filter((b: Bill) => b.status === "pending")
    .reduce((sum: number, b: Bill) => sum + b.total, 0);

  const lowStockProducts = products.filter((p: Product) => p.stock <= p.minStock);

  const restockSuggestions = products
    .filter((p: Product) => p.stock < p.salesVelocity * 2)
    .slice(0, 3);

  return (
    <ScrollView className="pb-24 px-4 pt-2 space-y-4">
      {/* Greeting */}
      <View className="flex items-center justify-between">
        <View>
          <Text className="text-muted-foreground text-sm">{"Good Morning 👋"}</Text>
          <Text className="text-xl font-bold font-heading">{shop.name}</Text>
        </View>
        <View className="text-right">
          <Text className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
          </Text>
          <Text className="text-2xl">{shop.logo}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="grid grid-cols-3 gap-2">
        {[
          { label: "Today's Sales", value: todaySales, color: "bg-primary/10 text-primary" },
          { label: "Est. Profit", value: todayProfit, color: "bg-success/10 text-success" },
          { label: "Pending Dues", value: pendingDues, color: "bg-destructive/10 text-destructive" },
        ].map((stat, i) => (
          <View
            key={stat.label}
            className={`rounded-xl p-3 ${stat.color}`}
          >
            <Text className="text-[10px] font-medium opacity-70">{stat.label}</Text>
            <View className="text-lg mt-1">
              <AnimatedNumber value={Math.round(stat.value)} />
            </View>
          </View>
        ))}
      </View>

      {/* Revenue Chart */}
      <View className="rounded-xl bg-card p-4 shadow-sm border border-border">
        <Text className="text-sm font-semibold font-heading mb-3">{"7-Day Revenue"}</Text>
        <View className="w-full h-[160px] items-center justify-center">
          <Text>{"Chart Placeholder"}</Text>
        </View>
      </View>

      {/* AI Smart Restock */}
      {restockSuggestions.length > 0 && (
        <View className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4 border border-primary/20">
          <View className="flex items-center gap-2 mb-2">
            <Text className="text-lg">{"🤖"}</Text>
            <Text className="text-sm font-bold font-heading">{"AI Smart Restock"}</Text>
          </View>
          <View className="space-y-2">
            {restockSuggestions.map((p: Product) => (
              <View key={p.id} className="flex items-center justify-between rounded-lg bg-card/60 p-2.5">
                <View className="flex items-center gap-2">
                  <Text className="text-xl">{p.image}</Text>
                  <View>
                    <Text className="text-xs font-semibold">{p.name}</Text>
                    <Text className="text-[10px] text-muted-foreground">
                      {`Stock: ${p.stock} · Sells ${p.salesVelocity}/week`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity className="rounded-lg bg-primary px-3 py-1.5">
                  <Text className="text-[10px] font-bold text-primary-foreground">
                    {`+${Math.ceil(p.salesVelocity * 2 - p.stock)} units`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <View className="rounded-xl bg-destructive/5 p-4 border border-destructive/20">
          <Text className="text-sm font-bold font-heading text-destructive mb-2">
            {`⚠️ Low Stock Alerts (${lowStockProducts.length})`}
          </Text>
          <ScrollView horizontal className="flex gap-2 overflow-x-auto scrollbar-hide">
            {lowStockProducts.map((p: Product) => (
              <View
                key={p.id}
                className="flex-shrink-0 rounded-lg bg-card p-2.5 border border-border min-w-[120px]"
              >
                <Text className="text-2xl">{p.image}</Text>
                <Text className="text-xs font-semibold mt-1">{p.name}</Text>
                <Text className="text-[10px] text-destructive font-mono-financial">
                  {`Only ${p.stock} left`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Transactions */}
      <View>
        <Text className="text-sm font-semibold font-heading mb-2">{"Recent Transactions"}</Text>
        <View className="space-y-2">
          {bills.slice(0, 4).map((bill: Bill, i: number) => (
            <View
              key={bill.id}
              className="flex items-center justify-between rounded-xl bg-card p-3 border border-border"
            >
              <View className="flex items-center gap-3">
                <View className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  bill.status === "paid" ? "bg-success/10" : "bg-warning/10"
                }`}>
                  <Text>{bill.paymentMode === "upi" ? "📱" : bill.paymentMode === "card" ? "💳" : "💵"}</Text>
                </View>
                <View>
                  <Text className="text-xs font-semibold">{bill.customerName}</Text>
                  <Text className="text-[10px] text-muted-foreground">
                    {`${bill.id} · ${bill.items.length} items`}
                  </Text>
                </View>
              </View>
              <View className="text-right">
                <Text className="text-sm font-mono-financial font-bold">
                  {`₹${bill.total.toFixed(0)}`}
                </Text>
                <Text className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  bill.status === "paid"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}>
                  {bill.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

