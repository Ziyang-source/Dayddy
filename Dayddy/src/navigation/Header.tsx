import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontFamily } from '../theme/theme';

interface HeaderProps {
  appTitle: string;
  onBackPress?: () => void; // Added for navigation
}

const Header: React.FC<HeaderProps> = ({ appTitle, onBackPress }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          {onBackPress && (
            <TouchableOpacity 
              onPress={onBackPress} 
              style={styles.backBtn}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            >
              <MaterialCommunityIcons name="chevron-left" size={34} color="#7e5b64" />
            </TouchableOpacity>
          )}
          <View style={styles.logoRow}>
            <Text style={styles.appTitle}>{appTitle}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fffbff',
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 48,
    height: 48,
    marginRight: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f6c3',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 24,
    fontFamily: FontFamily.headlineBold,
    fontWeight: '800',
    color: '#7e5b64',
  },
});

export default Header;