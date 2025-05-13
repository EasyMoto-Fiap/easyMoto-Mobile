import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardMotos from './DashboardMotos';
import PatioMapaRealComModal from './PatioMapaRealComModal';
import DashboardFilial from './DashboardFilial';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMotos" component={DashboardMotos} />
      <Stack.Screen name="DashboardMotosPop" component={DashboardMotos} />
      <Stack.Screen name="PatioMapaReal" component={PatioMapaRealComModal} />
      <Stack.Screen name="DashboardFilial" component={DashboardFilial} />
    </Stack.Navigator>
  );
}
