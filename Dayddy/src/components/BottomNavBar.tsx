import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
  navigation: any;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'EventDetail' },
  { label: 'To-Do', icon: 'check-circle-outline', activeIcon: 'check-circle', route: 'TodoList' },
  { label: 'Events', icon: 'calendar-outline', activeIcon: 'calendar', route: 'UpcomingEvents' },
  { label: 'Profile', icon: 'account-outline', activeIcon: 'account', route: 'Profile' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, navigation }) => {
  
  const handleAddPress = () => {
    if (activeRoute === 'TodoList') {
      navigation.navigate('CreateTask');
    } else if (activeRoute === 'EventDetail' || activeRoute === 'Events') {
      navigation.navigate('CreateEvent');
    } else {
      navigation.navigate('CreateTask');
    }
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <NavButton 
          key={item.route} 
          item={item} 
          activeRoute={activeRoute} 
          navigation={navigation} 
        />
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color={Colors.surface} />
      </TouchableOpacity>

      {NAV_ITEMS.slice(2, 4).map((item) => (
        <NavButton 
          key={item.route} 
          item={item} 
          activeRoute={activeRoute} 
          navigation={navigation} 
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
    paddingHorizontal: 10,
    paddingBottom: 10,
    ...Shadow.soft,
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