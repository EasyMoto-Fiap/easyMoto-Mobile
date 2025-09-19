import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import HomeOperador from '../screens/HomeOperador';
import HomeAdmin from '../screens/HomeAdmin';
import GerenciarOperadores from '../screens/GerenciarOperadores';
import PrototipoDeTela from '../screens/PrototipoDeTela';
import PatioModelos from '../screens/PatioModelos';
import Patio from '../screens/Patio';
import Registro from '../screens/Registro';
import QRCode from '../screens/QRCode';
import Notificacoes from '../screens/Notificacoes';
import Relatorio from '../screens/Relatorio';
import Perfil from '../screens/Perfil';

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
      <Stack.Screen name="PrototipoDeTela" component={PrototipoDeTela} />
    </Stack.Navigator>
  );
}
