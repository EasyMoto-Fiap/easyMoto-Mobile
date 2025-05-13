import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import HomeOperador from './HomeOperador';
import DashboardStack from './DashboardStack';
import QRCode from './QRCode';
import Alertas from './Alertas';
import Perfil from './Perfil';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      initialRouteName="Início"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00c853',
        tabBarInactiveTintColor: isDark ? '#ccc' : '#888',
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#fff',
          paddingTop: 5,
          height: 85,
          borderTopColor: isDark ? '#222' : '#eee',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={HomeOperador}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="QR Code"
        component={QRCode}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="camera" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={Alertas}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="bell" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
