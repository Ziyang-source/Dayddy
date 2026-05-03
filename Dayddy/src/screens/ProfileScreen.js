import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { syncProfileToCloud, getUserStats } from '../services/apiService';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../navigation/Header';
import BottomNavBar from '../navigation/BottomNavBar';
import { Colors, FontFamily, Radius } from '../theme/theme';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [stats, setStats] = useState({ totalTasks: 0, totalEvents: 0 });

  const loadProfile = useCallback(async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setIsGuest(role === 'guest');

      const currentLoginUsername = await AsyncStorage.getItem('username');
      const currentLoginEmail = await AsyncStorage.getItem('userEmail');

      const savedProfileStr = await AsyncStorage.getItem('@dayddy_profile');
      
      if (savedProfileStr) {
        const parsedProfile = JSON.parse(savedProfileStr);
        if (parsedProfile.email !== currentLoginEmail) {
          setProfile({
            name: currentLoginUsername || '',
            email: currentLoginEmail || '',
            phone: '',
            bio: '',
          });
          await AsyncStorage.removeItem('@dayddy_profile');
        } else {
          setProfile(parsedProfile);
        }
      } else {
        setProfile(prev => ({
          ...prev,
          name: currentLoginUsername || '',
          email: currentLoginEmail || '',
        }));
      }

      if (currentLoginEmail && role !== 'guest') {
        try {
          const data = await getUserStats(currentLoginEmail);
          console.log("Frontend received stats:", data);
          if (data) {
            setStats({
              totalTasks: data.totalTasks || 0,
              totalEvents: data.totalEvents || 0
            });
          }
        } catch (err) {
          console.log("Stats fetch failed:", err);
        }
      }
    } catch (error) {
      console.error('Load Profile Error:', error);
      Alert.alert('Error', 'Could not load profile data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true); 
      loadProfile();
    }, [loadProfile])
  );

  const updateField = (field, value) => {
    if (isGuest) return;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const isEmailValid = email => /\S+@\S+\.\S+/.test(email.trim());

  const handleSave = async () => {
    if (isGuest) {
      Alert.alert('Access Denied', 'Guests cannot modify profile settings.');
      return;
    }

    if (!profile.name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }

    if (!isEmailValid(profile.email)) {
      Alert.alert('Validation', 'Please enter a valid email.');
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem('@dayddy_profile', JSON.stringify(profile));
      Alert.alert('Success', 'Profile saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloudSync = async () => {
    if (isGuest) {
      Alert.alert('Access Denied', 'Cloud sync is not available for guests.');
      return;
    }

    if (!profile.name.trim()) {
      Alert.alert('Validation', 'Please add your name before cloud sync.');
      return;
    }

    if (!isEmailValid(profile.email)) {
      Alert.alert('Validation', 'Please enter a valid email before cloud sync.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncProfileToCloud(profile);

      if (result.success) {
        await AsyncStorage.setItem('userEmail', profile.email);
        await AsyncStorage.setItem('username', profile.name);

        Alert.alert('Success', 'Profile synced to cloud and local storage updated!');
      }
    } catch (error) {
      Alert.alert('Sync Failed', error.message || 'Check server connection');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userToken',
                'userRole',
                'username',
                'userEmail',
                'userId'
              ]);
              console.log('[Logout] AsyncStorage cleared, navigating to Auth');
              const parent = navigation.getParent && navigation.getParent();
              if (parent && parent.reset) {
                parent.reset({ index: 0, routes: [{ name: 'Auth', params: { screen: 'Login' } }] });
              } else {
                navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'left', 'right']}
    >
      <Header
        appTitle="Dayddy"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarBlock}>
            <Text style={styles.avatarEmoji}>🐼</Text>
          </View>

          {!isGuest && (
            <TouchableOpacity style={styles.editChip}>
              <Text style={styles.editChipText}>✎</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.nameText}>
            {isGuest ? 'Guest User' : (profile.name.trim() || 'CozyPanda')}
          </Text>
          <Text style={styles.taglineText}>
            {isGuest
              ? 'Log in to save your tiny wins!'
              : (profile.bio.trim() || 'Some days are better with tiny wins')}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statWarm]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>
              {isGuest ? '0' : stats.totalTasks}
            </Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>

          <View style={[styles.statCard, styles.statCool]}>
            <Text style={styles.statIcon}>💜</Text>
            <Text style={styles.statValue}>
              {isGuest ? '0' : stats.totalEvents}
            </Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
        </View>

        {isLoading ? (
          <Text style={styles.helperText}>Loading profile...</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <View style={[styles.formCard, isGuest && styles.disabledCard]}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  placeholder="Enter full name"
                  placeholderTextColor="#B0959D"
                  value={profile.name}
                  onChangeText={value => updateField('name', value)}
                  style={styles.input}
                  editable={!isGuest}
                />
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter email address"
                  placeholderTextColor="#B0959D"
                  value={profile.email}
                  onChangeText={value => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!isGuest}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (isSaving || isGuest) && styles.buttonDisabled
              ]}
              onPress={handleSave}
              disabled={isSaving || isGuest}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.syncButton,
                (isSyncing || isGuest) && styles.buttonDisabled
              ]}
              onPress={handleCloudSync}
              disabled={isSyncing || isGuest}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>
                {isGuest ? 'Exit Guest Mode' : 'Log Out'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 120 }} />
          </>
        )}
      </ScrollView>

      <BottomNavBar
        activeRoute="Profile"
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF6EE',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  profileCard: {
    borderRadius: Radius.lg,
    backgroundColor: '#FFFDF8',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
    elevation: 2,
  },
  avatarBlock: {
    width: 78,
    height: 78,
    borderRadius: Radius.lg,
    backgroundColor: '#0F0B10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 38
  },
  editChip: {
    position: 'absolute',
    right: 20,
    top: 72,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7D8AD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editChipText: {
    color: '#7A5E5E',
    fontWeight: '700'
  },
  nameText: {
    marginTop: 10,
    fontSize: 24,
    fontFamily: FontFamily.headlineBold,
    color: '#624A4A',
  },
  taglineText: {
    marginTop: 2,
    color: '#9A8585',
    fontSize: 12,
    fontFamily: FontFamily.bodyMedium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    padding: 12
  },
  statWarm: {
    backgroundColor: '#F6F0BC'
  },
  statCool: {
    backgroundColor: '#E5E4F8'
  },
  statIcon: {
    fontSize: 14,
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    color: '#5E4747',
    fontWeight: '700'
  },
  statLabel: {
    color: '#8E7474',
    fontSize: 12
  },
  sectionTitle: {
    color: '#7A5E5E',
    fontFamily: FontFamily.bodyBold,
    marginBottom: 8,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  disabledCard: {
    opacity: 0.6
  },
  fieldWrapper: {
    marginBottom: 12
  },
  label: {
    marginBottom: 6,
    color: '#7A5E5E',
    fontWeight: '600'
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#F8F0E8',
    color: '#5E4747',
  },
  menuCard: {
    borderRadius: 18,
    backgroundColor: '#F6F0BC',
    padding: 10,
    marginBottom: 10,
  },
  menuRow: {
    backgroundColor: '#F1EAA8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuDot: {
    color: '#7A5E5E',
    marginRight: 8,
    fontSize: 12
  },
  menuText: {
    flex: 1,
    color: '#694E4E',
    fontWeight: '600'
  },
  menuArrow: {
    color: '#8E7474',
    fontSize: 18
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#CEA3B7',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  syncButton: {
    marginTop: 10,
    backgroundColor: '#A98795',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#BDBDBD'
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#F6D6DF',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutText: {
    color: '#8D5D74',
    fontWeight: '700'
  },
  helperText: {
    marginTop: 10,
    color: '#8E7474',
    textAlign: 'center'
  },
});