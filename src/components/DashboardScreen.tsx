import { View, Text, ScrollView } from "react-native";
import type { ComponentType } from "react";
import { useDashboard } from "../hooks/useDashboard";

const StyledScrollView = ScrollView as unknown as ComponentType<any>;
const StyledView = View as unknown as ComponentType<any>;
const StyledText = Text as unknown as ComponentType<any>;

export function DashboardScreen() {
  const { todaySales, pendingDues, lowStock, recentBills } = useDashboard();

  return (
    <StyledScrollView className="flex-1 bg-background px-4 pt-4">
      {/* Header */}
      <StyledView className="mb-4">
        <StyledText className="text-muted-foreground text-sm">Good Morning 👋</StyledText>
        <StyledText className="text-2xl font-heading font-bold">DukaanPro Store</StyledText>
      </StyledView>

      {/* Stats */}
      <StyledView className="flex-row justify-between gap-2 mb-4">
        <StatCard label="Today's Sales" value={todaySales} />
        <StatCard label="Pending Dues" value={pendingDues} />
        <StatCard label="Low Stock" value={lowStock} prefix="" />
      </StyledView>

      {/* Recent Bills */}
      <StyledText className="text-sm font-heading font-semibold mb-2">
        Recent Transactions
      </StyledText>

      {recentBills.map((bill: any) => (
        <StyledView
          key={bill.id}
          className="bg-card border border-border rounded-xl p-3 mb-2 flex-row justify-between"
        >
          <StyledView>
            <StyledText className="text-xs font-semibold">
              {bill.customer_name || "Walk-in"}
            </StyledText>
            <StyledText className="text-[10px] text-muted-foreground">
              {bill.payment_mode}
            </StyledText>
          </StyledView>
          <StyledText className="font-mono-financial font-bold">
            ₹{Number(bill.total).toFixed(0)}
          </StyledText>
        </StyledView>
      ))}
    </StyledScrollView>
  );
}

function StatCard({
  label,
  value,
  prefix = "₹",
}: {
  label: string;
  value: number;
  prefix?: string;
}) {
  return (
    <StyledView className="flex-1 bg-card border border-border rounded-xl p-3">
      <StyledText className="text-[10px] text-muted-foreground">{label}</StyledText>
      <StyledText className="text-lg font-bold font-mono-financial">
        {prefix}
        {value}
      </StyledText>
    </StyledView>
  );
}