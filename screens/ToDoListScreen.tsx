import React, { useState, useCallback } from 'react';
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
import { getTasks, toggleTaskComplete } from '../services/database';
import BottomNavBar from '../navigation/BottomNavBar';
import Header from '../navigation/Header';
import { FontFamily, Shadow } from '../theme/theme';

interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: number;
  due_date?: string;
  due_time?: string;
  tag?: string;
}

const RANDOM_PHRASES = [
  'blooming！ 🌸',
  'lovely today！ ✨',
  'full of wins！ 🌿',
  'all yours！ 🌈',
];

const FILTER_TABS: Array<'Today' | 'Upcoming' | 'Completed'> = ['Today', 'Upcoming', 'Completed'];

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return '#FF5252';
    case 'medium':
      return '#FFC107';
    case 'low':
      return '#4CAF50';
    default:
      return '#FFC107';
  }
};

const getPriorityRank = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 0;
    case 'medium':
      return 1;
    case 'low':
      return 2;
    default:
      return 3;
  }
};

const getPriorityLabel = (priority: Task['priority']) => {
  if (priority === 'high') return 'High';
  if (priority === 'medium') return 'Medium';
  if (priority === 'low') return 'Low';
  return 'Medium';
};

const getPriorityChipBackground = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return '#ffe4e8';
    case 'medium':
      return '#fff1d9';
    case 'low':
      return '#e4f5e7';
    default:
      return '#fff1d9';
  }
};

const getPriorityChipTextColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return '#b83855';
    case 'medium':
      return '#a06d1d';
    case 'low':
      return '#2f7a46';
    default:
      return '#a06d1d';
  }
};

const TodoListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Today' | 'Upcoming' | 'Completed'>('Today');
  const [refreshing, setRefreshing] = useState(false);
  const [phrase, setPhrase] = useState<string>(RANDOM_PHRASES[0]);

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

  const filteredTasks = tasks
    .filter((task) => {
      const taskDate = parseLocalDate(task.due_date);

      if (activeFilter === 'Completed') {
        return task.completed === 1;
      }

      if (!taskDate) {
        return activeFilter === 'Today' && task.completed !== 1;
      }

      taskDate.setHours(0, 0, 0, 0);

      if (activeFilter === 'Today') {
        return task.completed !== 1 && taskDate.getTime() <= startOfToday.getTime();
      }

      if (activeFilter === 'Upcoming') {
        return taskDate.getTime() > startOfToday.getTime() && task.completed !== 1;
      }

      return true;
    })
    .sort((a, b) => getPriorityRank(a.priority) - getPriorityRank(b.priority));

  const emptyCopy = {
    Today: {
      title: 'No tasks for today',
      subtitle: 'Add something with today\'s date to see it here.',
    },
    Upcoming: {
      title: 'No upcoming tasks',
      subtitle: 'Future tasks will appear here once you add a later due date.',
    },
    Completed: {
      title: 'Nothing completed yet',
      subtitle: 'Tap the check button on a task to move it here.',
    },
  }[activeFilter];

  const visibleTaskCount = filteredTasks.length;

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      const idx = Math.floor(Math.random() * RANDOM_PHRASES.length);
      setPhrase(RANDOM_PHRASES[idx]);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  const toggleComplete = async (id: number) => {
    await toggleTaskComplete(id);
    await fetchTasks();
  };

  const completedCount = tasks.filter((t) => t.completed === 1).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const renderTask = (item: Task) => (
    <View
      key={item.id}
      style={[styles.pillCard, item.completed === 1 && styles.pillCardCompleted]}
    >
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => toggleComplete(item.id)}
        activeOpacity={0.75}
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      >
        <MaterialCommunityIcons
          name={item.completed === 1 ? 'check-circle' : 'check-circle-outline'}
          size={32}
          color={item.completed === 1 ? '#7e5b64' : '#83835d'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pillBody}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
        activeOpacity={0.8}
      >
        <View style={styles.pillMainContent}>
          <View style={styles.textContainer}>
            <Text style={[styles.pillTitle, item.completed === 1 && styles.taskTitleDone]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.taskMetaText}>{item.due_time || 'Planned'} • {item.tag || 'Daily'}</Text>
          </View>

          <View style={[styles.priorityChip, {backgroundColor: getPriorityChipBackground(item.priority)}]}>
            <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(item.priority)}]} />
            <Text style={[styles.priorityChipText, {color: getPriorityChipTextColor(item.priority)}]}>
              {getPriorityLabel(item.priority)}
            </Text>
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
            <Text style={styles.heroTitle}>Your Day</Text>
            <Text style={styles.heroPhrase}>is {phrase}</Text>
          </View>

          {/* 2. 对话框气泡 */}
          <View style={styles.bubbleContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.bubbleText}>{completedCount}/{tasks.length} tasks completed ✨</Text>
            </View>
          </View>
        </View>

        {/* 3. 进度条区域 - 间距已缩减 */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
          {visibleTaskCount > 0 ? (
            filteredTasks.map(renderTask)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="flower-outline" size={80} color="#83835d30" />
              <Text style={styles.emptyText}>{emptyCopy.title}</Text>
              <Text style={styles.emptySubtext}>{emptyCopy.subtitle}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeRoute="TodoList" navigation={navigation} />
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
    alignItems: 'flex-end',
    marginBottom: -5, 
  },
  speechBubble: {
    backgroundColor: '#ffd1dc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderBottomRightRadius: 2, 
  },
  bubbleText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    color: '#66454e',
  },
  progressSection: {
    paddingHorizontal: 24,
    marginTop: 10, 
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#f8f6c3',
    borderRadius: 10,
    padding: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#efcbab',
    borderRadius: 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 25,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f8f6c3',
  },
  tabButtonActive: {
    backgroundColor: '#7e5b64',
  },
  tabText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    color: '#666643',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  taskList: {
    paddingHorizontal: 24,
    marginTop: 22,
    gap: 14,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefccb',
    borderRadius: 50,
    height: 85,
    paddingRight: 16,
    paddingLeft: 8,
    ...Shadow.soft,
  },
  pillCardCompleted: {
    opacity: 0.6,
  },
  pillBody: {
    flex: 1,
    justifyContent: 'center',
  },
  completeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 4,
  },
  pillMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  pillTitle: {
    fontSize: 17,
    fontFamily: FontFamily.headlineBold,
    color: '#39391b',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyMedium,
    color: '#666643',
    marginTop: 2,
  },

  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ffffff99',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityChipText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: FontFamily.headlineBold,
    color: '#83835d',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FontFamily.body,
    color: '#666643',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TodoListScreen;