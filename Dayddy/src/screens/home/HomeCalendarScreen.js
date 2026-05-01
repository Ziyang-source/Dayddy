import React, {useState, useRef, useEffect, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, ImageBackground} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavBar from '../../navigation/BottomNavBar';
import {getEvents, getTasks} from '../../services/database';

const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;

  return `${year}-${mm}-${dd}`;
};
  
export default function HomeCalendarScreen({navigation}) {
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] =useState(new Date());

  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month +1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++){
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++){
      days.push(new Date(year, month,i));
    }

    return days;
  };

  const isToday = (date) => {
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  useFocusEffect(
    useCallback(() => {
      const loadCalendarData = async () => {
        const allEvents = await getEvents();
        const allTasks = await getTasks();

        setEvents(allEvents || []);
        setTasks(allTasks || []);
      };

      loadCalendarData();
    }, [])
  );

  const goPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1,1));
  };

  const monthTitle = currentMonth.toLocaleString('en-US',{
    month: 'long',
    year: 'numeric',
  });

  const [showPicker, setshowPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({length: 31}, (_, i) => 2000 + i);
  
  const monthScrollRef = useRef(null);
  const yearScrollRef = useRef(null);

  const MONTH_CHIP_WIDTH = 110;
  const YEAR_CHIP_WIDTH = 80;

  useEffect(() => {
    if (showPicker) {
      setTimeout(() => {
       monthScrollRef.current?.scrollTo({
        x: currentMonth.getMonth() * MONTH_CHIP_WIDTH - 120,
        animated: true,
      });

      yearScrollRef.current?.scrollTo({
        x: (currentMonth.getFullYear() - 2000) * YEAR_CHIP_WIDTH - 120,
        animated: true,
      });
    }, 100);
  }
}, [showPicker, currentMonth]);

  const hasItemsOnDate = date => {
    if (!date) return false;

    const dateString = formatDate(date);

    const hasEvent = events.some(event => event.event_date === dateString);
    const hasTask = tasks.some(task => task.due_date === dateString);

    return hasEvent || hasTask;
  };

  const todayString = formatDate(new Date());

  const todayTasks = tasks
    .filter(task => task.due_date === todayString && task.completed !== 1)
    .sort((a, b) => {
      const timeA = a.due_time || '23:59';
      const timeB = b.due_time || '23:59';
      return timeA.localeCompare(timeB);
    })
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        style={{flex: 1}}
        >
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goPreviousMonth}>
            <Icon name="chevron-left" size={34} color="#7E5B64" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setshowPicker(!showPicker)}>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNextMonth}>
            <Icon name="chevron-right" size={34} color="#7E5B64" />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <View style={styles.pickerBox}>
            <Text style={styles.pickerLabel}>Choose Month</Text>
            <ScrollView
              ref={monthScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerScrollContent}
            >
              {months.map((month, index) => (
                 <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthChip,
                    currentMonth.getMonth() === index && styles.pickerChipActive,
                   ]}

                  onPress={() => {
                    setCurrentMonth(
                     new Date(currentMonth.getFullYear(), index, 1)
                   );
                  }}
                 >
                  <Text style={styles.pickerText}>{month}</Text>
                 </TouchableOpacity>
              ))}
            
             </ScrollView>
            
            <Text style={styles.pickerLabel}>Choose Year</Text>

            <ScrollView 
              ref={yearScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerScrollContent}
              >
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    currentMonth.getFullYear() === year && styles.pickerChipActive,
                   ]}
                   onPress={() => {
                    setCurrentMonth(
                      new Date(year, currentMonth.getMonth(), 1)
                    );
                  }}
                 >
                  <Text style={styles.pickerText}>{year}</Text>
                 </TouchableOpacity>
               ))}
              </ScrollView>
             </View>
            )}
      <View style={{paddingHorizontal: 20}}>
        <View style={styles.weekRow}>
          {week.map((w, i) => (
            <View key={w} style={styles.weekCell}>
              <Text style={styles.weekText}>{w}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {generateDays().map((date, index) => (
            <View key={index} style={styles.dayCell}>
            <TouchableOpacity
            key={index}
            disabled={!date}

            onPress={() => {
              if (!date) return; 
              setSelectedDate(date);
              navigation.navigate('DailyView', {
                selectedDate: formatDate(date),
              });
            }}

            style={[
              styles.dayCircle,
              !date && styles.disabledDay,
              hasItemsOnDate(date) && styles.hasItemDay,
              isToday(date) && styles.today,
              isSelected(date) && styles.selectedDay,
            ]}
            
            >
              <Text style={[
                styles.dayText,
                !date && styles.disabledText,
                isToday(date) && styles.todayText,
                isSelected(date) && styles.selectedText,
                ]}>
                {date ? date.getDate() : ''}
              </Text>

                   
            </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>   

        <Text style={styles.sectionTitle}>✦ Today's Joy</Text>
        <View style={styles.joyRow}>
          {todayTasks.length > 0 ? (
            todayTasks.map((task, index) => (
              <TouchableOpacity
               key={task.id}
                activeOpacity={0.8}
                style={[
                  styles.joyCard,
                  {backgroundColor: index === 0 ? '#FFD9B6' : '#E4E5FA'},
                ]}
                onPress={() => navigation.navigate('TaskDetail', {task})}
              >
                <Text style={styles.joyTitle}>
                  {task.title}
                </Text>
                <Text style={styles.joyTime}>
                  ◔ {task.due_time || 'No time'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.joyCard, {backgroundColor: '#FFD9B6'}]}
              onPress={() => navigation.navigate('CreateTask')}
            >
              <Text style={styles.joyTitle}>Add your{`\n`}first task</Text>
              <Text style={styles.joyTime}>Tap to create</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.mindCard}>
          <Text style={styles.mindTitle}>Stay Mindful.</Text>
          <Text style={styles.mindSub}>Every small habit builds a beautiful life.</Text>
          <TouchableOpacity style={styles.pawBtn}><Icon name="paw" size={34} color="#7E5B64" /></TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={styles.floatBtn}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateEvent')}
        >
        <Icon name="plus" size={38} color="#fff" />
      </TouchableOpacity>
      <BottomNavBar activeRoute="HomeCalendar" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1, 
    backgroundColor: '#FFF9FE',
  },

  content: {
    paddingBottom: 130,
  },

  monthHeader: {
    height: 110, 
    borderBottomLeftRadius: 55, 
    borderBottomRightRadius: 55, 
    backgroundColor: '#FFFBFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    elevation: 4,
  },

  monthTitle: {
    fontSize: 31, 
    color: '#7E5B64', 
    fontWeight: '900',
  },

  weekRow: {
    flexDirection: 'row',  
    marginTop: 48, 
    marginBottom: 20,
  },

  weekCell: {
    width: '14.28%',
    alignItems: 'center',
  },

  weekText: {
    fontSize: 13, 
    color: '#5E5547', 
    fontWeight: '900', 
    letterSpacing: 2,
  },

  calendarGrid: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
  },

  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    marginBottom: 14,
  },

  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFBF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  disabledDay: {
    backgroundColor: '#F3F1E8',
  }, 
  
  todayDay: {
    backgroundColor: '#FBC6D6', 
    borderWidth: 8, 
    borderColor: '#F8E7EE',
  },

  dayText: { 
    fontSize: 20,
    color: '#7E5B64',
    fontWeight: '800',
  },

  today: {
    backgroundColor: '#E8E7FA',
    borderRadius: 20,
  },

  selectedDay: {
    backgroundColor: '#FFC6D5',
    borderRadius: 20,
  },

  selectedText:{
    color: '#7E5B64',
    fontWeight: '900',
  },

  disabledText: {
    color: '#C8C0AF',
  }, 
  
  todayText: {
    color: '#7E5B64',
    fontWeight: '900',
  },

  dot: {
    fontSize: 22, 
    color: '#7E5B64', 
    position: 'absolute', 
    bottom: 8
  }, 
  
  smallEmoji: {
    position: 'absolute', 
    top: -10, 
    right: -2, 
    color: '#7E5B64', 
    fontSize: 24
  }, 
  
  star: {
    position: 'absolute', 
    top: -8, 
    right: -6, 
    color: '#6C6A7C', 
    fontSize: 24
  },

  sectionTitle: {
    fontSize: 28, 
    fontWeight: '900', 
    color: '#7E5B64', 
    marginLeft: 40, 
    marginTop: 30, 
    marginBottom: 25
  },

  joyRow: {
    flexDirection: 'row', 
    paddingHorizontal: 26, 
    justifyContent: 'space-between'
  },

  joyCard: {
    width: '47%', 
    height: 150, 
    borderRadius: 34, 
    padding: 28, 
    justifyContent: 'space-between'
  },

  joyTitle: {
    fontSize: 23, 
    lineHeight: 30, 
    color: '#5A4735', 
    fontWeight: '900'
  }, 
  
  joyTime: {
    fontSize: 16, 
    color: '#6C654D', 
    fontWeight: '800'
  },

  mindCard: {
    height: 250, 
    margin: 26, 
    borderRadius: 34, 
    backgroundColor: '#8B604E', 
    justifyContent: 'flex-end', 
    padding: 28, 
    overflow: 'hidden'
  },

  mindTitle: {
    fontSize: 34, 
    color: '#fff', 
    fontWeight: '900'
  }, 
  
  mindSub: {
    fontSize: 17, 
    color: '#fff', 
    marginTop: 4
  }, 
  
  pawBtn: {
    position: 'absolute', 
    top: 0, 
    right: 0, 
    backgroundColor: '#FFFFBF', 
    width: 120, 
    height: 120, 
    borderBottomLeftRadius: 60, 
    alignItems: 'center', 
    justifyContent: 'center'
  },

  floatBtn: {
    position: 'absolute', 
    right: 42, 
    bottom: 96, 
    width: 78, 
    height: 78, 
    borderRadius: 39, 
    backgroundColor: '#8B6A57', 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 8
  },

  pickerBox: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#FFFBFF',
    elevation: 3,
  },

  pickerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFBF',
    marginRight: 10,
  },

  pickerChipActive: {
    backgroundColor: '#FFC6D5',
  },

  pickerText: {
    color: '#7E5B64',
    fontWeight: '800',
  },

  pickerLabel: {
    color: '#7E5B64',
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 6,
  },

  pickerScrollContent: {
    paddingHorizontal: 120,
    paddingBottom: 10,
  },

  monthChip: {
    width: 100,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFBF',
    marginRight: 10,
    alignItems: 'center',
  },

  yearChip: {
    width: 70,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFBF',
    marginRight: 10,
    alignItems: 'center',
  },

  hasItemDay: {
    backgroundColor: '#FFE4EC',
    borderWidth: 2,
    borderColor: '#7E5B64',
  },

});
