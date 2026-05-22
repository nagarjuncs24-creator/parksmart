import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme';
import { Map, Calendar, AlertTriangle, ShieldCheck, User } from 'lucide-react-native';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import HistoryScreen from '../screens/session/HistoryScreen';
import ReportScreen from '../screens/session/ReportScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 100}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarIcon: ({ color, size, focused }) => {
          let IconComponent;
          switch (route.name) {
            case 'Finder':
              IconComponent = Map;
              break;
            case 'History':
              IconComponent = Calendar;
              break;
            case 'Community':
              IconComponent = AlertTriangle;
              break;
            case 'Admin':
              IconComponent = ShieldCheck;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Map;
          }

          return (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <IconComponent size={size - 2} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View style={styles.indicator} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Finder" component={HomeScreen} options={{ title: 'Find' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Community" component={ReportScreen} options={{ title: 'Report' }} />
      <Tab.Screen name="Admin" component={AdminDashboard} options={{ title: 'Admin' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 16,
    right: 16,
    height: 70,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Slate 900 translucent
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});
