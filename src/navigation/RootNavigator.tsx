import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import HomeOperador from '../screens/HomeOperador';
import PrototipoDeTela from '../screens/PrototipoDeTela';
import PatioModelos from '../screens/PatioModelos';
import Patio from '../screens/Patio';
import RegistroDasMotos from '../screens/RegistroDasMotos';
import QRCode from '../screens/QRCode';
import Notificacoes from '../screens/Notificacoes';

export type RootStackParamList = {
  Home: undefined;
  Login: { role: 'operador' | 'admin' };
  Register: { role: 'operador' | 'admin' };
  HomeOperador: undefined;
  PrototipoDeTela: { titulo: string };
  PatioModelos: undefined;
  Patio: { tipo: string };
  RegistroDasMotos: { origem?: 'dashboard' | 'painel' };
  QRCode: undefined;
  Notificacoes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="HomeOperador" component={HomeOperador} />
      <Stack.Screen name="PatioModelos" component={PatioModelos} />
      <Stack.Screen name="Patio" component={Patio} />
      <Stack.Screen name="RegistroDasMotos" component={RegistroDasMotos} />
      <Stack.Screen name="QRCode" component={QRCode} />
      <Stack.Screen name="Notificacoes" component={Notificacoes} />
      <Stack.Screen name="PrototipoDeTela" component={PrototipoDeTela} />
    </Stack.Navigator>
  );
}
