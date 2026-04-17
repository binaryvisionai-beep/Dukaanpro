import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../stores/useStore";

const LANGUAGES: { code: "en" | "hi" | "mr" | "gu" | "ta" | "te"; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

const translations: Record<string, Record<string, string>> = {
  shopProfile: { en: "Shop Profile", hi: "दुकान प्रोफ़ाइल", mr: "दुकान प्रोफाइल", gu: "દુકાન પ્રોફાઇલ", ta: "கடை சுயவிவரம்", te: "దుకాణ ప్రొఫైల్" },
  settings: { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्ज", gu: "સેટિંગ્સ", ta: "அமைப்புகள்", te: "సెట్టింగ్‌లు" },
  language: { en: "Language", hi: "भाषा", mr: "भाषा", gu: "ભાષા", ta: "மொழி", te: "భాష" },
  darkMode: { en: "Dark Mode", hi: "डार्क मोड", mr: "डार्क मोड", gu: "ડાર્ક મોડ", ta: "இருண்ட பயன்முறை", te: "డార్క్ మోడ్" },
  currency: { en: "Currency", hi: "मुद्रा", mr: "चलन", gu: "ચલણ", ta: "நாணயம்", te: "కరెన్సీ" },
  analytics: { en: "View Analytics", hi: "एनालिटिक्स देखें", mr: "विश्लेषण पहा", gu: "વિશ્લેષણ જુઓ", ta: "பகுப்பாய்வு பார்க்க", te: "విశ్లేషణ చూడండి" },
};

function t(key: string, lang: string): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}

export function ProfileScreen() {
  const { shop, updateShop, language, setLanguage, darkMode, toggleDarkMode } = useStore();
  const [showAnalytics, setShowAnalytics] = useState(false);

  if (showAnalytics) {
    return <AnalyticsView language={language} onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="pb-24 px-4 pt-2 space-y-4">
      {/* Shop Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">
            {shop.logo}
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading">{shop.name}</h2>
            <p className="text-xs text-muted-foreground">{shop.owner}</p>
            <p className="text-[10px] text-muted-foreground">{shop.address}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="text-[10px] bg-card/80 px-2 py-1 rounded-lg text-muted-foreground">
            📞 {shop.phone}
          </span>
          <span className="text-[10px] bg-card/80 px-2 py-1 rounded-lg text-muted-foreground">
            GST: {shop.gstNumber}
          </span>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold font-heading px-1">{t("settings", language)}</h3>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">{darkMode ? "🌙" : "☀️"}</span>
            <span className="text-sm font-medium">{t("darkMode", language)}</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              darkMode ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.div
              animate={{ x: darkMode ? 22 : 2 }}
              className="absolute top-1 h-5 w-5 rounded-full bg-card shadow"
            />
          </button>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium">{t("currency", language)}</span>
          </div>
          <span className="text-sm font-mono-financial font-bold text-muted-foreground">₹ INR</span>
        </div>

        {/* Language */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🌐</span>
            <span className="text-sm font-medium">{t("language", language)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  language === lang.code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <span className="block font-bold">{lang.native}</span>
                <span className="block text-[10px] opacity-70">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Button */}
        <button
          onClick={() => setShowAnalytics(true)}
          className="w-full flex items-center justify-between rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium">{t("analytics", language)}</span>
          </div>
          <span className="text-muted-foreground">→</span>
        </button>

        {/* Logo Upload Mockup */}
        <button className="w-full flex items-center justify-between rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📷</span>
            <span className="text-sm font-medium">Upload Shop Logo</span>
          </div>
          <span className="text-xs text-primary font-semibold">Change</span>
        </button>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-muted-foreground">DukaanPro v1.0.0</p>
        <p className="text-[10px] text-muted-foreground">Made with ❤️ for Indian Shopkeepers</p>
      </div>
    </div>
  );
}

// Analytics sub-view
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

function AnalyticsView({ language, onBack }: { language: string; onBack: () => void }) {
  const { dailySales, products, bills } = useStore();

  const totalRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = dailySales.reduce((s, d) => s + d.profit, 0);
  const totalInvestment = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
  const pendingDues = bills.filter((b) => b.status === "pending").reduce((s, b) => s + b.total, 0);

  const topProducts = [...products]
    .sort((a, b) => b.salesVelocity - a.salesVelocity)
    .slice(0, 5)
    .map((p) => ({ name: p.name.split(" ")[0], sales: p.salesVelocity * p.sellingPrice }));

  const categoryData = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.stock * p.sellingPrice;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["var(--color-primary)", "var(--color-success)", "var(--color-chart-3)", "var(--color-warning)", "var(--color-destructive)", "var(--color-chart-4)"];

  const slowMoving = products.filter((p) => p.salesVelocity < 5);

  return (
    <div className="pb-24 px-4 pt-2 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h1 className="text-xl font-bold font-heading">Analytics & AI Insights</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Investment", value: totalInvestment, color: "bg-secondary" },
          { label: "Revenue", value: totalRevenue, color: "bg-success/10" },
          { label: "Profit", value: totalProfit, color: "bg-primary/10" },
          { label: "Pending", value: pendingDues, color: "bg-destructive/10" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
            <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            <p className="text-lg font-bold font-mono-financial">₹{s.value.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {/* Revenue vs Profit Chart */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-bold font-heading mb-3">Revenue vs Profit</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" width={35} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
            <Line type="monotone" dataKey="profit" stroke="var(--color-success)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-bold font-heading mb-3">Top Selling Products</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={topProducts}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" width={30} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Split */}
      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-bold font-heading mb-3">Category Split</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name }) => name}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AI Suggestions */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <h3 className="text-sm font-bold font-heading">AI Suggestions</h3>
        </div>

        {slowMoving.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-destructive mb-1">🐢 Slow-Moving Stock</p>
            {slowMoving.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1">
                <span className="text-xs">{p.image} {p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.salesVelocity}/week</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-success mb-1">📈 Recommended Increase</p>
          {products.filter((p) => p.salesVelocity > 15).slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1">
              <span className="text-xs">{p.image} {p.name}</span>
              <span className="text-[10px] font-bold text-success">+{Math.ceil(p.salesVelocity * 1.5)} units</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
