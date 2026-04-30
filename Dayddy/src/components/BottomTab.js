import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomTab = ({ activeRoute, navigation }) => {
  
  const handlePress = (routeName) => {
    navigation.navigate('Auth', { screen: routeName });
  };

  const renderTabItem = (name, iconName, label, routeTarget) => {
    const isActive = activeRoute === name;

    return (
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handlePress(routeTarget)}
      >
        {isActive ? (
          <View style={styles.activeTabBg}>
            <Icon name={iconName} size={24} color="#FF8FA3" />
            <Text style={[styles.tabLabel, { color: '#7E5B64' }]}>{label}</Text>
          </View>
        ) : (

          <View style={styles.inactiveTab}>
            <Icon name={iconName} size={24} color="#A0A0A0" />
            <Text style={styles.tabLabel}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBar}>
      {renderTabItem('Login', 'login', 'LOGIN', 'Login')}
      {renderTabItem('Register', 'account-plus-outline', 'JOIN', 'Register')}
      {renderTabItem('Help', 'help-circle-outline', 'HELP', 'Help')}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 85,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 15,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  tabItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  activeTabBg: {
    backgroundColor: '#FFF0F3', 
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: { 
    fontSize: 10, 
    fontWeight: '900', 
    marginTop: 4, 
    color: '#A0A0A0' 
  }
});

export default BottomTab;