import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GerenciarOperadores from '../screens/GerenciarOperadores';
import Home from '../screens/Home';
import HomeAdmin from '../screens/HomeAdmin';
import HomeOperador from '../screens/HomeOperador';
import Login from '../screens/Login';
import Notificacoes from '../screens/Notificacoes';
import Patio from '../screens/Patio';
import PatioModelos from '../screens/PatioModelos';
import Perfil from '../screens/Perfil';
import QRCode from '../screens/QRCode';
import Register from '../screens/Register';
import Registro from '../screens/Registro';
import Relatorio from '../screens/Relatorio';

export type RootStackParamList = {
  Home: undefined;
  Login: { role: 'operador' | 'admin' };
  Register: { role: 'operador' | 'admin' };
  HomeOperador: undefined;
  HomeAdmin: undefined;
  GerenciarOperadores: undefined;
  PrototipoDeTela: { titulo: string };
  PatioModelos: undefined;
  Patio: { tipo: string };
  Registro: { canEdit?: boolean };
  QRCode: undefined;
  Notificacoes: undefined;
  Relatorio: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="HomeOperador" component={HomeOperador} />
      <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
      <Stack.Screen name="GerenciarOperadores" component={GerenciarOperadores} />
      <Stack.Screen name="PatioModelos" component={PatioModelos} />
      <Stack.Screen name="Patio" component={Patio} />
      <Stack.Screen name="Registro" component={Registro} />
      <Stack.Screen name="QRCode" component={QRCode} />
      <Stack.Screen name="Notificacoes" component={Notificacoes} />
      <Stack.Screen name="Relatorio" component={Relatorio} />
      <Stack.Screen name="Perfil" component={Perfil} />
    </Stack.Navigator>
  );
}
