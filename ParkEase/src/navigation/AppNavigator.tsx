import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../theme';

// Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MainTabNavigator from './MainTabNavigator';
import BookingScreen from '../screens/booking/BookingScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen} 
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
