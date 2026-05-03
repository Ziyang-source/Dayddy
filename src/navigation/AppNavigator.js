import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your screens
import ProfileScreen from '../../Dayddy/src/screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Auth screens
import SplashScreen from '../../Dayddy/src/screens/auth/SplashScreen';
import OnboardingScreen from '../../Dayddy/src/screens/auth/OnboardingScreen';
import LoginScreen from '../../Dayddy/src/screens/auth/LoginScreen';
import RegisterScreen from '../../Dayddy/src/screens/auth/RegisterScreen';
import HelpScreen from '../../Dayddy/src/screens/auth/HelpScreen';
import ForgotPasswordScreen from '../../Dayddy/src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../../Dayddy/src/screens/auth/ResetPasswordScreen';

// Task screens
import ToDoListScreen from '../../Dayddy/src/screens/task/ToDoListScreen';
import CreateTaskScreen from '../../Dayddy/src/screens/task/CreateTaskScreen';
import TaskDetailScreen from '../../Dayddy/src/screens/task/TaskDetailScreen';

// Event screens
import EventListScreen from '../../Dayddy/src/screens/event/EventListScreen';
import CreateEventScreen from '../../Dayddy/src/screens/event/CreateEventScreen';
import EventDetailScreen from '../../Dayddy/src/screens/event/EventDetailScreen';

// Home screens (kaiying)
import HomeCalendarScreen from '../../Dayddy/src/screens/home/HomeCalendarScreen';
import DailyViewScreen from '../../Dayddy/src/screens/home/DailyViewScreen';
import UpcomingEventsScreen from '../../Dayddy/src/screens/home/UpcomingEventsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function AuthTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Register" component={RegisterScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Home" component={HomeCalendarScreen} />      
      <Tab.Screen name="TodoList" component={ToDoListScreen} />
      <Tab.Screen name="EventList" component={EventListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
    function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: '#000000',
        headerStyle: { backgroundColor: '#FFF6EE' },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="User App"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
function MainScreen({ navigation }) {
  React.useEffect(() => {
    AsyncStorage.getItem('userRole').then(role => {
      if (role === 'admin') {
        navigation.replace('AdminDashboard');
      }
    });
  }, []);

  return <MainTabs />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthTabs} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDrawer} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Home" component={ToDoListScreen} />
        <Stack.Screen name="TodoList" component={ToDoListScreen} />
        <Stack.Screen name="EventList" component={EventListScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="HomeCalendar" component={HomeCalendarScreen} />
        <Stack.Screen name="DailyView" component={DailyViewScreen} />
        <Stack.Screen name="UpcomingEvents" component={UpcomingEventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}