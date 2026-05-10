import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native';

// ── Color System ──────────────────────────────────────────────
const C = {
  primaryYellow: '#F8CB2E',
  deepYellow: '#E6B800',
  darkBg: '#1A1A1A',
  surfaceWhite: '#FFFFFF',
  surfaceLight: '#F5F5F0',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  successGreen: '#34C759',
  dangerRed: '#FF3B30',
  warningOrange: '#FF9500',
  borderLight: '#E5E5EA',
  shadow: 'rgba(0,0,0,0.08)',
  creamBg: '#FAFAF5',
  sectionBg: '#F0EFE8',
};

const LANGUAGES = [
  { code: 'en', label: 'US', sublabel: 'English', flag: 'alpha-u-box' },
  { code: 'hi', label: 'IN', sublabel: 'हिन्दी', flagEmoji: true },
  { code: 'mr', label: 'मराठी', sublabel: 'Marathi', flagColor: true },
  { code: 'gu', label: 'ગુ', sublabel: 'Gujarati' },
  { code: 'ta', label: 'த', sublabel: 'Tamil' },
  { code: 'te', label: 'తె', sublabel: 'Telugu' },
];

type RowProps = {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  dark?: boolean;
};

function SettingsRow({ icon, iconColor, iconBg, label, sublabel, onPress, dark }: RowProps) {
  const bg = dark ? '#2C2C2E' : C.surfaceWhite;
  const textColor = dark ? '#FFFFFF' : C.textPrimary;
  const subColor = dark ? '#AEAEB2' : C.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: pressed ? 0.85 : 1,
        marginBottom: 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        </View>
        <View>
          <Text style={{ fontWeight: '600', fontSize: 15, color: textColor }}>{label}</Text>
          {sublabel ? (
            <Text style={{ fontSize: 11, color: subColor, marginTop: 1 }}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={subColor} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);

  const bg = darkMode ? C.darkBg : C.creamBg;
  const cardBg = darkMode ? '#2C2C2E' : C.surfaceWhite;
  const sectionLabelColor = darkMode ? '#AEAEB2' : C.textSecondary;
  const textPrimary = darkMode ? '#FFFFFF' : C.textPrimary;
  const textSecondary = darkMode ? '#AEAEB2' : C.textSecondary;
  const sectionBg = darkMode ? '#1C1C1E' : C.sectionBg;
  const rowBg = darkMode ? '#2C2C2E' : C.surfaceWhite;
  const borderColor = darkMode ? '#3A3A3C' : C.borderLight;

  const handleGSTDetails = () => Alert.alert('GST Details', 'GST: 27AABCS1429B1ZB\nScheme: Regular');
  const handleBackup = () => Alert.alert('Backup & Restore', 'Export your data as JSON or restore from a backup file.');
  const handleSavedPosts = () => Alert.alert('Saved Posts', 'Your bookmarked feed posts will appear here.');
  const handleSupport = () => Linking.openURL('mailto:support@dukaanpro.in');
  const handleLogout = () => Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: () => {} },
  ]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, letterSpacing: 0.3 }}>
          DUKAANPRO
        </Text>
        <Pressable
          onPress={() => Alert.alert('Notifications', 'No new notifications')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: rowBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="bell-outline" size={20} color={textPrimary} />
        </Pressable>
      </View>

      {/* ── Shop Profile Card ── */}
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        {/* Avatar */}
        <Pressable
          onPress={() => Alert.alert('Upload Photo', 'Choose a photo for your shop profile')}
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: C.primaryYellow,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: C.surfaceWhite,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            elevation: 6,
            marginBottom: 12,
          }}
        >
          <MaterialCommunityIcons name="store" size={44} color="#1A1A1A" />
          {/* Camera badge */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: C.surfaceWhite,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: C.primaryYellow,
            }}
          >
            <MaterialCommunityIcons name="camera" size={13} color={C.textPrimary} />
          </View>
        </Pressable>

        <Text style={{ fontSize: 19, fontWeight: '800', color: textPrimary }}>
          Sharma Kirana Store
        </Text>
        <Text style={{ fontSize: 13, color: textSecondary, marginTop: 3 }}>
          Owner: Rajesh Sharma • Since 2012
        </Text>

        {/* Premium badge */}
        <Pressable
          onPress={() => Alert.alert('Premium Member', 'You are a premium member!')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
            backgroundColor: darkMode ? '#3A3A00' : '#FFF8DC',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: C.primaryYellow + '80',
          }}
        >
          <MaterialCommunityIcons name="star-circle" size={14} color={C.deepYellow} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.deepYellow, letterSpacing: 0.5 }}>
            PREMIUM MEMBER
          </Text>
        </Pressable>
      </View>

      {/* ── GENERAL SETTINGS ── */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: sectionLabelColor,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          GENERAL SETTINGS
        </Text>

        {/* Language Card */}
        <View
          style={{
            backgroundColor: sectionBg,
            borderRadius: 18,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: sectionLabelColor,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            CHOOSE LANGUAGE
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {LANGUAGES.slice(0, 3).map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => setSelectedLang(lang.code)}
                  style={{
                    flex: 1,
                    backgroundColor: isSelected ? C.primaryYellow : rowBg,
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: borderColor,
                  }}
                >
                  {lang.code === 'mr' ? (
                    <MaterialCommunityIcons
                      name="flag"
                      size={18}
                      color={isSelected ? '#1A1A1A' : C.dangerRed}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: isSelected ? '#1A1A1A' : textPrimary,
                      }}
                    >
                      {lang.label}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: 11,
                      color: isSelected ? '#1A1A1A' : textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {lang.sublabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Dark Mode Row */}
        <View
          style={{
            backgroundColor: rowBg,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: darkMode ? '#3A3A3C' : '#F0EFE8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={darkMode ? 'moon-waning-crescent' : 'weather-night'}
                size={18}
                color={darkMode ? C.primaryYellow : C.textSecondary}
              />
            </View>
            <View>
              <Text style={{ fontWeight: '600', fontSize: 15, color: textPrimary }}>Dark Mode</Text>
              <Text style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}>
                Reduce eye strain
              </Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: C.borderLight, true: C.primaryYellow }}
            thumbColor={C.surfaceWhite}
            ios_backgroundColor={C.borderLight}
          />
        </View>
      </View>

      {/* ── BUSINESS TOOLS ── */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: sectionLabelColor,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          BUSINESS TOOLS
        </Text>

        <View
          style={{
            backgroundColor: rowBg,
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: borderColor,
          }}
        >
          {/* GST Details */}
          <Pressable
            onPress={handleGSTDetails}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: pressed ? (darkMode ? '#3A3A3C' : '#FAFAFA') : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={textSecondary} />
              <Text style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}>GST Details</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={textSecondary} />
          </Pressable>

          <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 16 }} />

          {/* Backup & Restore */}
          <Pressable
            onPress={handleBackup}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: pressed ? (darkMode ? '#3A3A3C' : '#FAFAFA') : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="restore" size={20} color={textSecondary} />
              <View>
                <Text style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}>
                  Backup & Restore
                </Text>
                <Text style={{ fontSize: 11, color: textSecondary, marginTop: 1 }}>EXPORT AS JSON</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={textSecondary} />
          </Pressable>

          <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 16 }} />

          {/* Saved Posts */}
          <Pressable
            onPress={handleSavedPosts}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: pressed ? (darkMode ? '#3A3A3C' : '#FAFAFA') : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="bookmark-outline" size={20} color={textSecondary} />
              <Text style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}>Saved Posts</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={textSecondary} />
          </Pressable>

          <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 16 }} />

          {/* Support & Help Desk */}
          <Pressable
            onPress={handleSupport}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: pressed ? (darkMode ? '#3A3A3C' : '#FAFAFA') : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color={textSecondary} />
              <Text style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}>
                Support & Help Desk
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* ── Logout ── */}
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Pressable
          onPress={handleLogout}
          android_ripple={{ color: 'rgba(255,59,48,0.08)' }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 16,
            paddingHorizontal: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="logout" size={20} color={C.dangerRed} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.dangerRed }}>Logout</Text>
        </Pressable>
      </View>

      {/* ── Footer ── */}
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '900',
            color: sectionLabelColor,
            letterSpacing: 2,
          }}
        >
          DUKAANPRO
        </Text>
        <Text style={{ fontSize: 12, color: sectionLabelColor, marginTop: 3 }}>
          Version 4.2.0 stable
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: sectionLabelColor,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          CRAFTED FOR BHARAT
        </Text>
      </View>
    </ScrollView>
  );
}