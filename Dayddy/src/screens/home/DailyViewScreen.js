import React, {useMemo} from 'react';
import {SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getItemsByDate} from '../../data/dayddyData';
import BottomNavBar from '../../components/BottomNavBar';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const suffix = d => d > 3 && d < 21 ? 'th' : ['th','st','nd','rd'][d % 10] || 'th';
const toISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export default function DailyViewScreen({navigation, route}) {
  const selectedDate = route.params?.selectedDate || '2024-10-24';
  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const items = getItemsByDate(selectedDate);
  const events = items.filter(i => i.type === 'event');
  const tasks = items.filter(i => i.type === 'task');

  const changeDay = direction => {
    const next = new Date(dateObj);
    next.setDate(dateObj.getDate() + direction);
    navigation.setParams({selectedDate: toISO(next)});
  };

  const openFocusFlow = () => {
    if (items.length > 0) navigation.navigate('UpcomingEvents', {selectedDate});
    else navigation.navigate('EmptyState', {selectedDate});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>✤ Dayddy</Text>
          <View style={styles.avatar}><Text>👩🏻</Text></View>
        </View>

        <Text style={styles.smallTitle}>TODAY’S GENTLE RHYTHM</Text>
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.dayTitle}>
              {dayNames[dateObj.getDay()]}</Text>
            <Text style={styles.dateText}>{monthNames[dateObj.getMonth()]} {dateObj.getDate()}{suffix(dateObj.getDate())}</Text>
          </View>
          <View style={styles.arrowRow}>
            <TouchableOpacity onPress={() => changeDay(-1)} style={styles.arrowBtn}>
              <Icon name="chevron-left" size={24} color="#7E5B64" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeDay(1)} style={styles.arrowBtn}>
              <Icon name="chevron-right" size={24} color="#7E5B64" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.focusCard} onPress={openFocusFlow} activeOpacity={0.85}>
          <Text style={styles.focusTitle}>Focus Flow</Text>
          <Text style={styles.focusLine}>•  {events.length} Events</Text>
          <Text style={styles.focusLine}>•  {tasks.length} Tasks</Text>
          <View style={styles.progressBack}><View style={[styles.progressFill, {width: items.length ? '60%' : '8%'}]} /></View>
          <Text style={styles.progressText}>{items.length ? '60% Through Your Day' : '0% Through Your Day'}</Text>
        </TouchableOpacity>

        <View style={styles.timeline}>
          {items.length === 0 ? (
            <View style={styles.emptyHint}><Text style={styles.emptyHintText}>No events or tasks for this day. Tap Focus Flow to open empty state.</Text></View>
          ) : items.map(item => (
            <View key={item.id} style={styles.timeRow}>
              <Text style={styles.timeText}>{item.time}</Text>
              <View style={[styles.eventCard, item.type === 'task' && styles.taskCard]}>
                <Text style={[styles.eventTitle, item.completed && styles.completedText]}>{item.title}</Text>
                <Text style={styles.eventSub}>{item.description}</Text>
                {item.category ? <Text style={styles.pill}>{item.category}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.captureTitle}>Capture the Small Joys ✦</Text>
        <Text style={styles.captureText}>Your schedule isn’t just a list of obligations—it’s a canvas for your day. We help you find quiet spaces between meetings to reconnect with what matters.</Text>
      </ScrollView>
      <BottomNavBar activeRoute="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFCF7'}, 
  content: {paddingHorizontal: 22, paddingBottom: 120},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12}, 
  logo: {fontSize: 19, color: '#7E5B64', fontWeight: '900'}, 
  avatar: {width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF1C1', alignItems: 'center', justifyContent: 'center'},
  smallTitle: {fontSize: 20, color: '#7E5B64', letterSpacing: 1.5, marginTop: 32, fontWeight: '900'}, 
  dateRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  dayTitle: {fontSize: 34, fontWeight: '800', color: '#3A3A2A', letterSpacing: 0.5}, 
  dateText: {fontSize: 22, color: '#7A7560', marginTop: 4, fontWeight: '500'}, 
  arrowRow: {flexDirection: 'row', gap: 8}, arrowBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFBF', alignItems: 'center', justifyContent: 'center'},
  focusCard: {backgroundColor: '#FFC8D8', borderRadius: 32, padding: 22, marginTop: 30}, 
  focusTitle: {fontSize: 20, color: '#7E5B64', fontWeight: '900', marginBottom: 12}, 
  focusLine: {fontSize: 15, color: '#67465B', marginBottom: 10}, 
  progressBack: {height: 7, borderRadius: 5, backgroundColor: '#F2AFC3', marginTop: 14}, 
  progressFill: {height: 7, borderRadius: 5, backgroundColor: '#67465B'}, 
  progressText: {fontSize: 11, color: '#67465B', marginTop: 8},
  timeline: {marginTop: 26}, 
  timeRow: {flexDirection: 'row', marginBottom: 18}, 
  timeText: {width: 62, fontSize: 12, color: '#B78E88', marginTop: 20}, 
  eventCard: {flex: 1, backgroundColor: '#FFFFBF', borderRadius: 28, padding: 20, borderLeftWidth: 5, borderLeftColor: '#7E5B64'}, 
  taskCard: {backgroundColor: '#F7F2B2', borderLeftWidth: 0}, 
  eventTitle: {fontSize: 16, fontWeight: '800', color: '#2D2D1B'}, 
  completedText: {textDecorationLine: 'line-through', color: '#9A8C80'}, 
  eventSub: {fontSize: 12, color: '#655D55', marginTop: 6}, 
  pill: {alignSelf: 'flex-start', marginTop: 12, backgroundColor: '#FFD7B8', color: '#7E5B64', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, fontSize: 10, fontWeight: '800'},
  emptyHint: {backgroundColor: '#FFFFBF', borderStyle: 'dashed', borderWidth: 1, borderColor: '#E6DCA0', borderRadius: 28, padding: 30}, 
  emptyHintText: {textAlign: 'center', color: '#766C48'}, captureTitle: {fontSize: 28, fontWeight: '900', color: '#252917', marginTop: 30}, 
  captureText: {fontSize: 16, color: '#5C5844', lineHeight: 24, marginTop: 12},
});
