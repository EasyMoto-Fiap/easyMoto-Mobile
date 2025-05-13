import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './contexts/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import LoginOperador from './screens/LoginOperador';
import CadastroOperador from './screens/CadastroOperador';
import LoginAdmin from './screens/LoginAdmin';
import CadastroAdmin from './screens/CadastroAdmin';
import HomeTabs from './screens/HomeTabs';
import PatioMapaRealComModal from './screens/PatioMapaRealComModal';
import DashboardFilial from './screens/DashboardFilial';
import QRCode from './screens/QRCode';
import Relatorios from './screens/Relatorios';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LoginOperador" component={LoginOperador} />
          <Stack.Screen name="CadastroOperador" component={CadastroOperador} />
          <Stack.Screen name="LoginAdmin" component={LoginAdmin} />
          <Stack.Screen name="CadastroAdmin" component={CadastroAdmin} />
          <Stack.Screen name="HomeOperador" component={HomeTabs} />
          <Stack.Screen name="PatioMapaReal" component={PatioMapaRealComModal} />
          <Stack.Screen name="DashboardFilial" component={DashboardFilial} />
          <Stack.Screen name="QRCode" component={QRCode} />
          <Stack.Screen name="Relatorios" component={Relatorios} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
