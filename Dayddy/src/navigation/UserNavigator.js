import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ToDoListScreen from '../screens/ToDoListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import BottomNavBar from './BottomNavBar';

const Tab = createBottomTabNavigator();

export default function UserNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <BottomNavBar
            navigation={props.navigation}
            activeRoute={props.state.routeNames[props.state.index]}
          />
        )}
      >
        <Tab.Screen name="Home" component={ToDoListScreen} />
        <Tab.Screen name="TodoList" component={ToDoListScreen} />
        <Tab.Screen name="EventDetail" component={EventDetailScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="CreateTask" component={CreateTaskScreen} />
        <Tab.Screen name="CreateEvent" component={CreateEventScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
