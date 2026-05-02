import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getEventById, deleteEvent, getEventCategories } from '../../services/database';
import { Colors, FontFamily, Radius, Shadow } from '../../theme/theme';

const formatValue = (v?: string | null) => (v ? String(v) : 'None');
const formatTime = (v?: string | null) => (v ? String(v) : '--:--');

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const EventDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const initial = route?.params?.event ?? {};
  const [event, setEvent] = useState(initial);
  const [categoryList, setCategoryList] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        if (!initial?.id) return;
        const latest = await getEventById(initial.id);
        if (active && latest) setEvent(latest);
        try {
          const cats = await getEventCategories();
          if (active && cats && cats.length) setCategoryList(cats);
        } catch (e) {
          // ignore
        }
      };
      load();
      return () => { active = false };
    }, [initial.id])
  );

  const currentCategory = useMemo(
    () => categoryList.find((c) => c.label === event.tag),
    [categoryList, event.tag]
  );

  const eventStatus = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const eventDate = parseLocalDate(event.event_date);
    if (!eventDate) {
      return { label: 'Today', color: '#7b5f45', background: '#fff2da', icon: 'calendar-today' };
    }

    eventDate.setHours(0, 0, 0, 0);
    if (eventDate.getTime() < todayStart.getTime()) {
      return { label: 'Past', color: '#8c5663', background: '#ffe2ea', icon: 'history' };
    }
    if (eventDate.getTime() === todayStart.getTime()) {
      return { label: 'Today', color: '#7b5f45', background: '#fff2da', icon: 'calendar-today' };
    }
    return { label: 'Upcoming', color: '#3f7c45', background: '#e5f5e8', icon: 'calendar-arrow-right' };
  }, [event.event_date]);

  const handleDelete = () => {
    if (!event?.id) return;
    Alert.alert('Delete Event', 'Delete this event permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteEvent(Number(event.id));
          const origin = route?.params?.origin;
          const selectedDate = route?.params?.selectedDate;
          if (origin) {
            navigation.navigate(origin, { selectedDate });
          } else {
            navigation.navigate('UpcomingEvents', { selectedDate });
          }
        }
      }
    ]);
  };

  const handleEdit = () => {
    const origin = route?.params?.origin;
    const selectedDate = route?.params?.selectedDate;
    navigation.navigate('CreateEvent', { event, origin, selectedDate });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color="#7e5b64" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: eventStatus.background }]}>
              <MaterialCommunityIcons name={eventStatus.icon as any} size={16} color={eventStatus.color} />
              <Text style={[styles.statusText, { color: eventStatus.color }]}>{eventStatus.label}</Text>
            </View>
          </View>

          <Text style={styles.title}>{event.title || 'Untitled event'}</Text>

          <View style={styles.dateCard}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons name="calendar-month-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatValue(event.event_date)}</Text>
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={styles.smallInfoCard}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{formatTime(event.event_time)}</Text>
              </View>
            </View>

            <View style={styles.smallInfoCard}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Alert</Text>
                <Text style={styles.infoValue}>{event.reminder === 1 ? 'On' : 'Off'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons name={currentCategory?.icon || 'tag-outline'} size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{event.tag || 'General'}</Text>
            </View>
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{event.notes || '—'}</Text>
          </View>
        </View>

        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={handleEdit}>
            <MaterialCommunityIcons name="pencil" size={18} color="#666643" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85} onPress={handleDelete}>
            <MaterialCommunityIcons name="delete" size={18} color="#c12048" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 70,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    zIndex: 5,
    ...Shadow.medium,
    elevation: 8
  },
  backBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FontFamily.headlineBold,
    fontWeight: '800',
    color: '#7e5b64'
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 18
  },
  card: {
    backgroundColor: '#f8f6c3',
    borderRadius: 34,
    padding: 20,
    gap: 18,
    ...Shadow.soft,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fffef2',
  },
  statusText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
  },
  title: {
    fontSize: 34,
    lineHeight: 44,
    fontFamily: FontFamily.headlineBold,
    fontWeight: '800',
    color: '#4A3439',
    letterSpacing: -0.5
  },
  dateCard: {
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffef2',
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 12
  },
  smallInfoCard: {
    flex: 1,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffef2',
  },
  alertCard: {
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffef2',
  },
  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 2
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurface
  },
  notesCard: {
    backgroundColor: '#fffef2',
    borderRadius: 28,
    padding: 18,
    gap: 10,
    minHeight: 160,
  },
  notesTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.onSurface
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4
  },
  editBtn: {
    flex: 1,
    height: 62,
    borderRadius: 24,
    backgroundColor: '#f8f6c3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: '#666643'
  },
  deleteBtn: {
    flex: 1,
    height: 62,
    borderRadius: 24,
    backgroundColor: '#ffdfe7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#f2bfd0',
  },
  deleteText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: '#c12048'
  },
});

export default EventDetailScreen;