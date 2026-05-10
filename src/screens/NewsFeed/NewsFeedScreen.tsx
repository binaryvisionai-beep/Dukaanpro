import { useStore } from '@/src/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

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

// ─── Static Data ──────────────────────────────────────────────────────────────
const STORIES = [
  { id: '1', label: 'Trending', icon: 'fire' as const, unread: true, color: C.orange },
  { id: '2', label: 'Offers', icon: 'tag' as const, unread: true, color: C.yellow },
  { id: '3', label: 'New Products', icon: 'package-variant' as const, unread: true, color: C.green },
  { id: '4', label: 'Suppliers', icon: 'factory' as const, unread: false, color: C.textSecondary },
  { id: '5', label: 'News', icon: 'newspaper-variant' as const, unread: false, color: C.textSecondary },
  { id: '6', label: 'Tips', icon: 'lightbulb-on' as const, unread: false, color: C.textSecondary },
];

const CHIPS = ['All', 'News', 'Tips', 'Offers', 'Videos'];

const MOCK_FEED = [
  {
    id: 'reel-1',
    type: 'reel',
    tag: 'TAX TIPS',
    tagColor: C.green,
    title: 'Mastering GST Filings for Retailers',
    source: 'DukaanPro Tips',
    time: '3 hours ago',
    likes: 12400,
    shares: 2100,
    isLiked: false,
    isSaved: false,
    bgColor: '#0D0D0D',
  },
  {
    id: 'post-1',
    type: 'post',
    source: 'TechLogistics Global',
    sourceIcon: 'truck-delivery',
    time: '2 hours ago',
    text: 'Introducing the new Ultra-Lite Inventory Scanner. Reduce scan time by 40% with AI-powered barcode recognition.',
    likes: 842,
    comments: 45,
    isLiked: false,
    isSaved: false,
    hasImage: true,
    imageBg: '#1A1A1A',
  },
  {
    id: 'sponsored-1',
    type: 'sponsored',
    title: 'Buy 10 boxes Amul, get 1 free',
    subtitle: 'Exclusive wholesaler offer for DukaanPro premium members. Valid till Sunday.',
    cta: 'Claim on WhatsApp',
  },
  {
    id: 'post-2',
    type: 'post',
    source: 'GST Council India',
    sourceIcon: 'bank-outline',
    time: '5 hours ago',
    text: 'New GST rates effective from July 1st. Retailers in Tier-2 cities to benefit from revised slab structure for FMCG goods.',
    likes: 3210,
    comments: 128,
    isLiked: false,
    isSaved: false,
    hasImage: false,
    tag: 'NEWS',
    tagColor: '#1565C0',
    tagBg: '#E3F2FD',
  },
  {
    id: 'reel-2',
    type: 'reel',
    tag: 'BUSINESS TIP',
    tagColor: C.yellow,
    title: '5 Ways to Reduce Inventory Wastage This Season',
    source: 'RetailGuru India',
    time: '1 day ago',
    likes: 8900,
    shares: 1400,
    isLiked: false,
    isSaved: false,
    bgColor: '#101820',
  },
  {
    id: 'post-3',
    type: 'post',
    source: 'Amul Wholesale',
    sourceIcon: 'cup',
    time: '8 hours ago',
    text: 'Stock up on Amul Pro High Protein Lassi before the festive season rush. Available at wholesale pricing exclusively for app members.',
    likes: 1560,
    comments: 73,
    isLiked: false,
    isSaved: true,
    hasImage: false,
    tag: 'OFFER',
    tagColor: '#B8860B',
    tagBg: '#FFF8E1',
  },
  {
    id: 'sponsored-2',
    type: 'sponsored',
    title: 'Get ₹500 credit on first POS terminal',
    subtitle: 'Upgrade to DukaanPro POS. Instant setup, UPI + card support included.',
    cta: 'Know More',
  },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, backgroundColor: C.white, borderRadius: 20, marginBottom: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.border }} />
        <View style={{ gap: 6 }}>
          <View style={{ width: 120, height: 12, borderRadius: 6, backgroundColor: C.border }} />
          <View style={{ width: 80, height: 10, borderRadius: 5, backgroundColor: C.border }} />
        </View>
      </View>
      <View style={{ width: '100%', height: 180, borderRadius: 14, backgroundColor: C.border }} />
      <View style={{ marginTop: 12, gap: 6 }}>
        <View style={{ width: '90%', height: 11, borderRadius: 5, backgroundColor: C.border }} />
        <View style={{ width: '70%', height: 11, borderRadius: 5, backgroundColor: C.border }} />
      </View>
    </Animated.View>
  );
}

