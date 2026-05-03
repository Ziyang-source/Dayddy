import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncProfileToCloud } from '../services/apiService';
import Icon from '@react-native-vector-icons/material-icons'; // â† top of file
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

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('@cozycal_profile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const isEmailValid = email => /\S+@\S+\.\S+/.test(email.trim());

  const handleSave = async () => {
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
      await AsyncStorage.setItem('@cozycal_profile', JSON.stringify(profile));
      Alert.alert('Success', 'Profile saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloudSync = async () => {
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
      await syncProfileToCloud(profile);
      Alert.alert('Success', 'Profile synced to cloud API.');
    } catch (error) {
      Alert.alert(
        'Sync Failed',
        'Could not reach cloud API. Your local profile is still saved.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>CozyCal</Text>
          <Text style={styles.smallIcon}>âš™</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarBlock}>
            <Text style={styles.avatarEmoji}>ðŸ¼</Text>
          </View>
          <TouchableOpacity style={styles.editChip}>
            <Text style={styles.editChipText}>âœŽ</Text>
          </TouchableOpacity>

          <Text style={styles.nameText}>{profile.name.trim() || 'CozyPanda'}</Text>
          <Text style={styles.taglineText}>
            {profile.bio.trim() || 'Some days are better with tiny wins'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statWarm]}>
            <Text style={styles.statIcon}>â­</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tasks done</Text>
          </View>
          <View style={[styles.statCard, styles.statCool]}>
            <Text style={styles.statIcon}>ðŸ’œ</Text>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        {isLoading ? (
          <Text style={styles.helperText}>Loading profile...</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <View style={styles.formCard}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  placeholder="Enter full name"
                  placeholderTextColor="#B0959D"
                  value={profile.name}
                  onChangeText={value => updateField('name', value)}
                  style={styles.input}
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
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Theme Settings</Text>
            <View style={styles.menuCard}>
              {['Soft Pink', 'Match My Mood', 'Lavender Field'].map(item => (
                <TouchableOpacity key={item} style={styles.menuRow}>
                  <Text style={styles.menuDot}>â—‰</Text>
                  <Text style={styles.menuText}>{item}</Text>
                  <Text style={styles.menuArrow}>â€º</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.menuCard}>
              {['Notifications', 'Auto Sync', 'Privacy & Security'].map(item => (
                <TouchableOpacity key={item} style={styles.menuRow}>
                  <Text style={styles.menuDot}>â—</Text>
                  <Text style={styles.menuText}>{item}</Text>
                  <Text style={styles.menuArrow}>â€º</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleCloudSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF6EE',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#624A4A',
  },
  smallIcon: {
    color: '#8E7474',
    fontSize: 16,
  },
  profileCard: {
    borderRadius: 24,
    backgroundColor: '#FFFDF8',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBlock: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#0F0B10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 38,
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
    fontWeight: '700',
  },
  nameText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '700',
    color: '#624A4A',
  },
  taglineText: {
    marginTop: 2,
    color: '#9A8585',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    padding: 12,
  },
  statWarm: {
    backgroundColor: '#F6F0BC',
  },
  statCool: {
    backgroundColor: '#E5E4F8',
  },
  statIcon: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    color: '#5E4747',
    fontWeight: '700',
  },
  statLabel: {
    color: '#8E7474',
    fontSize: 12,
  },
  profileBadge: {
    marginTop: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAC6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    color: '#6A4E57',
    fontWeight: '700',
  },
  helperText: {
    marginTop: 10,
    color: '#8E7474',
  },
  sectionTitle: {
    color: '#7A5E5E',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#7A5E5E',
    fontWeight: '600',
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
    fontSize: 12,
  },
  menuText: {
    flex: 1,
    color: '#694E4E',
    fontWeight: '600',
  },
  menuArrow: {
    color: '#8E7474',
    fontSize: 18,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#CEA3B7',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  syncButton: {
    marginTop: 10,
    backgroundColor: '#A98795',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    fontWeight: '700',
  },
});
