import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { ScrollView, Text, View, Pressable, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useStore } from '@/src/store';
import { formatCurrency, getTodayLabel } from '@/src/utils/formatters';

// ─── Design Tokens ────────────────────────────────────────────────
const C = {
  yellow:     '#F8CB2E',
  yellowDeep: '#E6B800',
  dark:       '#1A1A1A',
  white:      '#FFFFFF',
  surfLight:  '#F5F5F0',
  textPri:    '#1C1C1E',
  textSec:    '#6E6E73',
  success:    '#34C759',
  danger:     '#FF3B30',
  warning:    '#FF9500',
  border:     '#E5E5EA',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Animated Bar ─────────────────────────────────────────────────
function AnimatedBar({ pct, delay }: { pct: number; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 100], [2, 88]),
  }));
  return (
    <Animated.View
      style={[
        {
          width: '100%',
          backgroundColor: C.yellow,
          borderRadius: 5,
        },
        style,
      ]}
    />
  );
}

// ─── Animated Count-Up ────────────────────────────────────────────
function CountUpText({
  value,
  delay = 0,
  textStyle,
}: {
  value: number;
  delay?: number;
  textStyle?: any;
}) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const steps = 45;
      const stepVal = value / steps;
      let cur = 0;
      const iv = setInterval(() => {
        cur += stepVal;
        if (cur >= value) {
          setDisplayed(value);
          clearInterval(iv);
        } else {
          setDisplayed(Math.floor(cur));
        }
      }, 16);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <Text style={textStyle}>
      ₹{displayed.toLocaleString('en-IN')}
    </Text>
  );
}

