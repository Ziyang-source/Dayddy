import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAdminDashboardData } from '../services/apiService';

export default function AdminDashboardScreen({ navigation }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 1246,
    events: 3214,
    tasksCompleted: 892,
    completionRate: 78,
  });
  const [activityData, setActivityData] = useState([12, 18, 16, 25, 21, 28, 30]);

  const summaryCards = useMemo(
    () => [
      { label: 'TOTAL USERS', value: stats.users.toLocaleString(), tag: '66%' },
      { label: 'TOTAL EVENTS', value: stats.events.toLocaleString(), tag: '80%' },
      { label: 'TOTAL TASKS', value: stats.tasksCompleted.toLocaleString(), tag: '42%' },
    ],
    [stats],
  );

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace('Splash');
        },
      },
    ]);
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const cloudData = await fetchAdminDashboardData();
      setStats(cloudData.stats);
      setActivityData(cloudData.activityData);
    } catch (error) {
      Alert.alert('Network Notice', 'Could not fetch cloud data. Showing latest local values.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshDashboard} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>CozyCal</Text>
          <Text style={styles.smallIcon}>⚙</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.welcomeTitle}>Welcome Back,</Text>
          <Text style={styles.welcomeTitle}>Sarah</Text>
          <Text style={styles.welcomeSub}>Here's a quick glance at your admin status today.</Text>
        </View>

        {summaryCards.map(card => (
          <View key={card.label} style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>{card.label}</Text>
              <Text style={styles.metricTag}>{card.tag}</Text>
            </View>
            <Text style={styles.metricValue}>{card.value}</Text>
            <View style={styles.metricTrack}>
              <View style={[styles.metricFill, { width: card.tag }]} />
            </View>
          </View>
        ))}

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Daily Active Users</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Weekly</Text>
            </View>
          </View>
          <View style={styles.barRow}>
            {activityData.map((value, index) => (
              <View key={`${value}-${index}`} style={styles.barWrap}>
                <View style={[styles.bar, { height: 20 + value * 2 }]} />
              </View>
            ))}
          </View>
          <View style={styles.labelRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <Text key={day} style={styles.dayLabel}>{day}</Text>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Team Insights</Text>
        <View style={styles.teamCard}>
          <View style={styles.teamRow}>
            <Text style={styles.userIcon}>🟣</Text>
            <View style={styles.teamTextWrap}>
              <Text style={styles.teamTitle}>Noor Jihan</Text>
              <Text style={styles.teamSub}>Manager • Online now</Text>
            </View>
          </View>
          <View style={styles.teamRow}>
            <Text style={styles.userIcon}>🟡</Text>
            <View style={styles.teamTextWrap}>
              <Text style={styles.teamTitle}>Sarah N.</Text>
              <Text style={styles.teamSub}>Admin • 12 tasks done</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshDashboard}>
          <Text style={styles.refreshButtonText}>Refresh Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#B7839D" />
            <Text style={styles.loadingText}>Updating dashboard...</Text>
          </View>
        ) : (
          <Text style={styles.footerNote}>Tip: Pull down to refresh cloud metrics.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF6EE' },
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  appTitle: { fontSize: 16, fontWeight: '700', color: '#624A4A' },
  smallIcon: { color: '#8E7474', fontSize: 16 },
  heroCard: { backgroundColor: '#EDF0B9', borderRadius: 24, padding: 18, marginBottom: 14 },
  welcomeTitle: { fontSize: 34, fontWeight: '700', color: '#3D3232' },
  welcomeSub: { color: '#766666', marginTop: 8, fontSize: 12 },
  metricCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, marginBottom: 10 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { color: '#8E7474', fontSize: 11, fontWeight: '700' },
  metricTag: { color: '#C28AA5', fontWeight: '700', fontSize: 12 },
  metricValue: { marginTop: 6, fontSize: 34, fontWeight: '700', color: '#3D3232' },
  metricTrack: { marginTop: 6, height: 4, borderRadius: 2, backgroundColor: '#EEE6E6' },
  metricFill: { height: 4, borderRadius: 2, backgroundColor: '#C7A7B7' },
  chartSection: { marginTop: 2, backgroundColor: '#FFFDF8', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 10 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { marginBottom: 10, color: '#624A4A', fontWeight: '700' },
  pill: { backgroundColor: '#F6EDB2', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: '#6B5A5A', fontWeight: '600', fontSize: 11 },
  barRow: { height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  barWrap: { width: '12%', alignItems: 'center' },
  bar: { width: 16, borderRadius: 8, backgroundColor: '#F4D0DD' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayLabel: { width: '12%', textAlign: 'center', color: '#9A8A8A', fontSize: 10 },
  teamCard: { backgroundColor: '#F6F0BC', borderRadius: 18, padding: 10, marginBottom: 10 },
  teamRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF8', borderRadius: 14, padding: 10, marginBottom: 8 },
  userIcon: { marginRight: 10 },
  teamTextWrap: { flex: 1 },
  teamTitle: { color: '#5E4747', fontWeight: '700' },
  teamSub: { color: '#8E7474', fontSize: 12 },
  refreshButton: { marginTop: 8, backgroundColor: '#CEA3B7', borderRadius: 18, paddingVertical: 13, alignItems: 'center' },
  refreshButtonText: { color: '#FFFFFF', fontWeight: '700' },
  logoutButton: { marginTop: 10, backgroundColor: '#E8A0A0', borderRadius: 18, paddingVertical: 13, alignItems: 'center' },
  logoutButtonText: { color: '#FFFFFF', fontWeight: '700' },
  loadingRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginLeft: 8, color: '#8E7474' },
  footerNote: { marginTop: 14, textAlign: 'center', color: '#8E7474' },
});