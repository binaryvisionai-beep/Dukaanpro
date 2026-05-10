import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BrandColors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.primaryYellow,
        tabBarInactiveTintColor: BrandColors.textSecondary,
        tabBarStyle: { height: 64, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="inventory" options={{ title: 'Inventory', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="package-variant-closed" size={22} color={color} /> }} />
      <Tabs.Screen name="billing" options={{ title: 'Billing', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calculator-variant-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="scan-billing" options={{ title: 'Scan', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="barcode-scan" size={24} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-line" size={22} color={color} /> }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="newspaper-variant-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-outline" size={22} color={color} /> }} />
    </Tabs>
  );
}
