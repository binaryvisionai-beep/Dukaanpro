import { useStore } from '@/src/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_W = SCREEN_WIDTH - 64;

const C = {
  yellow: '#F8CB2E',
  deepYellow: '#E6B800',
  dark: '#1A1A1A',
  white: '#FFFFFF',
  light: '#F5F5F0',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',
  border: '#E5E5EA',
};

// ─── Count-Up Hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let current = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(current));
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return val;
}

function fmtAmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, bg, textColor, sub, onPress }: any) {
  const counted = useCountUp(value);
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale }], width: '48%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ backgroundColor: bg, borderRadius: 18, padding: 16, minHeight: 108 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <MaterialCommunityIcons name={icon} size={13} color={textColor} opacity={0.7} />
          <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.2 }}>{label}</Text>
        </View>
        <Text style={{ fontWeight: '900', fontSize: 21, color: textColor, letterSpacing: -0.5 }}>{fmtAmt(counted)}</Text>
        {sub ? <Text style={{ fontSize: 11, color: textColor, opacity: 0.65, marginTop: 5 }}>{sub}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

// ─── Pure-View Line Chart ─────────────────────────────────────────────────────
function LineChart({ data }: { data: { day: string; revenue: number; profit: number }[] }) {
  const H = 130;
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.profit)), 1);

  const getPoints = (key: 'revenue' | 'profit') =>
    data.map((d, i) => ({
      x: (i / (data.length - 1)) * (CHART_W - 8),
      y: H - 28 - (d[key] / maxVal) * (H - 50),
    }));

  const renderSegments = (points: { x: number; y: number }[], color: string, dashed?: boolean) =>
    points.slice(0, -1).map((p, i) => {
      const next = points[i + 1];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: len,
            height: dashed ? 1.5 : 2.5,
            backgroundColor: color,
            opacity: dashed ? 0.65 : 1,
            transform: [{ rotate: `${angle}deg` }],
            // @ts-ignore
            transformOrigin: 'left center',
          }}
        />
      );
    });

  const revPts = getPoints('revenue');
  const profPts = getPoints('profit');

  return (
    <View>
      <View style={{ height: H, position: 'relative', overflow: 'hidden' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((r, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: H - 28 - r * (H - 50),
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: C.border,
            }}
          />
        ))}
        {renderSegments(revPts, C.deepYellow)}
        {renderSegments(profPts, C.green, true)}
        {/* Revenue dots */}
        {revPts.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x - 4,
              top: p.y - 4,
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: C.white,
              borderWidth: 2,
              borderColor: C.deepYellow,
            }}
          />
        ))}
        {/* Day labels */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
          {data.map(d => (
            <Text key={d.day} style={{ fontSize: 9, color: C.textSecondary, fontWeight: '600' }}>
              {d.day.slice(0, 3)}
            </Text>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: C.deepYellow }} />
          <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '600' }}>Revenue</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: C.green, opacity: 0.65 }} />
          <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '600' }}>Profit</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Animated Progress Bar (products) ────────────────────────────────────────
