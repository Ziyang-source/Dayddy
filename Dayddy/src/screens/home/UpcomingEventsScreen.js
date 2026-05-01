import React, {useState} from 'react';
import {SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getAllUpcomingItems, getItemsByDate} from '../../data/dayddyData';
import BottomNavBar from '../../components/BottomNavBar';

function EventCard({item}) {
  return (
    <View style={[styles.card, item.image === 'mountain' && styles.wideCard]}>
      {item.image === 'coffee' && <View style={styles.imageMock}><Text style={styles.imageText}>☕</Text></View>}
      {item.image === 'mountain' && <View style={styles.mountainMock}><Text style={styles.imageText}>🏔️</Text></View>}
      <View style={styles.cardTop}>
        <Text style={styles.tag}>{item.tag || item.category}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      {item.place ? <Text style={styles.place}>📍 {item.place}</Text> : null}
    </View>
  );
}

export default function UpcomingEventsScreen({navigation, route}) {
  const selectedDate = route.params?.selectedDate;
  const items = selectedDate ? getItemsByDate(selectedDate) : getAllUpcomingItems();

  const [searchText, setSearchText] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All Events');
  
  const categories = ['All Events', 'Work', 'Personal', 'Hobbies', 'Travel'];

  const filteredItems = items.filter(item => {
    const matchCategory = 
      selectedCategory === 'All Events' || item.category === selectedCategory;
    
    const keyword = searchText.toLowerCase();

    const matchSearch =
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword) ||
      (item.place && item.place.toLowerCase().includes(keyword));

    return matchCategory && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={30} color="#7E5B64" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Dayddy</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EventDetail')}>
            <Icon name="calendar-outline" size={24} color="#7E5B64" />
          </TouchableOpacity>
          
        </View>
        <Text style={styles.title}>Your Moments</Text>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={22} color="#9D9B73" />
          <TextInput 
            style={styles.input} 
            placeholder="Find a workshop, coffee date..." 
            placeholderTextColor="#9D9B73" 
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map(category => (
            <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.chip,
                  selectedCategory === category && styles.activeChip,
                ]}>
                {category}
                </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.section}>TODAY</Text>

        {filteredItems.map(item => (
          <EventCard key={item.id} item={item} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatBtn}>
        <Icon name="plus" size={32} color="#fff" />
      </TouchableOpacity>
      <BottomNavBar activeRoute="UpcomingEvents" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFF9FE'}, 
  content: {padding: 20, paddingBottom: 125},
  topBar: {height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, 
  topTitle: {fontSize: 20, fontWeight: '900', color: '#7E5B64'}, 
  title: {fontSize: 32, fontWeight: '900', color: '#252917', marginTop: 20},
  searchBox: {height: 50, borderRadius: 25, backgroundColor: '#F4F3B2', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginTop: 20}, 
  input: {flex: 1, marginLeft: 10, fontSize: 15}, 
  chips: {marginVertical: 24}, 
  chip: {backgroundColor: '#FFFFBF', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22, marginRight: 10, color: '#7A6352'}, 
  activeChip: {backgroundColor: '#E8E7FA'}, 
  section: {fontSize: 12, color: '#C8B4B9', letterSpacing: 2, marginVertical: 10},
  card: {backgroundColor: '#FFFBFF', borderRadius: 34, padding: 24, marginBottom: 22, borderWidth: 1, borderColor: '#F0E4E8'}, 
  wideCard: {backgroundColor: '#FFFFBF'}, 
  imageMock: {height: 105, borderRadius: 22, backgroundColor: '#B88B68', alignItems: 'center', justifyContent: 'center', marginBottom: 18}, 
  mountainMock: {height: 120, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#9EB6D3', alignItems: 'center', justifyContent: 'center', marginHorizontal: -24, marginTop: -24, marginBottom: 20}, 
  imageText: {fontSize: 48},
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, 
  tag: {backgroundColor: '#E8E7FA', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, color: '#7E5B64', fontSize: 11, fontWeight: '900'}, 
  cardTime: {fontSize: 15, color: '#7E5B64', fontWeight: '900'}, 
  cardTitle: {fontSize: 21, color: '#1F2114', fontWeight: '900', marginTop: 12}, 
  cardDesc: {fontSize: 14, color: '#5E5547', marginTop: 6, lineHeight: 20}, 
  place: {fontSize: 12, color: '#5E5547', marginTop: 14}, 
  floatBtn: {position: 'absolute', right: 28, bottom: 98, width: 60, height: 60, borderRadius: 30, backgroundColor: '#8B5E70', alignItems: 'center', justifyContent: 'center'},
});
