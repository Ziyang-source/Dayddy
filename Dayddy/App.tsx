import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth screens - minimal test
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HelpScreen from './src/screens/auth/HelpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

// Main screens
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ToDoListScreen from './src/screens/task/ToDoListScreen';
import CreateTaskScreen from './src/screens/task/CreateTaskScreen';
import CreateEventScreen from './src/screens/event/CreateEventScreen';
import TaskDetailScreen from './src/screens/task/TaskDetailScreen';
import EventDetailScreen from './src/screens/event/EventDetailScreen';
import HomeCalendarScreen from './src/screens/home/HomeCalendarScreen';
import DailyViewScreen from './src/screens/home/DailyViewScreen';
import UpcomingEventsScreen from './src/screens/home/UpcomingEventsScreen';
import EmptyStateScreen from './src/screens/home/EmptyStateScreen';

const RootStack = createStackNavigator();
const AuthStackNav = createStackNavigator();
const MainStackNav = createStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    
    <AuthStackNav.Navigator screenOptions={{ 
        headerShown: false,
        animation: 'none',
      }}
    >
      <AuthStackNav.Screen name="Splash" component={SplashScreen} />
      <AuthStackNav.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
      <AuthStackNav.Screen name="Help" component={HelpScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStackNav.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStackNav.Navigator>
  );
}

function MainStack() {
  return (
    <MainStackNav.Navigator
      initialRouteName="HomeCalendar"
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <MainStackNav.Screen name="HomeCalendar" component={HomeCalendarScreen} />
      <MainStackNav.Screen name="DailyView" component={DailyViewScreen} />
      <MainStackNav.Screen name="UpcomingEvents" component={UpcomingEventsScreen} />
      <MainStackNav.Screen name="EmptyState" component={EmptyStateScreen} />

      <MainStackNav.Screen name="TodoList" component={ToDoListScreen} />
      <MainStackNav.Screen name="CreateTask" component={CreateTaskScreen} />
      <MainStackNav.Screen name="TaskDetail" component={TaskDetailScreen} />

      <MainStackNav.Screen name="CreateEvent" component={CreateEventScreen} />
      <MainStackNav.Screen name="EventDetail" component={EventDetailScreen} />

      <MainStackNav.Screen name="Profile" component={ProfileScreen} />
    
    </MainStackNav.Navigator>
  );
}

function AdminStack() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true, 
        headerTintColor: '#000000',
        headerStyle: { backgroundColor: '#FFF6EE' },
      }}
    >

      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Dashboard' }}
      />

      <Drawer.Screen 
        name="UserView" 
        component={MainStack} 
        options={{ title: 'User Interface', headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

// DEBUG: Test with simple loading screen first
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F7' }}>
    <Text>Loading Dayddy...</Text>
    <ActivityIndicator size="large" color="#CEA3B7" style={{ marginTop: 20 }} />
  </View>
);

export default function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        console.log('[App] Checking AsyncStorage...');
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        console.log('[App] Token:', token);
        setUserToken(token);
        setUserRole(role);
        // Simulate loading time
        setTimeout(() => setIsLoading(false), 500);
      } catch (e) {
        console.error('[App] AsyncStorage error:', e);
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  console.log('[App] Rendering. isLoading:', isLoading, 'userToken:', userToken);

  if (isLoading) {
    return <LoadingScreen />;
  }

  let initialRoute = 'Auth';
if (userToken) {
  initialRoute = userRole === 'admin' ? 'Admin' : 'Main';
}

return (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <RootStack.Screen name="Auth" component={AuthStack} />
      <RootStack.Screen name="Main" component={MainStack} />
      <RootStack.Screen name="Admin" component={AdminStack} /> 
    </RootStack.Navigator>
  </NavigationContainer>
);
}