function ProductBar({ name, sales, max, color, delay }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration: 650, useNativeDriver: false }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(sales / max) * 100}%`] });
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.textPrimary }}>{name}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.textSecondary }}>{sales}</Text>
      </View>
      <View style={{ height: 10, borderRadius: 6, backgroundColor: C.border, overflow: 'hidden' }}>
        <Animated.View style={{ height: 10, borderRadius: 6, backgroundColor: color, width: w }} />
      </View>
    </View>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────
function SalesHeatmap({ data }: { data: number[][] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6am', '9am', '12p', '3pm', '6pm', '9pm'];
  const max = Math.max(...data.flat(), 1);
  const cellW = Math.floor((CHART_W - 34) / hours.length);
  return (
    <View>
      <View style={{ flexDirection: 'row', marginLeft: 32, marginBottom: 6 }}>
        {hours.map(h => (
          <Text key={h} style={{ width: cellW + 2, textAlign: 'center', fontSize: 9, color: C.textSecondary, fontWeight: '600' }}>{h}</Text>
        ))}
      </View>
      {data.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ width: 32, fontSize: 9, color: C.textSecondary, fontWeight: '600' }}>{days[ri]}</Text>
          {row.map((val, ci) => {
            const intensity = val / max;
            const alpha = Math.round((0.12 + intensity * 0.88) * 255).toString(16).padStart(2, '0');
            return (
              <View
                key={ci}
                style={{
                  width: cellW - 2,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: intensity === 0 ? C.border : `${C.yellow}${alpha}`,
                  marginHorizontal: 1,
                }}
              />
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 9, color: C.textSecondary }}>Less</Text>
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((v, i) => {
          const a = Math.round(v * 255).toString(16).padStart(2, '0');
          return <View key={i} style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: `${C.yellow}${a}` }} />;
        })}
        <Text style={{ fontSize: 9, color: C.textSecondary }}>More</Text>
      </View>
    </View>
  );
}

// ─── Fast Moving Row ──────────────────────────────────────────────────────────
function FastMovingRow({ item, onReorder }: any) {
  const ratio = item.sold / (item.stock + item.sold);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: ratio, duration: 900, useNativeDriver: false }).start();
  }, []);
  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const barColor = ratio > 0.8 ? C.red : C.green;
  return (
    <View style={{ borderRadius: 14, backgroundColor: C.light, padding: 14, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.yellow + '30', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="package-variant-closed" size={16} color={C.deepYellow} />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <MaterialCommunityIcons
                name={item.trend > 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={item.trend > 0 ? C.green : C.red}
              />
              <Text style={{ fontSize: 10, color: item.trend > 0 ? C.green : C.red, fontWeight: '700' }}>
                {Math.abs(item.trend)}% this week
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => onReorder(item)}
          style={{ backgroundColor: C.yellow, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: C.dark }}>Reorder</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
        <Text style={{ fontSize: 11, color: C.textSecondary }}>
          Sold: <Text style={{ fontWeight: '700', color: C.textPrimary }}>{item.sold}</Text>
        </Text>
        <Text style={{ fontSize: 11, color: C.textSecondary }}>
          Left: <Text style={{ fontWeight: '700', color: ratio > 0.8 ? C.red : C.textPrimary }}>{item.stock}</Text>
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 4, backgroundColor: C.border, overflow: 'hidden' }}>
        <Animated.View style={{ height: 6, borderRadius: 4, backgroundColor: barColor, width: barW }} />
      </View>
    </View>
  );
}

// ─── Pending Modal ────────────────────────────────────────────────────────────
const fallbackPending = [
  { id: '1', customerName: 'Ramesh Kumar', total: 4500, date: 'Today' },
  { id: '2', customerName: 'Sunita Devi', total: 3200, date: 'Yesterday' },
  { id: '3', customerName: 'Ajay Stores', total: 6800, date: '3 days ago' },
];

function PendingModal({ visible, onClose, bills }: any) {
  const pending = bills.filter((b: any) => b.status === 'pending');
  const data = pending.length ? pending : fallbackPending;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '70%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary }}>Pending Dues</Text>
            <Pressable
              onPress={onClose}
              style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="close" size={18} color={C.textSecondary} />
            </Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={(b: any) => b.id}
            renderItem={({ item }: any) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.red + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="account-outline" size={18} color={C.red} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>{item.customerName || 'Customer'}</Text>
                    <Text style={{ fontSize: 11, color: C.textSecondary }}>{item.date}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '900', color: C.red }}>{fmtAmt(item.total)}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ visible, onClose }: any) {
  const handle = (type: string) => {
    onClose();
    Alert.alert(`Export ${type}`, `Generating your ${type} report...`);
  };
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}
        onPress={onClose}
      >
        <View style={{ backgroundColor: C.white, borderRadius: 24, padding: 24, width: SCREEN_WIDTH - 56 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary, marginBottom: 16 }}>Export Report</Text>
          {[
            { type: 'PDF', icon: 'file-pdf-box', color: C.red, desc: 'Formatted report for sharing' },
            { type: 'CSV', icon: 'file-delimited-outline', color: C.green, desc: 'Raw data for spreadsheets' },
          ].map(e => (
            <Pressable
              key={e.type}
              onPress={() => handle(e.type)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.light, borderRadius: 16, padding: 16, marginBottom: 10 }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: e.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={e.icon as any} size={22} color={e.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>Export as {e.type}</Text>
                <Text style={{ fontSize: 12, color: C.textSecondary }}>{e.desc}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={C.textSecondary} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function AnalyticsScreen() {
  const { dailySales = [], products = [], bills = [] } = useStore();
  const [tab, setTab] = useState<'Monthly' | 'Yearly' | 'Custom'>('Monthly');
  const [pendingModal, setPendingModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);

  const investment = products.reduce((s, p) => s + p.costPrice * p.stock, 0) || 85000;
  const revenue = bills.reduce((s, b) => s + b.total, 0) || 120000;
  const grossProfit = bills.reduce((s, b) => s + (b.total - b.subtotal * 0.75), 0) || 21600;
  const pending = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.total, 0) || 14500;
  const pendingCount = bills.filter(b => b.status === 'pending').length || 8;
  const margin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : '18.0';

  const chartData = dailySales.length > 0
    ? dailySales.map(d => ({ day: d.day, revenue: d.revenue, profit: d.profit ?? d.revenue * 0.2 }))
    : [
        { day: 'Monday', revenue: 8200, profit: 1640 },
        { day: 'Tuesday', revenue: 6500, profit: 1100 },
        { day: 'Wednesday', revenue: 9800, profit: 2100 },
        { day: 'Thursday', revenue: 7200, profit: 1440 },
        { day: 'Friday', revenue: 11000, profit: 2500 },
        { day: 'Saturday', revenue: 13500, profit: 3200 },
        { day: 'Sunday', revenue: 10200, profit: 2000 },
      ];

  const topProducts = [
    { name: 'Milk 1L', sales: 950, color: C.yellow },
    { name: 'Cooking Oil', sales: 820, color: C.deepYellow },
    { name: 'Basmati Rice', sales: 700, color: C.orange },
    { name: 'Wheat Flour', sales: 650, color: '#FFD700' },
    { name: 'Sugar 1kg', sales: 580, color: C.yellow },
    { name: 'Maggi', sales: 520, color: C.deepYellow },
    { name: 'Parle-G', sales: 480, color: C.orange },
    { name: 'Lays Classic', sales: 420, color: '#FFD700' },
  ];
  const maxSale = Math.max(...topProducts.map(p => p.sales));

  const categoryData = [
    { name: 'Grocery', pct: 35, color: C.orange, amount: 74400 },
    { name: 'Dairy', pct: 28, color: C.yellow, amount: 28800 },
    { name: 'Snacks', pct: 17, color: C.green, amount: 16800 },
    { name: 'Beverages', pct: 12, color: '#2196F3', amount: 11200 },
    { name: 'Household', pct: 8, color: C.red, amount: 7400 },
  ];

  const heatmap = [
    [10, 45, 80, 60, 90, 40],
    [5, 30, 70, 55, 85, 35],
    [15, 50, 95, 75, 100, 55],
    [8, 35, 65, 50, 78, 30],
    [20, 60, 88, 70, 95, 65],
    [35, 80, 110, 95, 120, 85],
    [25, 65, 90, 80, 105, 70],
  ];

  const fastMoving = [
    { name: 'Milk 1L', sold: 950, stock: 50, trend: 18 },
    { name: 'Cooking Oil', sold: 820, stock: 30, trend: 12 },
    { name: 'Basmati Rice', sold: 700, stock: 80, trend: -5 },
    { name: 'Maggi Noodles', sold: 520, stock: 15, trend: 24 },
  ];

  const insights = [
    {
      icon: 'alert-circle-outline' as const,
      color: C.red,
      title: 'REORDER ALERT',
      desc: '"Milk" and "Cooking Oil" are fast-moving items. Restock recommended by Friday to avoid stock-out.',
    },
    {
      icon: 'chart-line' as const,
      color: C.green,
      title: 'PROMO OPPORTUNITY',
      desc: 'High demand detected for "Basmati Rice". Consider a bundle deal with "Dals" to increase AOV.',
    },
    {
      icon: 'clock-slow' as const,
      color: C.orange,
      title: 'SLOW-MOVING STOCK',
      desc: '"Amul Butter 500g" moving slowly at 4 units/week. Consider running a promotion.',
    },
  ];

  const Card = ({ children, style }: any) => (
    <View style={[{ backgroundColor: C.white, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }, style]}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.light }}>
      {/* Sticky Header */}
      <View style={{ backgroundColor: C.white, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 }}>Analytics & AI Insights</Text>
          </View>
          <Pressable
            onPress={() => setExportModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.yellow, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12 }}
          >
            <MaterialCommunityIcons name="export-variant" size={14} color={C.dark} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.dark }}>Export</Text>
          </Pressable>
        </View>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: C.light, borderRadius: 14, padding: 3 }}>
          {(['Monthly', 'Yearly', 'Custom'] as const).map(t => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 11, backgroundColor: tab === t ? C.dark : 'transparent', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: tab === t ? C.yellow : C.textSecondary }}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 14 }}
      >
        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <KpiCard label="Total Investment" value={investment} icon="cash-multiple" bg="#F5F5F5" textColor={C.textPrimary} sub="Current stock value" />
          <KpiCard label="Total Revenue" value={revenue} icon="trending-up" bg="#E8F5E9" textColor="#2E7D32" sub="+12.5% vs last month" />
          <KpiCard label="Gross Profit" value={grossProfit} icon="percent-outline" bg="#FFF8E1" textColor="#B8860B" sub={`${margin}% margin`} />
          <KpiCard
            label="Pending Dues"
            value={pending}
            icon="clock-alert-outline"
            bg="#FFEBEE"
            textColor={C.red}
            sub={`${pendingCount} invoices overdue`}
            onPress={() => setPendingModal(true)}
          />
        </View>

        {/* Revenue vs Profit */}
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 16 }}>Revenue vs Profit</Text>
          <LineChart data={chartData} />
        </Card>

        {/* Category Split */}
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 16 }}>Category Split</Text>
          {/* Donut-like ring using nested Views */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer ring made of colored segments using border */}
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: C.border }} />
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: categoryData[0].color, opacity: 0.9 }} />
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, overflow: 'hidden' }}>
                <View style={{ width: 50, height: 100, backgroundColor: categoryData[1].color, opacity: 0.85 }} />
              </View>
              <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.textPrimary }}>62%</Text>
                <Text style={{ fontSize: 9, color: C.textSecondary, fontWeight: '600' }}>Grocery</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 7 }}>
              {categoryData.map(d => (
                <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 12, color: C.textPrimary, fontWeight: '600' }}>{d.name}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: d.color }}>₹{(d.amount / 1000).toFixed(1)}k</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Progress bars */}
          <View style={{ gap: 10 }}>
            {categoryData.map(d => (
              <View key={d.name}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.textPrimary }}>{d.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: d.color }}>{d.pct}%</Text>
                </View>
                <View style={{ height: 7, borderRadius: 6, backgroundColor: C.border, overflow: 'hidden' }}>
                  <View style={{ width: `${d.pct}%`, height: 7, borderRadius: 6, backgroundColor: d.color }} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 16 }}>Top Selling Products</Text>
          {topProducts.map((p, i) => (
            <ProductBar key={p.name} name={p.name} sales={p.sales} max={maxSale} color={p.color} delay={i * 70} />
          ))}
        </Card>

        {/* Sales Heatmap */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>Daily Sales Heatmap</Text>
            <View style={{ backgroundColor: C.yellow + '30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.deepYellow }}>7 Days</Text>
            </View>
          </View>
          <SalesHeatmap data={heatmap} />
        </Card>

        {/* Fast Moving */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>Fast-Moving Stock</Text>
            <MaterialCommunityIcons name="fire" size={18} color={C.orange} />
          </View>
          {fastMoving.map(item => (
            <FastMovingRow
              key={item.name}
              item={item}
              onReorder={(i: any) =>
                Alert.alert('Reorder', `Pre-fill Add Stock for "${i.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Add Stock' },
                ])
              }
            />
          ))}
        </Card>

        {/* AI Insights */}
        <View style={{ backgroundColor: C.dark, borderRadius: 20, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="creation" size={18} color={C.dark} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.white }}>AI Insights</Text>
          </View>
          {insights.map((ins, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: i < insights.length - 1 ? 16 : 0,
                paddingBottom: i < insights.length - 1 ? 16 : 0,
                borderBottomWidth: i < insights.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: ins.color + '22', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MaterialCommunityIcons name={ins.icon} size={18} color={ins.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: ins.color, letterSpacing: 0.6, marginBottom: 4 }}>{ins.title}</Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 19 }}>{ins.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <PendingModal visible={pendingModal} onClose={() => setPendingModal(false)} bills={bills} />
      <ExportModal visible={exportModal} onClose={() => setExportModal(false)} />
    </View>
  );
}