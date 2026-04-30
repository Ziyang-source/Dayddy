import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, Radius, Shadow } from '../theme/theme';

interface NavItem {
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

interface BottomNavBarProps {
  activeRoute: string;
  navigation?: any;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'Home' },
  { label: 'To-Do', icon: 'check-circle-outline', activeIcon: 'check-circle', route: 'TodoList' },
  { label: 'Events', icon: 'calendar-outline', activeIcon: 'calendar', route: 'EventList' },
  { label: 'Profile', icon: 'account-outline', activeIcon: 'account', route: 'Profile' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, navigation }) => {
  const navHook = useNavigation();
  const nav = navigation ?? navHook;
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setIsGuest(role === 'guest');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleAddPress = () => {
    if (isGuest) {
      Alert.alert(
        'Login Required', 
        'Guests cannot create tasks or events. Please log in to unlock full features. ✨'
      );
      return;
    }

    if (activeRoute === 'TodoList') {
      (nav as any).navigate('CreateTask');
    } else if (activeRoute === 'EventList' || activeRoute === 'Events') {
      (nav as any).navigate('CreateEvent');
    } else {
      (nav as any).navigate('CreateTask');
    }
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <NavButton 
          key={item.route} 
          item={item} 
          activeRoute={activeRoute} 
          navigation={nav} 
        />
      ))}

      <TouchableOpacity
        style={[styles.addButton, isGuest && styles.disabledButton]}
        onPress={handleAddPress}
        activeOpacity={isGuest ? 1 : 0.8}
      >
        <MaterialCommunityIcons 
          name="plus" 
          size={32} 
          color={isGuest ? Colors.secondary + '60' : Colors.surface} 
        />
      </TouchableOpacity>

      {NAV_ITEMS.slice(2, 4).map((item) => (
        <NavButton 
          key={item.route} 
          item={item} 
          activeRoute={activeRoute} 
          navigation={nav} 
        />
      ))}
    </View>
  );
};

const NavButton = ({ item, activeRoute, navigation }: { item: NavItem, activeRoute: string, navigation: any }) => {
  const isActive = activeRoute === item.route;
  return (
    <TouchableOpacity
      style={[styles.navItem, isActive && styles.navItemActive]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={isActive ? item.activeIcon : item.icon}
        size={24}
        color={isActive ? Colors.primary : Colors.secondary + '80'}
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface + 'F2',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '14',
    paddingHorizontal: 10,
    paddingBottom: 10,
    ...Shadow.soft,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: -6},
    elevation: 14,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navItemActive: {},
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    ...Shadow.soft,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  label: {
    fontSize: 10,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.secondary + '80',
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bodyBold,
  },
});

export default BottomNavBar;