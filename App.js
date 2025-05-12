import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginOperador from './screens/LoginOperador';
import CadastroOperador from './screens/CadastroOperador';
import LoginAdmin from './screens/LoginAdmin';
import CadastroAdmin from './screens/CadastroAdmin';


import HomeScreen from './screens/HomeScreen';

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
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
