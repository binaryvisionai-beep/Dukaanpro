import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  todaySales: number;
  pendingDues: number;
  lowStock: number;
  recentBills: any[];
};

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    pendingDues: 0,
    lowStock: 0,
    recentBills: [],
  });

  async function load() {
    const today = new Date().toISOString().split("T")[0];

    const { data: bills } = await supabase
      .from("bills")
      .select("*")
      .gte("created_at", today);

    const { data: products } = await supabase
      .from("products")
      .select("*");

    const todaySales =
      bills?.reduce((s, b) => s + Number(b.total), 0) || 0;

    const pendingDues =
      bills?.filter((b) => b.status === "pending")
        .reduce((s, b) => s + Number(b.total), 0) || 0;

    const lowStock =
      products?.filter((p) => p.stock <= p.min_stock).length || 0;

    setStats({
      todaySales,
      pendingDues,
      lowStock,
      recentBills: bills?.slice(0, 5) || [],
    });
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel("dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bills" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
}