// ─── Fast-Moving Product Card ──────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const isOut = product.stock === 0;
  const isLow = !isOut && product.stock <= (product.lowStockThreshold ?? 10);
  const badgeColor = isOut ? C.danger : isLow ? C.warning : C.success;
  const badgeLabel = isOut
    ? 'OUT OF STOCK'
    : isLow
    ? 'LOW STOCK'
    : `${product.stock} IN STOCK`;

  return (
    <Pressable
      style={{
        width: 88,
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 10,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: C.surfLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 7,
        }}
      >
        <MaterialCommunityIcons name="package-variant-closed" size={22} color={C.textPri} />
      </View>
      <Text
        style={{ fontSize: 11, fontWeight: '700', color: C.textPri, textAlign: 'center', lineHeight: 14 }}
        numberOfLines={2}
      >
        {product.name}
      </Text>
      <View
        style={{
          marginTop: 7,
          backgroundColor: badgeColor + '22',
          borderRadius: 6,
          paddingHorizontal: 5,
          paddingVertical: 3,
        }}
      >
        <Text style={{ fontSize: 8, fontWeight: '800', color: badgeColor, textAlign: 'center' }}>
          {badgeLabel}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────
export function DashboardScreen() {
  const { shop, bills, dailySales, products } = useStore();
  const [fabOpen, setFabOpen] = useState(false);

  const todaySales  = bills.reduce((sum, b) => sum + b.total, 0);
  const todayProfit = bills.reduce((sum, b) => sum + (b.total - b.subtotal * 0.75), 0);
  const pendingDues = bills
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + b.total, 0);

  const maxRevenue  = Math.max(...dailySales.map((d) => d.revenue), 1);
  const fastMoving  = products.slice(0, 8);
  const recentBills = bills.slice(0, 5);

  const timeLabels = ['09:45 AM', '09:12 AM', 'Yesterday', '2 days ago', '3 days ago'];

  return (
    <View style={{ flex: 1, backgroundColor: C.surfLight }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Top App Bar ─────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(350)}
          style={{
            backgroundColor: C.white,
            paddingHorizontal: 20,
            paddingTop: 56,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: C.yellow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="store" size={20} color={C.dark} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPri, letterSpacing: 1.2 }}>
              DUKAANPRO
            </Text>
          </View>
          <Pressable
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.surfLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={C.textPri} />
          </Pressable>
        </Animated.View>

        <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 16 }}>

          {/* ── Greeting ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            <Text style={{ fontSize: 21, fontWeight: '700', color: C.textPri, lineHeight: 28 }}>
              {'Good Morning, ' + shop.name + ' 👋'}
            </Text>
            <Text style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>{getTodayLabel()}</Text>
          </Animated.View>

          {/* ── Hero Sales Card ────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(160).duration(350)}>
            <View
              style={{
                backgroundColor: C.yellow,
                borderRadius: 20,
                padding: 22,
                shadowColor: C.yellowDeep,
                shadowOpacity: 0.45,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#00000066',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                TODAY'S SALES
              </Text>
              <CountUpText
                value={todaySales}
                delay={350}
                textStyle={{ fontSize: 40, fontWeight: '800', color: C.dark, letterSpacing: -1 }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 10,
                  backgroundColor: '#00000010',
                  alignSelf: 'flex-start',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <MaterialCommunityIcons name="trending-up" size={13} color={C.dark} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark }}>
                  12% from yesterday
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Profit + Dues Row ──────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.delay(240).duration(350)}
            style={{ flexDirection: 'row', gap: 12 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: C.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: C.border,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                PROFIT
              </Text>
              <CountUpText
                value={todayProfit}
                delay={420}
                textStyle={{ fontSize: 22, fontWeight: '800', color: C.success, marginTop: 6 }}
              />
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: C.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: C.border,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                DUES
              </Text>
              <CountUpText
                value={pendingDues}
                delay={460}
                textStyle={{ fontSize: 22, fontWeight: '800', color: C.danger, marginTop: 6 }}
              />
            </View>
          </Animated.View>

          {/* ── Weekly Revenue Chart ────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.delay(320).duration(350)}
            style={{
              backgroundColor: C.white,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: C.border,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPri }}>Weekly Revenue</Text>
              <Pressable>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={C.textSec} />
              </Pressable>
            </View>

            {/* Chart bars */}
            <View
              style={{
                flexDirection: 'row',
                height: 90,
                alignItems: 'flex-end',
                gap: 6,
              }}
            >
              {(dailySales.length > 0 ? dailySales : DAY_LABELS.map((d) => ({ day: d, revenue: 0 }))).map(
                (point, i) => {
                  const pct =
                    dailySales.length > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                  return (
                    <View
                      key={i}
                      style={{ flex: 1, alignItems: 'center', height: 90, justifyContent: 'flex-end' }}
                    >
                      <AnimatedBar pct={pct} delay={520 + i * 55} />
                    </View>
                  );
                }
              )}
            </View>

            {/* Day labels */}
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
              {DAY_LABELS.map((d, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: C.textSec, fontWeight: '500' }}>{d}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* ── Fast-Moving Products ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(400).duration(350)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPri }}>Fast-Moving</Text>
              <Pressable>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.yellow }}>VIEW ALL</Text>
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={fastMoving}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <ProductCard product={item} />}
              ListEmptyComponent={
                <Text style={{ color: C.textSec, fontSize: 13, paddingVertical: 10 }}>
                  No products yet
                </Text>
              }
            />
          </Animated.View>

          {/* ── Recent Transactions ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(480).duration(350)}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPri, marginBottom: 12 }}>
              Recent Transactions
            </Text>

            <View
              style={{
                backgroundColor: C.white,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: C.border,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              {recentBills.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <MaterialCommunityIcons name="receipt-text-outline" size={32} color={C.textSec} />
                  <Text style={{ color: C.textSec, fontSize: 13, marginTop: 8 }}>
                    No transactions yet
                  </Text>
                </View>
              ) : (
                recentBills.map((b, i) => {
                  const isPaid = b.status === 'paid';
                  const isLast = i === recentBills.length - 1;
                  return (
                    <Pressable
                      key={b.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: C.border,
                      }}
                    >
                      {/* Avatar */}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: C.surfLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="account-circle-outline"
                          size={22}
                          color={C.textSec}
                        />
                      </View>

                      {/* Name + time */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPri }}>
                          {b.customerName || 'Walk-in'}
                        </Text>
                        <Text style={{ fontSize: 11, color: C.textSec, marginTop: 1 }}>
                          {timeLabels[i] ?? ''}
                        </Text>
                      </View>

                      {/* Amount + badge */}
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPri }}>
                          {formatCurrency(b.total)}
                        </Text>
                        <View
                          style={{
                            marginTop: 4,
                            backgroundColor: isPaid ? C.success + '20' : C.warning + '20',
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '800',
                              color: isPaid ? C.success : C.warning,
                            }}
                          >
                            {isPaid ? 'PAID' : 'PENDING'}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          bottom: 92,
          right: 20,
          alignItems: 'flex-end',
          gap: 10,
        }}
        pointerEvents="box-none"
      >
        {/* FAB Options */}
        {fabOpen && (
          <>
            <Animated.View entering={FadeInDown.delay(40).duration(180)}>
              <Pressable
                onPress={() => setFabOpen(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: C.white,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  shadowColor: '#000',
                  shadowOpacity: 0.14,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 14,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: C.yellow + '33',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="receipt-text-outline" size={16} color={C.dark} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPri }}>Create Bill</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(0).duration(140)}>
              <Pressable
                onPress={() => setFabOpen(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: C.white,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  shadowColor: '#000',
                  shadowOpacity: 0.14,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 14,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: C.yellow + '33',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="package-variant-plus" size={16} color={C.dark} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPri }}>Add Product</Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {/* Main FAB button */}
        <Pressable
          onPress={() => setFabOpen((v) => !v)}
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: C.yellow,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.yellowDeep,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 14,
            elevation: 10,
          }}
        >
          <MaterialCommunityIcons name={fabOpen ? 'close' : 'plus'} size={28} color={C.dark} />
        </Pressable>
      </View>
    </View>
  );
}