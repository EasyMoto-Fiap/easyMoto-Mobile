import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Login from '../screens/Login';

export type RootStackParamList = {
    Home: undefined;
    Login: { role: 'operador' | 'admin' };
    };

    const Stack = createNativeStackNavigator<RootStackParamList>();

    export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
    );
}
