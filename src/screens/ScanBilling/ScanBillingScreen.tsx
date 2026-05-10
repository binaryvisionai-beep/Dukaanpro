import { useStore } from '@/src/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Reanimated, {
  Easing as REasing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Constants ───────────────────────────────────────────────────────────────
const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.88;
const FRAME_H = 160;

const COLORS = {
  primaryYellow:  '#F8CB2E',
  deepYellow:     '#E6B800',
  darkBg:         '#1A1A1A',
  surfaceWhite:   '#FFFFFF',
  surfaceLight:   '#F5F5F0',
  textPrimary:    '#1C1C1E',
  textSecondary:  '#6E6E73',
  successGreen:   '#34C759',
  dangerRed:      '#FF3B30',
  warningOrange:  '#FF9500',
  borderLight:    '#E5E5EA',
};

const CONFETTI_COLORS = [
  '#F8CB2E', '#34C759', '#FF3B30', '#FF9500', '#007AFF', '#E6B800', '#AF52DE',
];
const NUM_CONFETTI = 36;

const DEMO_PRODUCTS = [
  { id: 'D1', name: 'Amul Butter 500g',   sku: 'AB-003', barcode: '8901725133603', sellingPrice: 240, stock: 48,  icon: 'fridge-outline'    as const },
  { id: 'D2', name: 'Red Label Tea 250g', sku: 'RL-004', barcode: '8901725133604', sellingPrice: 220, stock: 30,  icon: 'coffee-outline'    as const },
  { id: 'D3', name: 'Parle-G Biscuit',   sku: 'PG-002', barcode: '8901725133605', sellingPrice:  80, stock: 120, icon: 'food-croissant'    as const },
  { id: 'D4', name: 'Tata Salt 1kg',     sku: 'TS-001', barcode: '8901725133606', sellingPrice:  22, stock: 75,  icon: 'shaker-outline'    as const },
  { id: 'D5', name: 'Surf Excel 1kg',    sku: 'SX-005', barcode: '8901725133607', sellingPrice: 180, stock: 22,  icon: 'washing-machine'   as const },
];

type ScanMode    = 'multi' | 'single';
type ScannedState = 'idle' | 'found' | 'not_found';
type PaymentMode = 'cash' | 'upi' | 'card';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(d: Date) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}

