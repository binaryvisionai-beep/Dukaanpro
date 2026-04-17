import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from '../../src/components/DashboardScreen';

export default function HomeTab() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <DashboardScreen />
    </SafeAreaView>
  );
}