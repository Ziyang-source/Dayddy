import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getEvents } from '../../services/database';
import BottomNavBar from '../../navigation/BottomNavBar';
import Header from '../../navigation/Header';
import { Colors, FontFamily, Radius, Shadow } from '../../theme/theme';

interface EventItem {
  id: number;
  title: string;
  event_date?: string;
  event_time?: string;
  tag?: string;
  reminder?: number;
  notes?: string;
}

const FILTER_TABS: Array<'Upcoming' | 'Past' | 'All'> = ['Upcoming', 'Past', 'All'];

const EventListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const parseLocalDate = (value?: string) => {
    if (!value) {
      return null;
    }

    const parts = value.split('-').map(Number);
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((event) => {
    const eventDate = parseLocalDate(event.event_date);

    if (activeFilter === 'All') {
      return true;
    }

    if (!eventDate) {
      return activeFilter === 'Upcoming';
    }

    eventDate.setHours(0, 0, 0, 0);

    if (activeFilter === 'Upcoming') {
      return eventDate.getTime() >= startOfToday.getTime();
    }

    return eventDate.getTime() < startOfToday.getTime();
  });

  const emptyCopy = {
    Upcoming: {
      title: 'No upcoming events',
      subtitle: 'Add a new event and it will show up here.',
    },
    Past: {
      title: 'No past events yet',
      subtitle: 'Finished events will appear here after their date passes.',
    },
    All: {
      title: 'No events yet',
      subtitle: 'Use the plus button to create your first event.',
    },
  }[activeFilter];

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  const formatDate = (value?: string) => {
    const parsed = parseLocalDate(value);
    if (!parsed) {
      return 'No date';
    }

    return parsed.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (value?: string) => {
    if (!value) {
      return 'All day';
    }

    return value;
  };

  const renderEvent = (item: EventItem) => (
    <View key={item.id} style={styles.pillCard}>
      <TouchableOpacity
        style={styles.eventDotButton}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="calendar-month" size={30} color="#7e5b64" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pillBody}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        activeOpacity={0.8}
      >
        <View style={styles.pillMainContent}>
          <View style={styles.textContainer}>
            <Text style={styles.pillTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.taskMetaText}>
              {formatDate(item.event_date)} • {formatTime(item.event_time)}
            </Text>
          </View>

          <View style={styles.tagChip}>
            <Text style={styles.tagText}>{item.tag || 'General'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffbff" />

      <Header appTitle="Dayddy" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Your Events</Text>
            <Text style={styles.heroPhrase}>are waiting for you</Text>
          </View>

          <View style={styles.bubbleContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.bubbleText}>{filteredEvents.length}/{events.length} events shown ✨</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${events.length > 0 ? (filteredEvents.length / events.length) * 100 : 0}%` }]} />
          </View>
        </View>

        <View style={styles.tabBar}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              style={[styles.tabButton, activeFilter === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeFilter === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.taskList}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(renderEvent)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={80} color="#83835d30" />
              <Text style={styles.emptyText}>{emptyCopy.title}</Text>
              <Text style={styles.emptySubtext}>{emptyCopy.subtitle}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeRoute="EventList" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbff',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 42,
    fontFamily: FontFamily.headlineBold,
    color: '#39391b',
  },
  heroPhrase: {
    fontSize: 32,
    fontFamily: FontFamily.headlineBold,
    color: '#7e5b64',
    marginTop: -5,
  },
  bubbleContainer: {
    marginLeft: 12,
  },
  speechBubble: {
    backgroundColor: '#f8f6c3',
    borderRadius: 26,
    borderBottomRightRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  bubbleText: {
    fontSize: 18,
    fontFamily: FontFamily.bodyBold,
    color: '#7b5f45',
  },
  progressSection: {
    paddingHorizontal: 24,
    marginTop: 18,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#ecebb2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ffd1dc',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#ecebb2',
  },
  tabButtonActive: {
    backgroundColor: '#f2f1ba',
    borderColor: '#f2f1ba',
  },
  tabText: {
    fontSize: 14,
    color: '#666643',
    fontFamily: FontFamily.bodySemiBold,
  },
  tabTextActive: {
    color: '#39391b',
    fontFamily: FontFamily.bodyBold,
  },
  taskList: {
    marginTop: 18,
    paddingHorizontal: 24,
    gap: 14,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6c3',
    borderRadius: 32,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    minHeight: 88,
    ...Shadow.soft,
  },
  eventDotButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fffef2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pillBody: {
    flex: 1,
  },
  pillMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  pillTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: '#39391b',
  },
  taskMetaText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyMedium,
    color: '#7b5f45',
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffdfe7',
  },
  tagText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: '#c12048',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    gap: 8,
  },
  emptyText: {
    fontSize: 24,
    fontFamily: FontFamily.headlineBold,
    color: '#39391b',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FontFamily.bodyMedium,
    color: '#7b5f45',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default EventListScreen;