import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Admin" component={AdminDashboardScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}