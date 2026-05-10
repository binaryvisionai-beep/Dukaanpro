import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useStore } from '@/src/store';
import { formatCurrency } from '@/src/utils/formatters';

// ── Design Tokens ─────────────────────────────────────────────────
const C = {
  yellow:    '#F8CB2E',
  yellowDeep:'#E6B800',
  dark:      '#1A1A1A',
  white:     '#FFFFFF',
  surfLight: '#F5F5F0',
  textPri:   '#1C1C1E',
  textSec:   '#6E6E73',
  success:   '#34C759',
  danger:    '#FF3B30',
  warning:   '#FF9500',
  border:    '#E5E5EA',
};

const CATEGORIES = ['All', 'Grocery', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Custom'];
const UNITS      = ['pcs', 'kg', 'ltr', 'box', 'pack'];

const CAT_ICONS: Record<string, string> = {
  Grocery:   'basket-outline',
  Dairy:     'cow',
  Beverages: 'cup-outline',
  Snacks:    'cookie-outline',
  Household: 'home-outline',
  Custom:    'tag-outline',
};

function stockStatus(stock: number, threshold: number) {
  if (stock === 0)          return { label: 'OUT OF STOCK', color: C.danger,  border: C.danger  };
  if (stock < 5)            return { label: 'OUT OF STOCK', color: C.danger,  border: C.danger  };
  if (stock <= threshold)   return { label: 'LOW STOCK',    color: C.warning, border: C.warning };
  return                           { label: 'IN STOCK',     color: C.success, border: C.success };
}

function generateSKU(name: string, category: string) {
  const prefix = (category.slice(0, 3) + name.slice(0, 3)).toUpperCase().replace(/\s/g, '');
  const num    = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${num}`;
}

// ── Input Field ───────────────────────────────────────────────────
function Field({
  label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: C.surfLight, borderRadius: 12, paddingHorizontal: 14, height: multiline ? 70 : 46, justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={C.textSec}
          keyboardType={keyboardType}
          multiline={multiline}
          style={{ fontSize: 14, color: C.textPri }}
        />
      </View>
    </View>
  );
}

// ── Swipeable Product Card ─────────────────────────────────────────
function ProductCard({
  item, onUpdateStock, onEdit, onDelete,
}: {
  item: any;
  onUpdateStock: (id: string, delta: number) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const status = stockStatus(item.stock, item.lowStockThreshold ?? 10);

  const handleSwipe = () => {
    if (swiped) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      setSwiped(false);
    } else {
      Animated.spring(translateX, { toValue: -100, useNativeDriver: true }).start();
      setSwiped(true);
    }
  };

  const closeSwipe = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setSwiped(false);
  };

  return (
    <View style={{ marginBottom: 10, position: 'relative' }}>
      {/* Hidden actions */}
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, flexDirection: 'row', borderRadius: 16, overflow: 'hidden' }}>
        <Pressable
          onPress={() => { closeSwipe(); onEdit(item); }}
          style={{ width: 50, backgroundColor: C.warning, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={C.white} />
        </Pressable>
        <Pressable
          onPress={() => { closeSwipe(); onDelete(item.id); }}
          style={{ width: 50, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={C.white} />
        </Pressable>
      </View>

      {/* Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: C.white,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: status.border + '40',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar */}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: status.border, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />

        <Pressable onPress={handleSwipe} style={{ paddingLeft: 16, paddingRight: 12, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Product image placeholder */}
            <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons
                name={(CAT_ICONS[item.category] ?? 'package-variant-closed') as any}
                size={26}
                color={C.textSec}
              />
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPri, flex: 1 }} numberOfLines={1}>
                  {item.name}
                </Text>
                {/* Stock badge */}
                <View style={{ backgroundColor: status.color + '18', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: status.color + '30' }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: status.color }}>{status.label}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 11, color: C.textSec, marginBottom: 5 }}>
                SKU: {item.sku}
              </Text>

              <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPri }}>
                {formatCurrency(item.sellingPrice)}
              </Text>
            </View>

            {/* Stock controls */}
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Pressable
                onPress={() => onUpdateStock(item.id, 1)}
                style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
              >
                <MaterialCommunityIcons name="plus" size={16} color={C.textPri} />
              </Pressable>

              <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPri, minWidth: 24, textAlign: 'center' }}>
                {item.stock}
              </Text>

              <Pressable
                onPress={() => onUpdateStock(item.id, -1)}
                style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
              >
                <MaterialCommunityIcons name="minus" size={16} color={C.textPri} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Sort Drawer ────────────────────────────────────────────────────
function SortDrawer({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (s: string) => void }) {
  const opts = [
    { key: 'name',     icon: 'sort-alphabetical-ascending', label: 'Name A → Z' },
    { key: 'stock_lo', icon: 'sort-numeric-ascending',      label: 'Stock: Low first' },
    { key: 'stock_hi', icon: 'sort-numeric-descending',     label: 'Stock: High first' },
    { key: 'price_lo', icon: 'cash-minus',                  label: 'Price: Low → High' },
    { key: 'price_hi', icon: 'cash-plus',                   label: 'Price: High → Low' },
    { key: 'cat',      icon: 'tag-outline',                 label: 'Category' },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />
      <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 18 }} />
        <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPri, marginBottom: 16 }}>Sort & Filter</Text>
        {opts.map((o) => (
          <Pressable key={o.key} onPress={() => { onSelect(o.key); onClose(); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <MaterialCommunityIcons name={o.icon as any} size={20} color={C.textSec} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.textPri }}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

// ── Add / Edit Product Sheet ───────────────────────────────────────
function ProductForm({
  visible, onClose, editProduct,
}: {
  visible: boolean; onClose: () => void; editProduct?: any;
}) {
  const { addProduct } = useStore() as any;
  const [name, setName]         = useState('');
  const [sku, setSku]           = useState('');
  const [category, setCategory] = useState('Grocery');
  const [unit, setUnit]         = useState('pcs');
  const [cost, setCost]         = useState('');
  const [sell, setSell]         = useState('');
  const [stock, setStock]       = useState('');
  const [threshold, setThreshold] = useState('10');

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name ?? '');
      setSku(editProduct.sku ?? '');
      setCategory(editProduct.category ?? 'Grocery');
      setUnit(editProduct.unit ?? 'pcs');
      setCost(String(editProduct.costPrice ?? ''));
      setSell(String(editProduct.sellingPrice ?? ''));
      setStock(String(editProduct.stock ?? ''));
      setThreshold(String(editProduct.lowStockThreshold ?? '10'));
    } else {
      setName(''); setSku(''); setCategory('Grocery'); setUnit('pcs');
      setCost(''); setSell(''); setStock(''); setThreshold('10');
    }
  }, [editProduct, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (addProduct) {
      addProduct({
        name: name.trim(),
        sku: sku || generateSKU(name, category),
        category,
        unit,
        costPrice: parseFloat(cost) || 0,
        sellingPrice: parseFloat(sell) || 0,
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(threshold) || 10,
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '92%' }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 18 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPri }}>
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <Field label="Product Name" value={name} onChangeText={setName} placeholder="e.g. Amul Butter 500g" />

            {/* SKU row */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>SKU</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: C.surfLight, borderRadius: 12, paddingHorizontal: 14, height: 46, justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
                  <TextInput value={sku} onChangeText={setSku} placeholder="e.g. AMU-BT-500" placeholderTextColor={C.textSec} style={{ fontSize: 14, color: C.textPri }} />
                </View>
                <Pressable onPress={() => setSku(generateSKU(name || 'PRD', category))}
                  style={{ height: 46, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: C.dark }}>AUTO</Text>
                </Pressable>
              </View>
            </View>

            {/* Category */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Custom'].map((c) => (
                  <Pressable key={c} onPress={() => setCategory(c)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: category === c ? C.yellow : C.surfLight, borderWidth: 1, borderColor: category === c ? C.yellowDeep : C.border }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: category === c ? C.dark : C.textSec }}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Unit */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Unit</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {UNITS.map((u) => (
                  <Pressable key={u} onPress={() => setUnit(u)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: unit === u ? C.yellow : C.surfLight, borderWidth: 1, borderColor: unit === u ? C.yellowDeep : C.border }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: unit === u ? C.dark : C.textSec }}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Price row */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="Cost Price ₹" value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0.00" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Sell Price ₹" value={sell} onChangeText={setSell} keyboardType="numeric" placeholder="0.00" />
              </View>
            </View>

            {/* Stock row */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="Opening Stock" value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Low Stock Alert" value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder="10" />
              </View>
            </View>

            {/* Barcode scan */}
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', marginBottom: 20 }}>
              <MaterialCommunityIcons name="barcode-scan" size={20} color={C.textSec} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.textSec }}>Scan Barcode</Text>
            </Pressable>

            {/* Save */}
            <Pressable onPress={handleSave}
              style={{ backgroundColor: C.yellow, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', shadowColor: C.yellowDeep, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 6, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.dark }}>{editProduct ? 'Save Changes' : 'Add Product'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── CSV Import Modal ───────────────────────────────────────────────
function CSVImportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }} onPress={onClose}>
        <View style={{ backgroundColor: C.white, borderRadius: 24, padding: 28, width: '85%', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="file-delimited-outline" size={30} color={C.textPri} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPri }}>Import via CSV</Text>
          <Text style={{ fontSize: 13, color: C.textSec, textAlign: 'center', lineHeight: 20 }}>
            Upload a CSV file with columns: Name, SKU, Category, Cost, Price, Stock
          </Text>
          <Pressable onPress={onClose}
            style={{ backgroundColor: C.yellow, borderRadius: 12, width: '100%', height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '800', fontSize: 15, color: C.dark }}>Choose File</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={{ fontSize: 14, color: C.textSec }}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export function InventoryScreen() {
  const { products, updateStock, deleteProduct } = useStore() as any;
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebounced]   = useState('');
  const [activeCategory, setCategory]     = useState('All');
  const [showForm, setShowForm]           = useState(false);
  const [editProduct, setEditProduct]     = useState<any>(null);
  const [showSort, setShowSort]           = useState(false);
  const [showCSV, setShowCSV]             = useState(false);
  const [sortKey, setSortKey]             = useState('name');
  const [showMoreMenu, setShowMoreMenu]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(text), 280);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p: any) => {
      const matchCat    = activeCategory === 'All' || p.category === activeCategory;
      const s           = debouncedSearch.toLowerCase();
      const matchSearch = !s || p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
      return matchCat && matchSearch;
    });
    switch (sortKey) {
      case 'name':     list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'stock_lo': list = [...list].sort((a, b) => a.stock - b.stock); break;
      case 'stock_hi': list = [...list].sort((a, b) => b.stock - a.stock); break;
      case 'price_lo': list = [...list].sort((a, b) => a.sellingPrice - b.sellingPrice); break;
      case 'price_hi': list = [...list].sort((a, b) => b.sellingPrice - a.sellingPrice); break;
      case 'cat':      list = [...list].sort((a, b) => a.category.localeCompare(b.category)); break;
    }
    return list;
  }, [products, debouncedSearch, activeCategory, sortKey]);

  const handleEdit   = (item: any) => { setEditProduct(item); setShowForm(true); };
  const handleDelete = (id: string) => { if (deleteProduct) deleteProduct(id); };

  return (
    <View style={{ flex: 1, backgroundColor: C.surfLight }}>

      {/* ── Top App Bar ─────────────────────────────────────── */}
      <View style={{ backgroundColor: C.white, paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="store" size={20} color={C.dark} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPri, letterSpacing: 1.2 }}>DUKAANPRO</Text>
        </View>
        <Pressable style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={C.textPri} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 14, flex: 1 }}>

        {/* ── Search + Filter Row ──────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: C.border, gap: 8 }}>
            <MaterialCommunityIcons name="magnify" size={18} color={C.textSec} />
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder="Search products, SKUs..."
              placeholderTextColor={C.textSec}
              style={{ flex: 1, fontSize: 14, color: C.textPri }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => { setSearch(''); setDebounced(''); }}>
                <MaterialCommunityIcons name="close-circle" size={16} color={C.textSec} />
              </Pressable>
            )}
            {/* Scan icon inside search */}
            <Pressable style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="barcode-scan" size={16} color={C.dark} />
            </Pressable>
          </View>

          {/* Sort button */}
          <Pressable onPress={() => setShowSort(true)}
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="sort-variant" size={20} color={C.textPri} />
          </Pressable>

          {/* More menu */}
          <Pressable onPress={() => setShowMoreMenu((v) => !v)}
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={C.textPri} />
          </Pressable>
        </View>

        {/* More menu dropdown */}
        {showMoreMenu && (
          <View style={{ position: 'absolute', top: 66, right: 16, zIndex: 999, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8, overflow: 'hidden' }}>
            <Pressable onPress={() => { setShowCSV(true); setShowMoreMenu(false); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <MaterialCommunityIcons name="file-import-outline" size={18} color={C.textPri} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPri }}>Import CSV</Text>
            </Pressable>
            <Pressable onPress={() => setShowMoreMenu(false)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 }}>
              <MaterialCommunityIcons name="file-export-outline" size={18} color={C.textPri} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPri }}>Export CSV</Text>
            </Pressable>
          </View>
        )}

        {/* ── Category Chips ───────────────────────────────── */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 14 }}
          renderItem={({ item }) => {
            const active = item === activeCategory;
            return (
              <Pressable
                onPress={() => setCategory(item)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? C.yellow : C.white, borderWidth: 1, borderColor: active ? C.yellowDeep : C.border }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? C.dark : C.textSec }}>{item}</Text>
              </Pressable>
            );
          }}
        />

        {/* ── Summary row ─────────────────────────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 13, color: C.textSec, fontWeight: '500' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: 12, color: C.textSec }}>Swipe left to edit or delete</Text>
        </View>

        {/* ── Product List ─────────────────────────────────── */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.surfLight, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="package-variant-closed" size={32} color={C.textSec} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPri }}>No products found</Text>
              <Text style={{ fontSize: 13, color: C.textSec }}>Try a different search or category</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onUpdateStock={updateStock}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        />
      </View>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <Pressable
        onPress={() => { setEditProduct(null); setShowForm(true); }}
        style={{ position: 'absolute', bottom: 92, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center', shadowColor: C.yellowDeep, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 10 }}
      >
        <MaterialCommunityIcons name="plus" size={28} color={C.dark} />
      </Pressable>

      {/* ── Modals ───────────────────────────────────────────── */}
      <ProductForm
        visible={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        editProduct={editProduct}
      />
      <SortDrawer
        visible={showSort}
        onClose={() => setShowSort(false)}
        onSelect={setSortKey}
      />
      <CSVImportModal
        visible={showCSV}
        onClose={() => setShowCSV(false)}
      />
    </View>
  );
}