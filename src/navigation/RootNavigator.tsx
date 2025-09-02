import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import HomeOperador from '../screens/HomeOperador';
import PrototipoDeTela from '../screens/PrototipoDeTela';

export type RootStackParamList = {
  Home: undefined;
  Login: { role: 'operador' | 'admin' };
  Register: { role: 'operador' | 'admin' };
  HomeOperador: undefined;
  PrototipoDeTela: { titulo: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="HomeOperador" component={HomeOperador} />
      <Stack.Screen name="PrototipoDeTela" component={PrototipoDeTela} />
    </Stack.Navigator>
  );
}