function padRow(left: string, right: string, total = 30) {
  const spaces = Math.max(1, total - left.length - right.length);
  return left + ' '.repeat(spaces) + right;
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: { productId: string; name: string; qty: number; total: number };
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const tx = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) tx.setValue(Math.max(gs.dx, -76));
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -48) {
          Animated.spring(tx, { toValue: -72, useNativeDriver: true }).start();
        } else {
          Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const unitPrice = item.qty > 0 ? item.total / item.qty : 0;

  return (
    <View style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden' }}>
      {/* Delete backdrop */}
      <View style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 72,
        backgroundColor: COLORS.dangerRed, alignItems: 'center', justifyContent: 'center',
      }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onRemove(); }}
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700', marginTop: 2 }}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        {...pan.panHandlers}
        style={{
          transform: [{ translateX: tx }],
          backgroundColor: COLORS.surfaceLight,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>₹{unitPrice.toFixed(0)}</Text>

        {/* Qty stepper */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 1,
          backgroundColor: '#fff', borderRadius: 9, padding: 2,
          borderWidth: 1, borderColor: COLORS.borderLight,
        }}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              item.qty === 1 ? onRemove() : onUpdateQty(item.qty - 1);
            }}
            style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 7 }}
          >
            <MaterialCommunityIcons
              name={item.qty === 1 ? 'trash-can-outline' : 'minus'}
              size={13}
              color={item.qty === 1 ? COLORS.dangerRed : COLORS.textPrimary}
            />
          </Pressable>
          <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, minWidth: 22, textAlign: 'center' }}>
            {item.qty}
          </Text>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); onUpdateQty(item.qty + 1); }}
            style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: COLORS.primaryYellow }}
          >
            <MaterialCommunityIcons name="plus" size={13} color={COLORS.darkBg} />
          </Pressable>
        </View>

        <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, minWidth: 48, textAlign: 'right' }}>
          ₹{item.total.toFixed(0)}
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function ScanBillingScreen() {
  const { cart: storeCart, addToCart, updateCartQty, removeFromCart, clearCart, products } = useStore() as any;

  // Scan state
  const [torchOn, setTorchOn]               = useState(false);
  const [scanMode, setScanMode]             = useState<ScanMode>('multi');
  const [scanState, setScanState]           = useState<ScannedState>('idle');
  const [scannedProduct, setScannedProduct] = useState<typeof DEMO_PRODUCTS[0] | null>(null);
  const [unknownBarcode, setUnknownBarcode] = useState('');
  const [manualInput, setManualInput]       = useState('');
  const [qty, setQty]                       = useState(1);
  const [addedToCart, setAddedToCart]       = useState(false);

  // Cart sheet state
  const [showCartSheet, setShowCartSheet]   = useState(false);
  const [customerName, setCustomerName]     = useState('');
  const [discount, setDiscount]             = useState('');
  const [gstEnabled, setGstEnabled]         = useState(true);
  const [paymentMode, setPaymentMode]       = useState<PaymentMode>('cash');

  // Receipt state
  const [showReceipt, setShowReceipt]       = useState(false);
  const [billNumber, setBillNumber]         = useState(1042);
  const [showConfetti, setShowConfetti]     = useState(false);
  const [billSnap, setBillSnap]             = useState<{
    items: { name: string; qty: number; total: number }[];
    subtotal: number;
    discountAmt: number;
    discountPct: string;
    gstAmt: number;
    gstEnabled: boolean;
    totalAmt: number;
    paymentMode: PaymentMode;
    customerName: string;
  } | null>(null);

  const scanIdx = useRef(0);

  // ── Reanimated: scan line ──────────────────────────────────────────────────
  const scanProgress = useSharedValue(0);
  useEffect(() => {
    scanProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: REasing.inOut(REasing.ease) }),
        withTiming(0, { duration: 2000, easing: REasing.inOut(REasing.ease) }),
      ),
      -1,
      false
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanProgress.value * (FRAME_H - 16) + 6 }],
  }));

  // ── Reanimated: cart bubble bounce ─────────────────────────────────────────
  const bubbleScale = useSharedValue(1);
  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ scale: bubbleScale.value }] }));

  const bounceBubble = useCallback(() => {
    bubbleScale.value = withSequence(
      withSpring(1.35, { damping: 3, stiffness: 320 }),
      withSpring(1,    { damping: 6, stiffness: 220 }),
    );
  }, []);

  // ── RN Animated: flash overlay ─────────────────────────────────────────────
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const triggerFlash = useCallback(() => {
    flashOpacity.setValue(0.9);
    Animated.timing(flashOpacity, { toValue: 0, duration: 380, useNativeDriver: true }).start();
  }, []);

  // ── RN Animated: product card spring ──────────────────────────────────────
  const cardSlide   = useRef(new Animated.Value(320)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const springCardIn = useCallback(() => {
    cardSlide.setValue(320);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardSlide,   { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 220,              useNativeDriver: true }),
    ]).start();
  }, []);

  // ── RN Animated: cart bottom-sheet slide ──────────────────────────────────
  const sheetY = useRef(new Animated.Value(SHEET_H)).current;

  const openSheet = useCallback(() => {
    setShowCartSheet(true);
    Animated.spring(sheetY, { toValue: 0, tension: 58, friction: 13, useNativeDriver: true }).start();
  }, []);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetY, {
      toValue: SHEET_H, duration: 300,
      easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start(() => setShowCartSheet(false));
  }, []);

  const sheetPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, gs) => gs.dy > 5,
      onPanResponderMove:   (_, gs) => { if (gs.dy > 0) sheetY.setValue(gs.dy); },
      onPanResponderRelease:(_, gs) => {
        if (gs.dy > 120 || gs.vy > 0.6) {
          Animated.timing(sheetY, {
            toValue: SHEET_H, duration: 280,
            easing: Easing.out(Easing.ease), useNativeDriver: true,
          }).start(() => setShowCartSheet(false));
        } else {
          Animated.spring(sheetY, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // ── Confetti ───────────────────────────────────────────────────────────────
  const confettiParticles = useRef(
    Array.from({ length: NUM_CONFETTI }, () => ({
      x:       new Animated.Value(0),
      y:       new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate:  new Animated.Value(0),
      size:    6 + Math.random() * 6,
      color:   CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      isCircle: Math.random() > 0.5,
    }))
  ).current;

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    const anims = confettiParticles.map((p) => {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 220;
      p.x.setValue(0); p.y.setValue(0); p.opacity.setValue(1); p.rotate.setValue(0);
      return Animated.parallel([
        Animated.timing(p.x,       { toValue: Math.cos(angle) * radius,      duration: 1000, useNativeDriver: true }),
        Animated.timing(p.y,       { toValue: Math.sin(angle) * radius - 80, duration: 1000, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0,                              duration: 1000, useNativeDriver: true }),
        Animated.timing(p.rotate,  { toValue: Math.random() * 540,            duration: 1000, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(18, anims).start(() => setShowConfetti(false));
  }, []);

  // ── Calculations ───────────────────────────────────────────────────────────
  const cartCount    = (storeCart ?? []).reduce((s: number, i: any) => s + i.qty, 0);
  const subtotal     = (storeCart ?? []).reduce((s: number, i: any) => s + i.total, 0);
  const discountPct  = parseFloat(discount) || 0;
  const discountAmt  = subtotal * (discountPct / 100);
  const afterDisc    = subtotal - discountAmt;
  const gstAmt       = gstEnabled ? afterDisc * 0.05 : 0;
  const totalAmt     = afterDisc + gstAmt;

  // ── Scan handlers ──────────────────────────────────────────────────────────
  const handleSimulateScan = useCallback(() => {
    Keyboard.dismiss();
    triggerFlash();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cycle = [...DEMO_PRODUCTS, null];
    const item  = cycle[scanIdx.current % cycle.length];
    scanIdx.current++;
    if (!item) {
      setScannedProduct(null);
      setUnknownBarcode('9999999999999');
      setScanState('not_found');
    } else {
      setScannedProduct(item);
      setUnknownBarcode('');
      setQty(1);
      setAddedToCart(false);
      setScanState('found');
    }
    springCardIn();
  }, [triggerFlash, springCardIn]);

  const handleManualSearch = useCallback(() => {
    if (!manualInput.trim()) return;
    Keyboard.dismiss();
    const val   = manualInput.trim().toLowerCase();
    const found = DEMO_PRODUCTS.find(
      (p) => p.sku.toLowerCase() === val || p.name.toLowerCase().includes(val)
    );
    triggerFlash();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (found) {
      setScannedProduct(found); setUnknownBarcode('');
      setQty(1); setAddedToCart(false); setScanState('found');
    } else {
      setScannedProduct(null); setUnknownBarcode(manualInput.trim()); setScanState('not_found');
    }
    setManualInput('');
    springCardIn();
  }, [manualInput, triggerFlash, springCardIn]);

  const handleAddToBill = useCallback(() => {
    if (!scannedProduct) return;
    const match = products?.find((p: any) => p.sku === scannedProduct.sku);
    if (match) for (let i = 0; i < qty; i++) addToCart(match);
    setAddedToCart(true);
    bounceBubble();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (scanMode === 'single') {
      setTimeout(() => { setScanState('idle'); setScannedProduct(null); }, 900);
    }
  }, [scannedProduct, qty, products, addToCart, scanMode, bounceBubble]);

  const handleScanNext = useCallback(() => {
    setScanState('idle'); setScannedProduct(null); setAddedToCart(false); setQty(1);
  }, []);

  // ── Bill generation ────────────────────────────────────────────────────────
  const handleGenerateBill = useCallback(() => {
    // Snapshot current bill state before clearing
    setBillSnap({
      items:        storeCart.map((i: any) => ({ name: i.name, qty: i.qty, total: i.total })),
      subtotal,
      discountAmt,
      discountPct:  discount,
      gstAmt,
      gstEnabled,
      totalAmt,
      paymentMode,
      customerName,
    });
    closeSheet();
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerConfetti();
      setBillNumber((n) => n + 1);
      setShowReceipt(true);
    }, 350);
  }, [closeSheet, triggerConfetti, storeCart, subtotal, discountAmt, discount, gstAmt, gstEnabled, totalAmt, paymentMode, customerName]);

  const handleNewBill = useCallback(() => {
    setShowReceipt(false);
    setScanState('idle'); setScannedProduct(null); setAddedToCart(false); setQty(1);
    setCustomerName(''); setDiscount(''); setGstEnabled(true); setPaymentMode('cash');
    setBillSnap(null);
    if (typeof clearCart === 'function') clearCart();
    else if (typeof removeFromCart === 'function') {
      storeCart?.forEach((i: any) => removeFromCart(i.productId));
    } else {
      storeCart?.forEach((i: any) => updateCartQty?.(i.productId, 0));
    }
  }, [clearCart, removeFromCart, storeCart, updateCartQty]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    if (typeof removeFromCart === 'function') removeFromCart(productId);
    else updateCartQty?.(productId, 0);
  }, [removeFromCart, updateCartQty]);

  // ── WhatsApp share ─────────────────────────────────────────────────────────
  const handleWhatsAppShare = useCallback(async () => {
    const snap = billSnap;
    if (!snap) return;
    const lines = snap.items.map((i) => `  ${i.name} x${i.qty} = Rs.${i.total.toFixed(0)}`).join('\n');
    const msg = [
      `*DUKAAN PRO — Bill #${billNumber}*`,
      `Sharma Kirana Store, Pune`,
      formatDate(new Date()),
      snap.customerName ? `Customer: ${snap.customerName}` : '',
      '',
      lines,
      '',
      `Subtotal:  Rs.${snap.subtotal.toFixed(0)}`,
      snap.discountAmt > 0 ? `Discount (${snap.discountPct}%): -Rs.${snap.discountAmt.toFixed(0)}` : '',
      snap.gstEnabled   ? `GST (5%): +Rs.${snap.gstAmt.toFixed(0)}` : '',
      `*TOTAL: Rs.${snap.totalAmt.toFixed(0)}*`,
      `Paid via: ${snap.paymentMode.toUpperCase()}`,
      '',
      `Thank you! Visit again.`,
    ].filter((l) => l !== null).join('\n');
    await Share.share({ message: msg });
  }, [billSnap, billNumber]);

  const today = formatDate(new Date());
  const snap  = billSnap;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>

      {/* ╔══════════════════════════════╗ */}
      {/* ║  CAMERA AREA (fills screen)  ║ */}
      {/* ╚══════════════════════════════╝ */}
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Simulated camera bg */}
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#0D0D0D' }} />

        {/* Subtle lens-grid overlay */}
        <View style={{ position: 'absolute', inset: 0, opacity: 0.025 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={{ flex: 1, borderBottomWidth: 1, borderColor: '#fff' }} />
          ))}
        </View>

        {/* Flash pulse */}
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', opacity: flashOpacity, zIndex: 20 }}
        />

        {/* Confetti burst */}
        {showConfetti && (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
          >
            {confettiParticles.map((p, i) => (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  width: p.size, height: p.size,
                  borderRadius: p.isCircle ? p.size / 2 : 2,
                  backgroundColor: p.color,
                  opacity: p.opacity,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { rotate: p.rotate.interpolate({ inputRange: [0, 540], outputRange: ['0deg', '540deg'] }) },
                  ],
                }}
              />
            ))}
          </View>
        )}

        {/* ── TOP BAR ── */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingHorizontal: 16, paddingTop: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: -0.6 }}>Smart Scan</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, fontWeight: '600' }}>
                {scanMode === 'multi' ? 'Multi-scan: ON — camera stays live' : 'Single scan mode'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {/* Torch toggle */}
              <Pressable
                onPress={() => {
                  setTorchOn((v) => !v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: torchOn ? COLORS.primaryYellow : '#2A2A2A',
                  borderWidth: 1, borderColor: torchOn ? COLORS.deepYellow : '#3A3A3A',
                }}
              >
                <MaterialCommunityIcons
                  name={torchOn ? 'flashlight' : 'flashlight-off'}
                  size={20}
                  color={torchOn ? COLORS.darkBg : '#9E9E9E'}
                />
              </Pressable>
            </View>
          </View>

          {/* Mode pills */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {(['multi', 'single'] as ScanMode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setScanMode(m); Haptics.selectionAsync(); }}
                style={{
                  paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20,
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  backgroundColor: scanMode === m ? COLORS.primaryYellow : 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: scanMode === m ? COLORS.deepYellow : 'rgba(255,255,255,0.12)',
                }}
              >
                <MaterialCommunityIcons
                  name={m === 'multi' ? 'barcode-scan' : 'focus-field'}
                  size={13}
                  color={scanMode === m ? COLORS.darkBg : 'rgba(255,255,255,0.5)'}
                />
                <Text style={{
                  fontSize: 11, fontWeight: '700',
                  color: scanMode === m ? COLORS.darkBg : 'rgba(255,255,255,0.5)',
                }}>
                  {m === 'multi' ? 'Multi-scan' : 'Single'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── VIEWFINDER ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 130 }}>
          <View style={{ width: 280, height: FRAME_H, position: 'relative' }}>
            {/* Dim sides */}
            <View style={{ position: 'absolute', top: -4, bottom: -4, left: -FRAME_H, width: FRAME_H, backgroundColor: 'rgba(0,0,0,0.45)' }} />
            <View style={{ position: 'absolute', top: -4, bottom: -4, right: -FRAME_H, width: FRAME_H, backgroundColor: 'rgba(0,0,0,0.45)' }} />
            <View style={{ position: 'absolute', left: -FRAME_H, right: -FRAME_H, top: -60, height: 60, backgroundColor: 'rgba(0,0,0,0.45)' }} />
            <View style={{ position: 'absolute', left: -FRAME_H, right: -FRAME_H, bottom: -60, height: 60, backgroundColor: 'rgba(0,0,0,0.45)' }} />

            {/* Corner brackets */}
            {[
              { top: 0, left: 0,   borderTopWidth: 3, borderLeftWidth: 3,  borderTopLeftRadius: 8  },
              { top: 0, right: 0,  borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
              { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3,  borderBottomLeftRadius: 8  },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
            ].map((s, i) => (
              <View
                key={i}
                style={{ position: 'absolute', width: 34, height: 34, borderColor: COLORS.primaryYellow, ...s }}
              />
            ))}

            {/* Reanimated gradient scan line */}
            <Reanimated.View style={[{ position: 'absolute', left: 0, right: 0 }, scanLineStyle]}>
              <View style={{ height: 2, backgroundColor: COLORS.primaryYellow, borderRadius: 1, opacity: 0.95 }} />
              <View style={{ height: 8, marginTop: -5, marginHorizontal: 6, backgroundColor: COLORS.primaryYellow, opacity: 0.18, borderRadius: 4 }} />
            </Reanimated.View>
          </View>

          <Text style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '700',
            letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 18,
          }}>
            Align barcode within frame
          </Text>
        </View>

        {/* ── MANUAL ENTRY ── */}
        <View style={{
          marginHorizontal: 16, marginBottom: 10,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderRadius: 13, paddingHorizontal: 13, height: 46,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <MaterialCommunityIcons name="keyboard-outline" size={18} color="#7A7A7A" />
          <TextInput
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="Type SKU or product name…"
            placeholderTextColor="rgba(255,255,255,0.18)"
            style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: '500' }}
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
          />
          {manualInput.length > 0 && (
            <Pressable
              onPress={handleManualSearch}
              style={{ backgroundColor: COLORS.primaryYellow, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.darkBg }}>Search</Text>
            </Pressable>
          )}
        </View>

        {/* ── SIMULATE SCAN BUTTON ── */}
        <Pressable
          onPress={handleSimulateScan}
          style={{
            marginHorizontal: 16, marginBottom: 16,
            backgroundColor: COLORS.primaryYellow, borderRadius: 17, paddingVertical: 15,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: COLORS.primaryYellow, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
          }}
        >
          <MaterialCommunityIcons name="camera" size={21} color={COLORS.darkBg} />
          <Text style={{ fontSize: 15, fontWeight: '900', color: COLORS.darkBg, letterSpacing: 0.1 }}>
            Tap to Simulate Scan
          </Text>
        </Pressable>
      </View>

      {/* ╔═════════════════════╗ */}
      {/* ║  BOTTOM WHITE PANEL ║ */}
      {/* ╚═════════════════════╝ */}
      <View style={{
        backgroundColor: COLORS.surfaceWhite,
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        overflow: 'hidden', paddingBottom: 6,
      }}>

        {/* Product NOT found card */}
        {scanState === 'not_found' && (
          <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
            <View style={{
              margin: 14, backgroundColor: '#FFF3E0',
              borderRadius: 14, padding: 14,
              flexDirection: 'row', alignItems: 'center', gap: 10,
              borderWidth: 1, borderColor: '#FFE0B2',
            }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFE0B2', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="barcode-off" size={22} color="#E65100" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#E65100' }}>Product not found</Text>
                <Text style={{ fontSize: 11, color: '#BF360C', marginTop: 2, fontWeight: '500' }}>
                  Barcode: {unknownBarcode}
                </Text>
              </View>
              <Pressable
                onPress={() => Alert.alert('Add Product', `Open add-product form with barcode pre-filled:\n${unknownBarcode}`)}
                style={{ backgroundColor: '#E65100', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>+ Add New</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Product FOUND card */}
        {scanState === 'found' && scannedProduct && (
          <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
            <View style={{ padding: 14, paddingBottom: 0 }}>
              {/* Found badge */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: '#E8F5E9', borderRadius: 20, alignSelf: 'flex-start',
                paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
              }}>
                <MaterialCommunityIcons name="check-circle" size={13} color="#2E7D32" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2E7D32' }}>Product Found</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>· {scannedProduct.sku}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                {/* Product icon tile */}
                <View style={{
                  width: 60, height: 60, borderRadius: 16,
                  backgroundColor: COLORS.surfaceLight,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: COLORS.borderLight, flexShrink: 0,
                }}>
                  <MaterialCommunityIcons name={scannedProduct.icon} size={30} color="#BDBDBD" />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.textPrimary }} numberOfLines={1}>
                    {scannedProduct.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 1 }}>
                    {scannedProduct.barcode}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.deepYellow, marginTop: 3, letterSpacing: -0.5 }}>
                    ₹{scannedProduct.sellingPrice}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <MaterialCommunityIcons name="package-variant-closed" size={11} color={COLORS.successGreen} />
                    <Text style={{ fontSize: 11, color: COLORS.successGreen, fontWeight: '600' }}>
                      {scannedProduct.stock} in stock
                    </Text>
                  </View>
                </View>

                {/* Qty stepper + Add */}
                <View style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: COLORS.surfaceLight, borderRadius: 11, padding: 3, gap: 1,
                  }}>
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); setQty((q) => Math.max(1, q - 1)); }}
                      style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#fff' }}
                    >
                      <MaterialCommunityIcons name="minus" size={14} color={COLORS.textPrimary} />
                    </Pressable>
                    <Text style={{ fontSize: 16, fontWeight: '800', minWidth: 28, textAlign: 'center', color: COLORS.textPrimary }}>
                      {qty}
                    </Text>
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); setQty((q) => q + 1); }}
                      style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: COLORS.primaryYellow }}
                    >
                      <MaterialCommunityIcons name="plus" size={14} color={COLORS.darkBg} />
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleAddToBill}
                    style={{
                      backgroundColor: addedToCart ? COLORS.successGreen : COLORS.primaryYellow,
                      borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9,
                      alignItems: 'center', gap: 3, minWidth: 74,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={addedToCart ? 'check-bold' : 'cart-plus'}
                      size={18}
                      color={addedToCart ? '#fff' : COLORS.darkBg}
                    />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: addedToCart ? '#fff' : COLORS.darkBg }}>
                      {addedToCart ? 'Added!' : 'Add to Bill'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Scan Next */}
              <Pressable
                onPress={handleScanNext}
                style={{
                  marginTop: 12, paddingVertical: 12, borderRadius: 13,
                  backgroundColor: COLORS.surfaceLight,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  borderWidth: 1, borderColor: COLORS.borderLight,
                }}
              >
                <MaterialCommunityIcons name="barcode-scan" size={16} color={COLORS.textSecondary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textSecondary }}>Scan Next Item</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Cart bar */}
        {cartCount === 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 }}>
            <MaterialCommunityIcons name="cart-outline" size={18} color="#C8C8C8" />
            <Text style={{ fontSize: 13, color: '#C8C8C8', fontWeight: '600' }}>
              Cart is empty — scan items to start
            </Text>
          </View>
        ) : (
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 14, paddingVertical: 12, paddingBottom: 18,
            borderTopWidth: scanState !== 'idle' ? 1 : 0, borderTopColor: COLORS.borderLight,
            marginTop: scanState !== 'idle' ? 12 : 0,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 26, height: 26, borderRadius: 13,
                backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.primaryYellow }}>{cartCount}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>
                  {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>₹{subtotal.toFixed(2)} before taxes</Text>
              </View>
            </View>
            <Pressable
              onPress={openSheet}
              style={{
                backgroundColor: COLORS.primaryYellow, borderRadius: 13,
                paddingHorizontal: 18, paddingVertical: 12,
                flexDirection: 'row', alignItems: 'center', gap: 7,
                shadowColor: COLORS.primaryYellow, shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
              }}
            >
              <MaterialCommunityIcons name="receipt" size={18} color={COLORS.darkBg} />
              <Text style={{ fontSize: 14, fontWeight: '900', color: COLORS.darkBg }}>Review Bill</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ╔═══════════════════════════╗ */}
      {/* ║  FLOATING CART BUBBLE FAB ║ */}
      {/* ╚═══════════════════════════╝ */}
      {cartCount > 0 && !showCartSheet && (
        <Reanimated.View style={[{
          position: 'absolute', bottom: 100, right: 18, zIndex: 60,
        }, bubbleStyle]}>
          <Pressable
            onPress={openSheet}
            style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: COLORS.primaryYellow,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.28, shadowRadius: 10, elevation: 10,
            }}
          >
            <MaterialCommunityIcons name="cart" size={26} color={COLORS.darkBg} />
          </Pressable>

          {/* Badge */}
          <View style={{
            position: 'absolute', top: -3, right: -3,
            minWidth: 22, height: 22, borderRadius: 11,
            backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: COLORS.primaryYellow, paddingHorizontal: 3,
          }}>
            <Text style={{ fontSize: 10, fontWeight: '900', color: COLORS.primaryYellow }}>{cartCount}</Text>
          </View>
        </Reanimated.View>
      )}

      {/* ╔═══════════════════════════════╗ */}
      {/* ║  CART REVIEW BOTTOM SHEET     ║ */}
      {/* ╚═══════════════════════════════╝ */}
      {showCartSheet && (
        <View style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          {/* Scrim */}
          <Pressable
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.58)' }}
            onPress={closeSheet}
          />

          <Animated.View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: SHEET_H, backgroundColor: '#fff',
            borderTopLeftRadius: 26, borderTopRightRadius: 26,
            transform: [{ translateY: sheetY }],
          }}>
            {/* Drag handle */}
            <View {...sheetPan.panHandlers} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <View style={{ width: 42, height: 4, borderRadius: 2, backgroundColor: '#DDD' }} />
            </View>

            {/* Sheet header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 22, paddingBottom: 16,
              borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
            }}>
              <View>
                <Text style={{ fontSize: 19, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 }}>
                  Review Bill
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' }}>
                  {cartCount} item{cartCount > 1 ? 's' : ''} · swipe left to remove
                </Text>
              </View>
              <Pressable
                onPress={closeSheet}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialCommunityIcons name="close" size={16} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            >
              {/* Cart items */}
              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                Items
              </Text>
              {storeCart.map((item: any) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQty={(q) => updateCartQty?.(item.productId, q)}
                  onRemove={() => handleRemoveFromCart(item.productId)}
                />
              ))}

              {/* Customer name */}
              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginTop: 22, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                Customer
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: COLORS.surfaceLight, borderRadius: 13,
                paddingHorizontal: 14, height: 48,
                borderWidth: 1, borderColor: COLORS.borderLight,
              }}>
                <MaterialCommunityIcons name="account-outline" size={19} color="#BDBDBD" />
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Customer name (optional)"
                  placeholderTextColor="#C8C8C8"
                  style={{ flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' }}
                />
              </View>

              {/* Discount */}
              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                Discount
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: COLORS.surfaceLight, borderRadius: 13,
                paddingHorizontal: 14, height: 48,
                borderWidth: 1, borderColor: COLORS.borderLight,
              }}>
                <MaterialCommunityIcons name="tag-outline" size={19} color="#BDBDBD" />
                <TextInput
                  value={discount}
                  onChangeText={(v) => setDiscount(v.replace(/[^0-9.]/g, ''))}
                  placeholder="Enter discount %"
                  placeholderTextColor="#C8C8C8"
                  keyboardType="decimal-pad"
                  style={{ flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' }}
                />
                {discountAmt > 0 && (
                  <View style={{ backgroundColor: '#FFE8E7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.dangerRed }}>
                      −₹{discountAmt.toFixed(0)}
                    </Text>
                  </View>
                )}
              </View>

              {/* GST toggle */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 12, backgroundColor: COLORS.surfaceLight, borderRadius: 13,
                paddingHorizontal: 14, height: 52,
                borderWidth: 1, borderColor: COLORS.borderLight,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="percent" size={19} color="#BDBDBD" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>GST (5%)</Text>
                  {gstEnabled && gstAmt > 0 && (
                    <View style={{ backgroundColor: '#E8F5E9', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.successGreen }}>+₹{gstAmt.toFixed(0)}</Text>
                    </View>
                  )}
                </View>
                <Switch
                  value={gstEnabled}
                  onValueChange={(v) => { setGstEnabled(v); Haptics.selectionAsync(); }}
                  trackColor={{ false: COLORS.borderLight, true: COLORS.successGreen }}
                  thumbColor="#fff"
                />
              </View>

              {/* Payment mode */}
              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, marginTop: 22, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                Payment Mode
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  { mode: 'cash' as PaymentMode, icon: 'cash',               label: 'Cash'   },
                  { mode: 'upi'  as PaymentMode, icon: 'qrcode-scan',        label: 'UPI'    },
                  { mode: 'card' as PaymentMode, icon: 'credit-card-outline', label: 'Card'  },
                ] as const).map(({ mode, icon, label }) => (
                  <Pressable
                    key={mode}
                    onPress={() => { setPaymentMode(mode); Haptics.selectionAsync(); }}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: 13,
                      alignItems: 'center', gap: 5,
                      backgroundColor: paymentMode === mode ? COLORS.darkBg : COLORS.surfaceLight,
                      borderWidth: 1.5,
                      borderColor: paymentMode === mode ? COLORS.darkBg : COLORS.borderLight,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={22}
                      color={paymentMode === mode ? COLORS.primaryYellow : COLORS.textSecondary}
                    />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: paymentMode === mode ? COLORS.primaryYellow : COLORS.textSecondary }}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Live total summary */}
              <View style={{
                marginTop: 20, backgroundColor: COLORS.surfaceLight, borderRadius: 16,
                padding: 18, borderWidth: 1, borderColor: COLORS.borderLight,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' }}>Subtotal</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary }}>₹{subtotal.toFixed(2)}</Text>
                </View>
                {discountAmt > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: COLORS.dangerRed, fontWeight: '500' }}>Discount ({discount}%)</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.dangerRed }}>−₹{discountAmt.toFixed(2)}</Text>
                  </View>
                )}
                {gstEnabled && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: COLORS.successGreen, fontWeight: '500' }}>GST (5%)</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.successGreen }}>+₹{gstAmt.toFixed(2)}</Text>
                  </View>
                )}
                <View style={{ height: 1, backgroundColor: COLORS.borderLight, marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 0.5 }}>TOTAL</Text>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: COLORS.primaryYellow, letterSpacing: -1 }}>
                    ₹{totalAmt.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Generate Bill CTA */}
              <Pressable
                onPress={handleGenerateBill}
                style={{
                  marginTop: 18, backgroundColor: COLORS.primaryYellow, borderRadius: 18,
                  paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                  shadowColor: COLORS.primaryYellow, shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
                }}
              >
                <MaterialCommunityIcons name="receipt" size={24} color={COLORS.darkBg} />
                <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.darkBg, letterSpacing: 0.2 }}>
                  Generate Bill
                </Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* ╔══════════════════════════╗ */}
      {/* ║  THERMAL RECEIPT MODAL   ║ */}
      {/* ╚══════════════════════════╝ */}
      <Modal visible={showReceipt} animationType="fade" transparent presentationStyle="overFullScreen">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 16 }}>
          <View style={{
            backgroundColor: '#FAFAF8', borderRadius: 20,
            maxHeight: SCREEN_H * 0.9, overflow: 'hidden',
          }}>
            {/* Modal header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              padding: 18, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryYellow, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="check-bold" size={20} color={COLORS.darkBg} />
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.textPrimary }}>Bill Generated!</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 1 }}>Bill #{billNumber} · {today}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowReceipt(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialCommunityIcons name="close" size={15} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false}>
              {/* ── Thermal Receipt ── */}
              <View style={{
                backgroundColor: '#fff', borderRadius: 14, padding: 18,
                borderWidth: 1, borderColor: COLORS.borderLight,
              }}>
                {/* Store header */}
                <View style={{ alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <MaterialCommunityIcons name="store-outline" size={20} color={COLORS.textPrimary} />
                    <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, fontFamily: 'monospace', letterSpacing: 1 }}>
                      DUKAAN PRO
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'monospace' }}>
                    Sharma Kirana Store
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace' }}>Pune</Text>
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace' }}>  |  </Text>
                    <MaterialCommunityIcons name="phone-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace' }}>98XXXXXXXX</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 3 }}>
                    Bill #{billNumber}  |  {today}
                  </Text>
                  {snap?.customerName ? (
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 2 }}>
                      Customer: {snap.customerName}
                    </Text>
                  ) : null}
                </View>

                {/* Dashed divider */}
                <Text style={{ fontFamily: 'monospace', fontSize: 10, color: '#CCC', letterSpacing: 1, marginBottom: 12 }}>
                  {'─ '.repeat(18)}
                </Text>

                {/* Items */}
                {(snap?.items ?? storeCart).map((item: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textPrimary, fontFamily: 'monospace', flex: 1 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', marginHorizontal: 6 }}>
                      x{item.qty}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'monospace' }}>
                      ₹{item.total.toFixed(0)}
                    </Text>
                  </View>
                ))}

                {/* Dashed divider */}
                <Text style={{ fontFamily: 'monospace', fontSize: 10, color: '#CCC', letterSpacing: 1, marginVertical: 12 }}>
                  {'─ '.repeat(18)}
                </Text>

                {/* Subtotal */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace' }}>Subtotal</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'monospace' }}>
                    ₹{(snap?.subtotal ?? subtotal).toFixed(0)}
                  </Text>
                </View>
                {(snap?.discountAmt ?? discountAmt) > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: COLORS.dangerRed, fontFamily: 'monospace' }}>
                      Discount ({snap?.discountPct ?? discount}%)
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dangerRed, fontFamily: 'monospace' }}>
                      −₹{(snap?.discountAmt ?? discountAmt).toFixed(0)}
                    </Text>
                  </View>
                )}
                {(snap?.gstEnabled ?? gstEnabled) && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: COLORS.successGreen, fontFamily: 'monospace' }}>GST (5%)</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.successGreen, fontFamily: 'monospace' }}>
                      +₹{(snap?.gstAmt ?? gstAmt).toFixed(0)}
                    </Text>
                  </View>
                )}

                {/* Dashed divider */}
                <Text style={{ fontFamily: 'monospace', fontSize: 10, color: '#CCC', letterSpacing: 1, marginVertical: 12 }}>
                  {'─ '.repeat(18)}
                </Text>

                {/* TOTAL */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, fontFamily: 'monospace', letterSpacing: 1 }}>
                    TOTAL
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.deepYellow, fontFamily: 'monospace' }}>
                    ₹{(snap?.totalAmt ?? totalAmt).toFixed(0)}
                  </Text>
                </View>

                {/* Payment mode */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.successGreen} />
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace' }}>
                    Paid via:{' '}
                    {(snap?.paymentMode ?? paymentMode) === 'cash' ? 'Cash' :
                     (snap?.paymentMode ?? paymentMode) === 'upi'  ? 'UPI'  : 'Card'}
                  </Text>
                </View>

                {/* Dashed divider */}
                <Text style={{ fontFamily: 'monospace', fontSize: 10, color: '#CCC', letterSpacing: 1, marginVertical: 12 }}>
                  {'─ '.repeat(18)}
                </Text>

                {/* Footer */}
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="hand-wave-outline" size={20} color={COLORS.primaryYellow} />
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', textAlign: 'center' }}>
                    Thank you! Come again
                  </Text>
                </View>
              </View>

              {/* Action row */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
                <Pressable
                  onPress={handleWhatsAppShare}
                  style={{
                    flex: 1, backgroundColor: '#25D366', borderRadius: 13,
                    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <MaterialCommunityIcons name="whatsapp" size={19} color="#fff" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>WhatsApp</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('PDF', 'Receipt PDF downloaded to device.')}
                  style={{
                    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 13,
                    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    borderWidth: 1, borderColor: COLORS.borderLight,
                  }}
                >
                  <MaterialCommunityIcons name="file-pdf-box" size={19} color={COLORS.dangerRed} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>PDF</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('Print', 'Sent to thermal printer.')}
                  style={{
                    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 13,
                    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    borderWidth: 1, borderColor: COLORS.borderLight,
                  }}
                >
                  <MaterialCommunityIcons name="printer-outline" size={19} color={COLORS.textPrimary} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.textPrimary }}>Print</Text>
                </Pressable>
              </View>

              {/* New Bill */}
              <Pressable
                onPress={handleNewBill}
                style={{
                  marginTop: 10, backgroundColor: COLORS.darkBg, borderRadius: 16,
                  paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={22} color={COLORS.primaryYellow} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.2 }}>New Bill</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}