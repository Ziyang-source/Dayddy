import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { deleteTask, getTaskById, toggleTaskComplete } from '../../services/database';
import { Colors, FontFamily, Radius, Shadow } from '../../theme/theme';

type Task = {
  id?: number;
  title?: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority?: string;
  tag?: string;
  reminder?: number;
  completed?: number;
  created_at?: string;
  updated_at?: string;
};

const PRIORITY_STYLES: Record<string, { label: string; background: string; text: string }> = {
  high: { label: 'High', background: '#ffd1dc', text: '#c12048' },
  medium: { label: 'Medium', background: '#fed9b8', text: '#7b5f45' },
  low: { label: 'Low', background: '#dff3d8', text: '#3f7c45' },
};

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return 'None';
  }
  return String(value);
};

const formatTimeValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return '--:--';
  }
  return String(value);
};

const formatAlertStatus = (value?: number | null) => {
  return value === 1 ? 'On' : 'Off';
};

const TaskDetailScreen: React.FC<{ navigation: any; route: { params?: { task?: Task } } }> = ({ navigation, route }) => {
  const initialTask = route?.params?.task ?? {};
  const [task, setTask] = useState<Task>(initialTask);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTask = async () => {
        if (!initialTask.id) return;
        const latestTask = await getTaskById(initialTask.id);
        if (isActive && latestTask) {
          setTask(latestTask);
        }
      };

      loadTask();
      return () => {
        isActive = false;
      };
    }, [initialTask.id])
  );

  const priorityKey = String(task.priority || 'medium');
  const priority = PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.medium;
  const statusText = task.completed === 1 ? 'Completed' : 'Pending';
  const statusColor = task.completed === 1 ? '#3f7c45' : '#666643';

  const dataRows = [
    { label: 'Date', value: formatValue(task.due_date), icon: 'calendar-month-outline' },
    { label: 'Time', value: formatTimeValue(task.due_time), icon: 'clock-outline' },
    { label: 'Alert', value: formatAlertStatus(task.reminder), icon: 'bell-outline' },
  ];

  const handleToggleComplete = async () => {
    if (!task.id) return;
    await toggleTaskComplete(task.id);
    const updated = await getTaskById(task.id);
    if (updated) setTask(updated);
  };

  const handleDelete = () => {
    if (!task.id) return;
    Alert.alert('Delete Task', 'Delete this task permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(task.id as number);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('CreateTask', { task });
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
        <Text style={styles.headerTitle}>Task Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: priority.background }]}>
              <View style={[styles.badgeDot, { backgroundColor: priority.text }]} />
              <Text style={[styles.badgeText, { color: priority.text }]}>{priority.label} Priority</Text>
            </View>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons
                name={task.completed === 1 ? 'check-circle' : 'clock-outline'}
                size={16}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          <Text style={styles.title}>{task.title || 'Untitled task'}</Text>

          <View style={styles.dateCard}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons name="calendar-month-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatValue(task.due_date)}</Text>
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={styles.smallInfoCard}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{formatTimeValue(task.due_time)}</Text>
              </View>
            </View>
            <View style={styles.smallInfoCard}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="bell-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Alert</Text>
                <Text style={styles.infoValue}>{formatAlertStatus(task.reminder)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons name="tag-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{formatValue(task.tag)}</Text>
            </View>
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{formatValue(task.description)}</Text>
          </View>
        </View>

        <View style={styles.actionsBlock}>
          <TouchableOpacity
            style={[styles.completeBtn, task.completed === 1 && styles.completeBtnDone]}
            activeOpacity={0.85}
            onPress={handleToggleComplete}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={task.completed === 1 ? '#3f7c45' : '#4f6f46'}
            />
            <Text style={[styles.completeText, task.completed === 1 && styles.completeTextDone]}>
              {task.completed === 1 ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
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
    elevation: 8,
  },
  backBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FontFamily.headlineBold,
    fontWeight: '800',
    color: '#7e5b64',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 18,
  },
  card: {
    backgroundColor: '#f8f6c3', // Main Card Base Color
    borderRadius: 34,
    padding: 20,
    gap: 18,
    ...Shadow.soft,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    letterSpacing: -0.5,
  },
  dateCard: {
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffef2', // Lighter than #f8f6c3
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  smallInfoCard: {
    flex: 1,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fffef2', // Lighter than #f8f6c3
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
    gap: 2,
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
    color: Colors.onSurface,
  },
  notesCard: {
    backgroundColor: '#fffef2', // Lighter shade for notes
    borderRadius: 28,
    padding: 18,
    gap: 10,
    minHeight: 160,
  },
  notesTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.onSurface,
  },
  actionsBlock: {
    gap: 14,
  },
  completeBtn: {
    minHeight: 72,
    borderRadius: 28,
    backgroundColor: '#dff3d8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadow.soft,
  },
  completeBtnDone: {
    backgroundColor: '#cce9c2',
  },
  completeText: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: '#4f6f46',
  },
  completeTextDone: {
    color: '#3f7c45',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 14,
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
    color: '#666643',
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
    color: '#c12048',
  },
});

export default TaskDetailScreen;