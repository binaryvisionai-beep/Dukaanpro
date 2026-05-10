import { BrandColors } from '@/constants/Colors';
import { useStore } from '@/src/store';
import { formatCurrency } from '@/src/utils/formatters';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';

type PaymentMode = 'cash' | 'upi' | 'card';
type HistoryFilter = 'all' | 'paid' | 'draft';
type ActiveTab = 'billing' | 'history';

const GST_OPTIONS = [0, 5, 12, 18, 28];

const PAST_CUSTOMERS = [
  'Raj Sharma',
  'Priya Patel',
  'Anil Kumar',
  'Sunita Verma',
  'Mohan Das',
];

const paymentConfig: Record<PaymentMode, { icon: string; label: string }> = {
  cash: { icon: 'cash', label: 'Cash' },
  upi: { icon: 'qrcode-scan', label: 'UPI' },
  card: { icon: 'credit-card-outline', label: 'Card' },
};

export function BillingScreen() {
  const { products, cart, addToCart, updateCartQty, createBill, bills } = useStore();

  // Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('billing');

  // Billing inputs
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [gstRate, setGstRate] = useState(5);
  const [showGstConfig, setShowGstConfig] = useState(false);

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);

  // Draft
  const [draft, setDraft] = useState<any>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // History filters
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [historySearch, setHistorySearch] = useState('');

  const successAnim = useRef(new Animated.Value(0)).current;

  const productResults = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 6);

  const customerResults = customerSearch.length > 0
    ? PAST_CUSTOMERS.filter((c) =>
        c.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : [];

  const subtotal = cart.reduce((s, c) => s + c.total, 0);
  const discountAmt = Number(discount || 0);
  const tax = (subtotal - discountAmt) * (gstRate / 100);
  const total = subtotal - discountAmt + tax;

  const handleGenerateBill = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add at least one item before generating a bill.');
      return;
    }
    const bill = createBill({
      customerName: customerName || 'Walk-in Customer',
      discount: discountAmt,
      paymentMode,
      gstRate,
    });
    setLastBill(bill);
    setShowSuccess(true);
    setDraft(null);
  }, [cart, customerName, discountAmt, paymentMode, gstRate, createBill]);

  const handleNewBill = useCallback(() => {
    setShowSuccess(false);
    setCustomerName('');
    setCustomerSearch('');
    setDiscount('0');
    setPaymentMode('cash');
    setGstRate(5);
    // cart cleared via store
  }, []);

  const handleSaveDraft = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Nothing to save as draft.');
      return;
    }
    setDraft({ cart: [...cart], customerName, discount });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  }, [cart, customerName, discount]);

  const handleResumeDraft = useCallback(() => {
    if (!draft) return;
    setCustomerName(draft.customerName || '');
    setDiscount(draft.discount || '0');
    setDraft(null);
    // restore cart via store in real app
  }, [draft]);

  const handleShareWhatsApp = useCallback(async () => {
    if (!lastBill) return;
    const msg = `*Bill ${lastBill.id}*\nCustomer: ${lastBill.customerName}\nTotal: ${formatCurrency(lastBill.total)}\nPayment: ${lastBill.paymentMode?.toUpperCase()}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nThank you for shopping with us!`;
    try {
      await Share.share({ message: msg });
    } catch {}
  }, [lastBill]);

  const handleDownloadPDF = useCallback(() => {
    Alert.alert('PDF Download', 'Receipt PDF has been saved to your downloads.');
  }, []);

  const filteredBills = (bills ?? []).filter((b: any) => {
    const matchStatus =
      historyFilter === 'all' ||
      (historyFilter === 'paid' && b.status !== 'draft') ||
      (historyFilter === 'draft' && b.status === 'draft');
    const matchSearch =
      !historySearch ||
      b.customerName?.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.id?.toLowerCase().includes(historySearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BrandColors.surfaceLight }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: BrandColors.surfaceWhite,
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: BrandColors.borderLight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: BrandColors.textPrimary }}>
            Classic POS
          </Text>
          <Text style={{ fontSize: 12, color: BrandColors.textSecondary, marginTop: 1 }}>
            {activeTab === 'billing' ? 'Billing & checkout' : 'Bill history'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {(['billing', 'history'] as ActiveTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeTab === tab ? BrandColors.primaryYellow : BrandColors.surfaceLight,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  color: activeTab === tab ? '#1A1A1A' : BrandColors.textSecondary,
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── BILLING TAB ── */}
      {activeTab === 'billing' && (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Customer Input */}
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="account-outline" size={18} color={BrandColors.textSecondary} />
              <TextInput
                value={customerSearch || customerName}
                onChangeText={(v) => {
                  setCustomerSearch(v);
                  setCustomerName(v);
                }}
                placeholder="Customer name (optional)"
                placeholderTextColor={BrandColors.textSecondary}
                style={{ flex: 1, fontSize: 14, color: BrandColors.textPrimary }}
              />
              {customerName.length > 0 && (
                <Pressable onPress={() => { setCustomerName(''); setCustomerSearch(''); }}>
                  <MaterialCommunityIcons name="close-circle" size={17} color={BrandColors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Customer Autocomplete */}
            {customerResults.length > 0 && (
              <View style={styles.dropdown}>
                {customerResults.map((c, i) => (
                  <Pressable
                    key={c}
                    onPress={() => { setCustomerName(c); setCustomerSearch(''); }}
                    style={[styles.dropItem, i < customerResults.length - 1 && styles.dropBorder]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="account-circle-outline" size={16} color={BrandColors.textSecondary} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: BrandColors.textPrimary }}>{c}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: BrandColors.textSecondary }}>Past customer</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Draft Banner */}
            {draft && (
              <Pressable
                onPress={handleResumeDraft}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color="#E65100" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#E65100' }}>Draft Bill</Text>
                    <Text style={{ fontSize: 11, color: '#E65100', opacity: 0.7 }}>
                      {draft.cart.length} item{draft.cart.length > 1 ? 's' : ''} saved
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#E65100', textDecorationLine: 'underline' }}>
                  Resume
                </Text>
              </Pressable>
            )}

            {/* Search Bar */}
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="magnify" size={18} color={BrandColors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search or scan product"
                placeholderTextColor={BrandColors.textSecondary}
                style={{ flex: 1, fontSize: 14, color: BrandColors.textPrimary }}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={17} color={BrandColors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Search Dropdown */}
            {search.length > 0 && (
              <View style={[styles.dropdown, { maxHeight: 240 }]}>
                {productResults.length === 0 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: BrandColors.textSecondary, fontSize: 13 }}>No products found</Text>
                  </View>
                ) : (
                  productResults.map((item, idx) => (
                    <Pressable
                      key={item.id}
                      onPress={() => { addToCart(item); setSearch(''); }}
                      style={[styles.dropItem, idx < productResults.length - 1 && styles.dropBorder]}
                    >
                      <View>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: BrandColors.textPrimary }}>{item.name}</Text>
                        <Text style={{ color: BrandColors.textSecondary, fontSize: 11, marginTop: 1 }}>SKU: {item.sku}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 3 }}>
                        <Text style={{ fontWeight: '800', color: '#E6B800', fontSize: 14 }}>
                          {formatCurrency(item.sellingPrice)}
                        </Text>
                        <View style={{ backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#2E7D32' }}>+ ADD</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {/* Cart Section */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: BrandColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Cart
            </Text>

            {cart.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 28, gap: 6 }}>
                <MaterialCommunityIcons name="cart-outline" size={36} color="#ccc" />
                <Text style={{ color: BrandColors.textSecondary, fontSize: 14, fontWeight: '600' }}>Cart is empty</Text>
                <Text style={{ color: BrandColors.textSecondary, fontSize: 12 }}>Search for products above</Text>
              </View>
            ) : (
              cart.map((item) => (
                <View
                  key={item.productId}
                  style={{
                    backgroundColor: '#fff', borderRadius: 14, padding: 12,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 6,
                    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: BrandColors.textPrimary }}>{item.name}</Text>
                    <Text style={{ color: '#E6B800', fontWeight: '700', fontSize: 13, marginTop: 3 }}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.surfaceLight, borderRadius: 10, padding: 3 }}>
                    <Pressable
                      onPress={() => updateCartQty(item.productId, item.qty - 1)}
                      style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#fff' }}
                    >
                      <MaterialCommunityIcons name="minus" size={14} color={BrandColors.textPrimary} />
                    </Pressable>
                    <Text style={{ fontWeight: '800', fontSize: 14, minWidth: 30, textAlign: 'center', color: BrandColors.textPrimary }}>
                      {item.qty}
                    </Text>
                    <Pressable
                      onPress={() => updateCartQty(item.productId, item.qty + 1)}
                      style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: BrandColors.primaryYellow }}
                    >
                      <MaterialCommunityIcons name="plus" size={14} color="#1A1A1A" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Bill Summary */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 16,
            marginHorizontal: 0,
            shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -2 }, shadowRadius: 12, elevation: 6,
          }}>
            {/* Subtotal */}
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumVal}>{formatCurrency(subtotal)}</Text>
            </View>

            {/* Discount */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.surfaceLight, borderRadius: 10, paddingHorizontal: 10, height: 38, marginBottom: 8, gap: 6 }}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={BrandColors.textSecondary} />
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                placeholder="Discount amount"
                placeholderTextColor={BrandColors.textSecondary}
                style={{ flex: 1, fontSize: 13, color: BrandColors.textPrimary }}
              />
            </View>

            {/* GST */}
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>GST ({gstRate}%)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sumVal}>{formatCurrency(tax)}</Text>
                <Pressable
                  onPress={() => setShowGstConfig(!showGstConfig)}
                  style={{ backgroundColor: '#FFF3E0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#E65100' }}>Configure</Text>
                </Pressable>
              </View>
            </View>

            {showGstConfig && (
              <View style={{ flexDirection: 'row', gap: 5, marginBottom: 8 }}>
                {GST_OPTIONS.map((rate) => (
                  <Pressable
                    key={rate}
                    onPress={() => { setGstRate(rate); setShowGstConfig(false); }}
                    style={{
                      flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center',
                      backgroundColor: gstRate === rate ? BrandColors.primaryYellow : BrandColors.surfaceLight,
                      borderWidth: 1,
                      borderColor: gstRate === rate ? BrandColors.primaryYellow : BrandColors.borderLight,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: gstRate === rate ? '#1A1A1A' : BrandColors.textSecondary }}>
                      {rate}%
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Total */}
            <View style={[styles.sumRow, { paddingTop: 10, borderTopWidth: 1, borderTopColor: BrandColors.borderLight, marginBottom: 12 }]}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: BrandColors.textPrimary }}>Total</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#E6B800' }}>{formatCurrency(total)}</Text>
            </View>

            {/* Payment Pills */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {(Object.keys(paymentConfig) as PaymentMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setPaymentMode(mode)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', gap: 2,
                    backgroundColor: paymentMode === mode ? BrandColors.primaryYellow : BrandColors.surfaceLight,
                  }}
                >
                  <MaterialCommunityIcons
                    name={paymentConfig[mode].icon as any}
                    size={18}
                    color={paymentMode === mode ? '#1A1A1A' : BrandColors.textSecondary}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: paymentMode === mode ? '#1A1A1A' : BrandColors.textSecondary }}>
                    {paymentConfig[mode].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Generate Bill */}
            <Pressable
              onPress={handleGenerateBill}
              style={{ backgroundColor: BrandColors.primaryYellow, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
            >
              <MaterialCommunityIcons name="receipt" size={20} color="#1A1A1A" />
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#1A1A1A' }}>
                Generate Bill · {formatCurrency(total)}
              </Text>
            </Pressable>

            {/* Save Draft */}
            <Pressable
              onPress={handleSaveDraft}
              style={{ paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: BrandColors.borderLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <MaterialCommunityIcons
                name={draftSaved ? 'check-circle-outline' : 'content-save-outline'}
                size={15}
                color={draftSaved ? '#34C759' : BrandColors.textSecondary}
              />
              <Text style={{ fontSize: 13, fontWeight: '600', color: draftSaved ? '#34C759' : BrandColors.textSecondary }}>
                {draftSaved ? 'Draft Saved!' : 'Save as Draft'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <View style={{ flex: 1, padding: 12 }}>
          <View style={[styles.inputRow, { marginBottom: 8 }]}>
            <MaterialCommunityIcons name="magnify" size={18} color={BrandColors.textSecondary} />
            <TextInput
              value={historySearch}
              onChangeText={setHistorySearch}
              placeholder="Search bills by customer or ID..."
              placeholderTextColor={BrandColors.textSecondary}
              style={{ flex: 1, fontSize: 14, color: BrandColors.textPrimary }}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['all', 'paid', 'draft'] as HistoryFilter[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setHistoryFilter(f)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                    backgroundColor: historyFilter === f ? BrandColors.primaryYellow : '#fff',
                    borderWidth: 1,
                    borderColor: historyFilter === f ? BrandColors.primaryYellow : BrandColors.borderLight,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: historyFilter === f ? '#1A1A1A' : BrandColors.textSecondary }}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <FlatList
            data={filteredBills}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <MaterialCommunityIcons name="receipt-text-outline" size={36} color="#ccc" />
                <Text style={{ color: BrandColors.textSecondary, fontSize: 14, marginTop: 8 }}>No bills found</Text>
              </View>
            }
            renderItem={({ item }: { item: any }) => (
              <Pressable
                style={{
                  backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 8,
                  shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: BrandColors.textPrimary }}>{item.customerName || 'Walk-in'}</Text>
                    <Text style={{ fontSize: 11, color: BrandColors.textSecondary, marginTop: 2 }}>
                      {item.id} · {item.paymentMode?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#E6B800' }}>{formatCurrency(item.total)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: BrandColors.textSecondary }}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                    backgroundColor: item.status === 'draft' ? '#FFF3E0' : '#E8F5E9',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: item.status === 'draft' ? '#E65100' : '#2E7D32' }}>
                      {item.status === 'draft' ? 'Draft' : 'Paid'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccess} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 32 }}>
            {/* Check */}
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="check" size={32} color="#fff" />
            </View>
            <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '800', color: BrandColors.textPrimary, marginBottom: 4 }}>
              Bill Generated!
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 13, color: BrandColors.textSecondary, marginBottom: 16 }}>
              Payment received via {paymentMode.toUpperCase()} · {formatCurrency(total)}
            </Text>

            {/* Receipt Preview */}
            <View style={{ backgroundColor: BrandColors.surfaceLight, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              {[
                { label: 'Customer', val: lastBill?.customerName || customerName || 'Walk-in' },
                { label: 'Subtotal', val: formatCurrency(subtotal) },
                ...(discountAmt > 0 ? [{ label: 'Discount', val: `−${formatCurrency(discountAmt)}` }] : []),
                { label: `GST (${gstRate}%)`, val: formatCurrency(tax) },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: BrandColors.textSecondary }}>{row.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: BrandColors.textPrimary }}>{row.val}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: BrandColors.borderLight, borderStyle: 'dashed' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: BrandColors.textPrimary }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#E6B800' }}>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Pressable
                onPress={handleShareWhatsApp}
                style={{ flex: 1, backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={handleDownloadPDF}
                style={{ flex: 1, backgroundColor: BrandColors.surfaceLight, borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: BrandColors.borderLight }}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={18} color={BrandColors.textPrimary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: BrandColors.textPrimary }}>PDF</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleNewBill}
              style={{ backgroundColor: BrandColors.primaryYellow, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>+ New Bill</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = {
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 8,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  dropItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dropBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sumRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  sumLabel: { fontSize: 13, color: '#6E6E73' },
  sumVal: { fontSize: 13, fontWeight: '700' as const, color: '#1C1C1E' },
};