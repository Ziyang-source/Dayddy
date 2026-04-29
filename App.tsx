import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ToDoListScreen from './src/screens/ToDoListScreen';
import EventListScreen from './src/screens/EventListScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TodoList" component={ToDoListScreen} />
        <Stack.Screen name="EventList" component={EventListScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Admin" component={AdminDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}