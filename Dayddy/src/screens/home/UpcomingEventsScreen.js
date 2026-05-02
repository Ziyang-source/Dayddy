import React, {useState, useCallback} from 'react';
import {SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getEvents, getEventCategories} from '../../services/database';
import BottomNavBar from '../../navigation/BottomNavBar';

function EventCard({item, navigation, selectedDate}) {
  const datePart = item.date || item.event_date || '';
  const timePart = item.time || item.event_time || '';
  const dateTime = datePart && timePart ? `${datePart} · ${timePart}` : (datePart || timePart);

  return (
    <TouchableOpacity 
      activeOpacity={0.85}
      onPress={() => navigation.navigate('EventDetail', { 
        event: item, 
        origin: 'UpcomingEvents', 
        selectedDate: selectedDate 
      })}
    >
      <View style={[styles.card, item.image === 'mountain' && styles.wideCard]}>
        <View style={styles.cardRow}>
          <View style={styles.cardMain}>
            <Text style={styles.cardTitle}>{item.title || 'Untitled'}</Text>
            {dateTime ? <Text style={styles.cardTimeSmall}>{dateTime}</Text> : null}
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.tag}>{item.tag || item.category || 'General'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function UpcomingEventsScreen({navigation, route}) {
  const selectedDate = route.params?.selectedDate;
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState(['All Categories']);

  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
        try {
          const [allEvents, allEventCategories] = await Promise.all([
            getEvents(),
            getEventCategories(),
          ]);
          const data = allEvents || [];

          const categoryFromDb = (allEventCategories || []).map((c) => c.label).filter(Boolean);
          const categoryFromEvents = data.map((ev) => ev.tag || ev.category).filter(Boolean);
          const mergedCategories = Array.from(new Set([...categoryFromDb, ...categoryFromEvents]));
          setCategories(['All Categories', ...mergedCategories]);

          if (selectedDate) {
            const filtered = data.filter(ev => {
              const evDate = ev.date || ev.event_date;
              return evDate === selectedDate;
            });
            setItems(filtered);
          } else {
            setItems(data);
          }
        } catch (error) {
          console.error("加载失败:", error);
        }
      };

      loadEvents();
    }, [selectedDate])
  );

  const filteredItems = items.filter(item => {
    const eventCategory = item.tag || item.category || '';
    const matchCategory = selectedCategory === 'All Categories' || eventCategory === selectedCategory;
    const keyword = searchText.toLowerCase();
    const matchSearch = (item.title || "").toLowerCase().includes(keyword) || 
                        (item.description || "").toLowerCase().includes(keyword) ||
                        eventCategory.toLowerCase().includes(keyword);
    return matchCategory && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBarSimple}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={30} color="#7E5B64" />
          </TouchableOpacity>
          <Text style={styles.topTitleSimple}>Dayddy</Text>
          <View style={{width: 30}} />
        </View>

        <Text style={styles.title}>Your Moments</Text>

        <View style={styles.searchBox}>
          <Icon name="magnify" size={22} color="#9D9B73" />
          <TextInput 
            style={styles.input} 
            placeholder="Search all events..." 
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map(c => (
            <TouchableOpacity key={c} onPress={() => setSelectedCategory(c)}>
              <Text style={[styles.chip, selectedCategory === c && styles.activeChip]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.section}>
          {selectedDate ? `EVENTS ON ${selectedDate}` : "ALL UPCOMING EVENTS"}
        </Text>

        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <EventCard 
              key={item.id || index} 
              item={item} 
              navigation={navigation} 
              selectedDate={selectedDate}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-blank" size={80} color="#83835d30" />
            <Text style={styles.emptyTitle}>No events to show</Text>
            <Text style={styles.emptySubtitle}>Try adding a new event!</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeRoute="UpcomingEvents" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1, 
    backgroundColor: '#FFF9FE'}, 

  content: {
    padding: 20, 
    paddingBottom: 125},

  topBarSimple: {
    height: 58, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 14},

  topTitleSimple: {
    fontSize: 20, 
    fontWeight: '900', 
    color: '#7E5B64'}, 

  title: {
    fontSize: 32, 
    fontWeight: '900', 
    color: '#252917', 
    marginTop: 20},

  searchBox: {
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#F4F3B2', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 18, 
    marginTop: 20}, 

  input: {
    flex: 1, 
    marginLeft: 10, 
    fontSize: 15}, 

  chips: {
    marginVertical: 24}, 

  chip: {
    backgroundColor: '#FFFFBF', 
    paddingHorizontal: 20, 
    paddingVertical: 11, 
    borderRadius: 22, 
    marginRight: 10, 
    color: '#7A6352'}, 

  activeChip: {
    backgroundColor: '#E8E7FA'}, 

  section: {
    fontSize: 12, 
    color: '#C8B4B9', 
    letterSpacing: 2, 
    marginVertical: 10},

  card: {
    backgroundColor: '#FFFBFF', 
    borderRadius: 40, 
    padding: 28, 
    marginBottom: 26, 
    borderWidth: 1, 
    borderColor: '#F0E4E8'}, 

  wideCard: {
    backgroundColor: '#FFFFBF'}, 

  imageMock: {
    height: 105, 
    borderRadius: 22, 
    backgroundColor: '#B88B68', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 18}, 

  mountainMock: {
    height: 120, 
    borderTopLeftRadius: 22, 
    borderTopRightRadius: 22, 
    backgroundColor: '#9EB6D3', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: -24, 
    marginTop: -24, 
    marginBottom: 20}, 

  imageText: {
    fontSize: 48},

  cardRow: {
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between'},

  cardMain: {
    flex: 1, 
    paddingRight: 12},

  cardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end', 
    width: 96},

  tag: {
    backgroundColor: '#E8E7FA', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 12, 
    color: '#7E5B64', 
    fontSize: 11, 
    fontWeight: '900'},

  cardTimeSmall: {
    fontSize: 13, 
    color: '#7E5B64', 
    marginTop: 6, 
    fontWeight: '700'},

  cardTitle: {
    fontSize: 21, 
    color: '#1F2114', 
    fontWeight: '900'},

  cardDesc: {
    fontSize: 14, 
    color: '#5E5547', 
    marginTop: 4, 
    lineHeight: 20}, 

  place: {
    fontSize: 12, 
    color: '#5E5547', 
    marginTop: 8}, 
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#83835d',
    marginTop: 14,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#7A6352',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});