// ─── Heart Burst Animation ────────────────────────────────────────────────────
function HeartBurst({ x, y, visible, onDone }: { x: number; y: number; visible: boolean; onDone: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(1);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.6, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - 24, top: y - 24, transform: [{ scale }], opacity }}
    >
      <MaterialCommunityIcons name="heart" size={48} color={C.yellow} />
    </Animated.View>
  );
}

// ─── Story Viewer Modal ────────────────────────────────────────────────────────
function StoryViewer({ story, onClose }: { story: typeof STORIES[0] | null; onClose: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!story) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 5000, useNativeDriver: false }).start(({ finished }) => {
      if (finished) onClose();
    });
    return () => progress.stopAnimation();
  }, [story]);

  if (!story) return null;
  const barW = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: '#000' }} onPress={onClose}>
        {/* Progress bar */}
        <View style={{ position: 'absolute', top: 56, left: 16, right: 16, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, zIndex: 10 }}>
          <Animated.View style={{ height: 3, borderRadius: 3, backgroundColor: C.yellow, width: barW }} />
        </View>
        {/* Close */}
        <Pressable onPress={onClose} style={{ position: 'absolute', top: 72, right: 20, zIndex: 20 }}>
          <MaterialCommunityIcons name="close" size={26} color="#fff" />
        </Pressable>
        {/* Content */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: story.color + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name={story.icon} size={40} color={story.color} />
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{story.label}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>Tap to dismiss</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────
function SearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: C.white, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.light, borderRadius: 14, paddingHorizontal: 14, height: 44 }}>
              <MaterialCommunityIcons name="magnify" size={18} color={C.textSecondary} />
              <TextInput
                autoFocus
                value={q}
                onChangeText={setQ}
                placeholder="Search feed..."
                placeholderTextColor={C.textSecondary}
                style={{ flex: 1, marginLeft: 8, fontSize: 15, color: C.textPrimary }}
              />
            </View>
            <Pressable onPress={onClose}>
              <Text style={{ color: C.yellow, fontWeight: '700', fontSize: 15 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </View>
    </Modal>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────
function ReelCard({ item, onToggleLike, onToggleSave }: any) {
  const [burst, setBurst] = useState({ visible: false, x: 0, y: 0 });
  const lastTap = useRef(0);
  const scale = useRef(new Animated.Value(1)).current;

  const handleDoubleTap = (e: any) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const { locationX, locationY } = e.nativeEvent;
      setBurst({ visible: true, x: locationX, y: locationY });
      if (!item.isLiked) onToggleLike(item.id);
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
    lastTap.current = now;
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable onPress={handleDoubleTap}>
        <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: item.bgColor, minHeight: 280 }}>
          {/* Dark gradient image placeholder */}
          <View style={{ height: 260, backgroundColor: item.bgColor, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Fake dark image bg */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} />
            {/* Icon as placeholder for video/image */}
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="play-circle" size={48} color="rgba(255,255,255,0.4)" />
            </View>
            {/* Right actions */}
            <View style={{ position: 'absolute', right: 12, bottom: 60, gap: 20 }}>
              <Pressable onPress={() => onToggleSave(item.id)}>
                <MaterialCommunityIcons name={item.isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color="#fff" />
              </Pressable>
              <Pressable>
                <MaterialCommunityIcons name="comment-outline" size={26} color="#fff" />
              </Pressable>
            </View>
            {/* Tag */}
            <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: item.tagColor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>{item.tag}</Text>
            </View>
          </View>
          {/* Bottom overlay */}
          <View style={{ backgroundColor: C.dark, padding: 16 }}>
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 12 }}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Pressable onPress={() => onToggleLike(item.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name={item.isLiked ? 'heart' : 'heart-outline'} size={22} color={item.isLiked ? C.red : '#fff'} />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
                </Text>
              </Pressable>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="share-outline" size={22} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {item.shares >= 1000 ? `${(item.shares / 1000).toFixed(1)}k` : item.shares}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <HeartBurst x={burst.x} y={burst.y} visible={burst.visible} onDone={() => setBurst(b => ({ ...b, visible: false }))} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ item, onToggleLike, onToggleSave }: any) {
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState({ visible: false, x: 0, y: 0 });
  const lastTap = useRef(0);

  const handleDoubleTap = (e: any) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const { locationX, locationY } = e.nativeEvent;
      setBurst({ visible: true, x: locationX, y: locationY });
      if (!item.isLiked) onToggleLike(item.id);
    }
    lastTap.current = now;
  };

  return (
    <View style={{ backgroundColor: C.white, borderRadius: 20, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name={item.sourceIcon ?? 'newspaper-variant'} size={20} color={C.textPrimary} />
          </View>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 14, color: C.textPrimary }}>{item.source}</Text>
            <Text style={{ fontSize: 11, color: C.textSecondary }}>{item.time}</Text>
          </View>
        </View>
        <Pressable>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={C.textSecondary} />
        </Pressable>
      </View>

      {/* Text */}
      <Pressable onPress={handleDoubleTap} style={{ paddingHorizontal: 14 }}>
        <Text style={{ fontSize: 14, color: C.textPrimary, lineHeight: 21 }} numberOfLines={expanded ? undefined : 3}>
          {item.text}
        </Text>
        {item.text?.length > 120 && (
          <Pressable onPress={() => setExpanded(e => !e)}>
            <Text style={{ color: C.yellow, fontWeight: '700', fontSize: 13, marginTop: 4 }}>{expanded ? 'Show less' : 'Read more'}</Text>
          </Pressable>
        )}
        <HeartBurst x={burst.x} y={burst.y} visible={burst.visible} onDone={() => setBurst(b => ({ ...b, visible: false }))} />
      </Pressable>

      {/* Image */}
      {item.hasImage && (
        <Pressable
          onPress={() => Alert.alert('Image', 'Full-screen viewer')}
          style={{ marginTop: 12, height: 200, backgroundColor: item.imageBg ?? C.light, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="image-outline" size={48} color="rgba(255,255,255,0.2)" />
          {/* Simulated device image */}
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 120, height: 150, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="barcode-scan" size={48} color={C.yellow} />
            </View>
          </View>
        </Pressable>
      )}

      {/* Tag badge */}
      {item.tag && (
        <View style={{ marginHorizontal: 14, marginTop: 10 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: item.tagBg ?? C.light, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: item.tagColor ?? C.textSecondary, letterSpacing: 0.3 }}>{item.tag}</Text>
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: C.border, marginTop: 12, marginHorizontal: 14 }} />

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 20 }}>
        <Pressable onPress={() => onToggleLike(item.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={item.isLiked ? 'heart' : 'heart-outline'} size={21} color={item.isLiked ? C.red : C.textSecondary} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: item.isLiked ? C.red : C.textSecondary }}>
            {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
          </Text>
        </Pressable>
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="comment-outline" size={21} color={C.textSecondary} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.textSecondary }}>{item.comments}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => onToggleSave(item.id)}>
          <MaterialCommunityIcons name={item.isSaved ? 'bookmark' : 'bookmark-outline'} size={21} color={item.isSaved ? C.yellow : C.textSecondary} />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Share', 'Sharing options')}>
          <MaterialCommunityIcons name="export-variant" size={21} color={C.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Sponsored Card ───────────────────────────────────────────────────────────
function SponsoredCard({ item }: any) {
  return (
    <View style={{ backgroundColor: C.white, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: C.yellow + '70', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary }}>SPONSORED</Text>
        <MaterialCommunityIcons name="information-outline" size={13} color={C.textSecondary} />
      </View>
      <View style={{ flexDirection: 'row', gap: 14, padding: 14, paddingTop: 8 }}>
        <View style={{ width: 70, height: 70, borderRadius: 14, backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MaterialCommunityIcons name="package-variant-closed" size={32} color={C.deepYellow} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary, marginBottom: 4, lineHeight: 21 }}>{item.title}</Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, lineHeight: 18 }}>{item.subtitle}</Text>
          <Pressable
            onPress={() => Alert.alert('Offer', 'Opening WhatsApp...')}
            style={{ marginTop: 10, backgroundColor: C.yellow, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <MaterialCommunityIcons name="whatsapp" size={15} color={C.dark} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.dark }}>{item.cta}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function NewsFeedScreen() {
  const { feedItems = [], toggleLike, toggleSavePost } = useStore();

  const [activeChip, setActiveChip] = useState('All');
  const [activeStory, setActiveStory] = useState<typeof STORIES[0] | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedData, setFeedData] = useState<any[]>([]);

  // Merge store items with mock
  useEffect(() => {
    const timer = setTimeout(() => {
      const storeItems = feedItems.map((fi: any) => ({ ...fi, type: fi.type ?? 'post' }));
      setFeedData(storeItems.length > 0 ? storeItems : MOCK_FEED);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [feedItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setFeedData([...MOCK_FEED].reverse().concat(MOCK_FEED.slice(0, 2)));
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleLikeLocal = useCallback((id: string) => {
    setFeedData(prev => prev.map(item =>
      item.id === id
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : (item.likes ?? 0) + 1 }
        : item
    ));
    try { toggleLike?.(id); } catch (_) {}
  }, []);

  const toggleSaveLocal = useCallback((id: string) => {
    setFeedData(prev => prev.map(item =>
      item.id === id ? { ...item, isSaved: !item.isSaved } : item
    ));
    try { toggleSavePost?.(id); } catch (_) {}
  }, []);

  const filteredFeed = activeChip === 'All'
    ? feedData
    : feedData.filter(item => {
        if (activeChip === 'News') return item.type === 'post' && item.tag === 'NEWS';
        if (activeChip === 'Tips') return item.tag?.includes('TIP');
        if (activeChip === 'Offers') return item.type === 'sponsored' || item.tag === 'OFFER';
        if (activeChip === 'Videos') return item.type === 'reel';
        return true;
      });

  const renderItem = useCallback(({ item }: any) => {
    if (item.type === 'reel') return <ReelCard item={item} onToggleLike={toggleLikeLocal} onToggleSave={toggleSaveLocal} />;
    if (item.type === 'sponsored') return <SponsoredCard item={item} />;
    return <PostCard item={item} onToggleLike={toggleLikeLocal} onToggleSave={toggleSaveLocal} />;
  }, [toggleLikeLocal, toggleSaveLocal]);

  // Animated refresh spinner
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (refreshing) {
      Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true })).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [refreshing]);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ flex: 1, backgroundColor: C.light }}>
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.dark, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="storefront" size={18} color={C.dark} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: C.white, letterSpacing: 0.5 }}>DUKAANPRO</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => setSearchVisible(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="magnify" size={20} color={C.white} />
            </Pressable>
            <Pressable
              onPress={() => Alert.alert('Notifications', '3 new alerts')}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={C.white} />
            </Pressable>
          </View>
        </View>

        {/* Stories Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingBottom: 2 }}>
          {STORIES.map(s => (
            <Pressable key={s.id} onPress={() => setActiveStory(s)} style={{ alignItems: 'center', gap: 7 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: s.unread ? C.dark : '#2A2A2A',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2.5,
                borderColor: s.unread ? C.yellow : '#3A3A3A',
              }}>
                <MaterialCommunityIcons name={s.icon} size={26} color={s.unread ? s.color : C.textSecondary} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: s.unread ? C.white : C.textSecondary, textAlign: 'center' }}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Topic Filter Chips */}
      <View style={{ backgroundColor: C.white, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CHIPS.map(chip => {
            const active = activeChip === chip;
            return (
              <Pressable
                key={chip}
                onPress={() => setActiveChip(chip)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? C.yellow : C.light,
                  borderWidth: active ? 0 : 1,
                  borderColor: C.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {chip === 'Videos' && <MaterialCommunityIcons name="play-circle-outline" size={14} color={active ? C.dark : C.textSecondary} />}
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? C.dark : C.textSecondary }}>{chip}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Refreshing indicator */}
      {refreshing && (
        <View style={{ alignItems: 'center', paddingVertical: 10, backgroundColor: C.light }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="loading" size={22} color={C.yellow} />
          </Animated.View>
        </View>
      )}

      {/* Feed */}
      {loading ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : (
        <FlashList
          data={filteredFeed}
          estimatedItemSize={300}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 110 }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.yellow}
              colors={[C.yellow]}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            // Append more mock items for infinite scroll simulation
            setFeedData(prev => [...prev, ...MOCK_FEED.slice(0, 3).map(i => ({ ...i, id: i.id + '_' + Date.now() }))]);
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={48} color={C.border} />
              <Text style={{ marginTop: 12, fontSize: 15, color: C.textSecondary, fontWeight: '600' }}>No posts found</Text>
            </View>
          }
        />
      )}

      <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />
      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </View>
  );
}