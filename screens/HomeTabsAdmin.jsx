import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import HomeAdmin from './HomeAdmin';
import GerenciarOperadores from './GerenciarOperadores';
import AlertasAdmin from './AlertasAdmin';
import PerfilAdmin from './PerfilAdmin'; 

const Tab = createBottomTabNavigator();

export default function HomeTabsAdmin() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      initialRouteName="HomeAdmin"
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
        name="HomeAdmin"
        component={HomeAdmin}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Gerenciar"
        component={GerenciarOperadores}
        options={{
          tabBarLabel: 'Operadores',
          tabBarIcon: ({ color, size }) => <FontAwesome name="users" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertasAdmin}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ color, size }) => <FontAwesome name="bell" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilAdmin}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
