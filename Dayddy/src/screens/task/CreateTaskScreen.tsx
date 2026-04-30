import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createTask, updateTask, getCategories, createCategory } from '../../services/database';
import { Colors, FontFamily, Radius, Shadow } from '../../theme/theme';

interface CreateTaskScreenProps {
  navigation: any;
  route?: {
    params?: {
      task?: {
        id?: number;
        title?: string;
        description?: string;
        due_date?: string;
        due_time?: string;
        priority?: string;
        tag?: string;
      };
    };
  };
}

const PRIORITIES = [
  { key: 'high', label: 'High', dot: '#FF5252' },
  { key: 'medium', label: 'Medium', dot: '#FFC107' },
  { key: 'low', label: 'Low', dot: '#4CAF50' },
];

const DEFAULT_TAGS = [
  { label: 'Assignment', icon: 'file-document-edit-outline' },
  { label: 'Part-time', icon: 'briefcase-clock-outline' },
  { label: 'Study', icon: 'book-open-variant' },
  { label: 'Fun Time', icon: 'controller-classic-outline' },
  { label: 'Social', icon: 'account-group-outline' },
  { label: 'Gym', icon: 'weight-lifter' },
  { label: 'Food', icon: 'silverware-fork-knife' },
  { label: 'Sleep', icon: 'bed-outline' },
];

const parseDateString = (value?: string): Date | null => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation, route }) => {
  const editingTask = route?.params?.task;
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [dueDate, setDueDate] = useState<Date | null>(() => parseDateString(editingTask?.due_date));
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [priority, setPriority] = useState(editingTask?.priority ?? 'medium');
  const [tag, setTag] = useState(editingTask?.tag ?? 'Assignment');
  const [customTags, setCustomTags] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (editingTask?.due_time) {
      const timeValue = new Date();
      const [hours, minutes] = editingTask.due_time.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        timeValue.setHours(hours, minutes, 0, 0);
        setDueTime(timeValue);
      }
    }
  }, [editingTask]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const dbTags = await getCategories();
      setCustomTags(dbTags || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await createCategory(newCategoryName.trim());
      await fetchTags();
      setTag(newCategoryName.trim());
      setNewCategoryName('');
      setModalVisible(false);
    }
  };

  const closeCategoryModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const openDatePicker = () => {
    const todayStart = startOfDay(new Date());
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dueDate || new Date(),
        mode: 'date',
        minimumDate: todayStart,
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            if (startOfDay(selectedDate).getTime() < todayStart.getTime()) {
              Alert.alert('Invalid Date', 'Please choose today or a future date.');
              return;
            }
            setDueDate(selectedDate);
          }
        },
      });
      return;
    }
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dueTime || new Date(),
        mode: 'time',
        is24Hour: false,
        onChange: (_event, selectedTime) => {
          if (selectedTime) {
            const now = new Date();
            const baseDate = dueDate || now;
            const candidate = new Date(baseDate);
            candidate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            if (isSameDay(baseDate, now) && candidate.getTime() < now.getTime()) {
              Alert.alert('Invalid Time', 'Please choose a time from now onwards.');
              return;
            }
            setDueTime(selectedTime);
          }
        },
      });
      return;
    }
    setShowTimePicker(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Empty Task', "What's the plan? ✨");
      return;
    }
    setSaving(true);
    try {
      const dueDateString = dueDate
        ? [dueDate.getFullYear(), String(dueDate.getMonth() + 1).padStart(2, '0'), String(dueDate.getDate()).padStart(2, '0')].join('-')
        : '';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDateString,
        due_time: dueTime ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        priority,
        tag,
      };

      if (editingTask?.id) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const allTags = [...DEFAULT_TAGS, ...customTags];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('TodoList');
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color="#7e5b64" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>LET'S GET IT DONE!</Text>
          <Text style={styles.heroTitleStatic}>What's our next big goal? ✨</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>TASK NAME ✍️</Text>
            <TextInput
              style={styles.taskNameInput}
              placeholder="e.g. WAD assignment 😭"
              placeholderTextColor="#bdbb9260"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>WHICH DAY? 📅</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity activeOpacity={0.6} style={styles.inputRowMain} onPress={openDatePicker}>
                  <MaterialCommunityIcons name="calendar-month" size={20} color="#7e5b64" />
                  <Text style={styles.inputText}>{dueDate ? dueDate.toLocaleDateString() : 'Optional'}</Text>
                </TouchableOpacity>
                {dueDate && (
                  <TouchableOpacity style={styles.clearTimeBtn} onPress={() => setDueDate(null)}>
                    <MaterialCommunityIcons name="close" size={18} color="#7e5b64" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>AT WHAT TIME? ⏰</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.inputRowMain} activeOpacity={0.6} onPress={openTimePicker}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#7e5b64" />
                  <Text style={styles.inputText}>
                    {dueTime ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Optional'}
                  </Text>
                </TouchableOpacity>
                {dueTime && (
                  <TouchableOpacity style={styles.clearTimeBtn} onPress={() => setDueTime(null)}>
                    <MaterialCommunityIcons name="close" size={18} color="#7e5b64" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>IMPORTANCE</Text>
            <View style={styles.pillRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.pill,
                    priority === p.key && { backgroundColor: '#fed9b8', borderColor: p.dot, borderWidth: 1.5 },
                  ]}
                  onPress={() => setPriority(p.key)}
                >
                  <View style={[styles.dot, { backgroundColor: p.dot }]} />
                  <Text style={[styles.pillText, priority === p.key && { color: '#39391b' }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CATEGORY 🏷️</Text>
            <View style={styles.tagScrollHeight}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagGrid}>
                <TouchableOpacity activeOpacity={0.6} style={styles.tagChip} onPress={() => setModalVisible(true)}>
                  <MaterialCommunityIcons name="plus" size={24} color="#7e5b64" />
                  <Text style={styles.addTagText}>Add New</Text>
                </TouchableOpacity>
                {allTags.map((t, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.tagChip, tag === t.label && styles.tagChipActive]}
                    onPress={() => setTag(t.label)}
                  >
                    <MaterialCommunityIcons name={(t.icon as any) || 'tag-outline'} size={20} color={tag === t.label ? '#52333c' : '#666643'} />
                    <Text style={[styles.tagText, tag === t.label && styles.tagTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>ADDITIONAL THOUGHTS 📝</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any side notes or venting? I'm listening... 👂"
              placeholderTextColor="#66664380"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={['#FFD1DC', '#FED9B8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
              <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : editingTask ? 'UPDATE TASK' : 'SAVE TASK'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closeCategoryModal}>
        <Pressable style={styles.modalOverlay} onPress={closeCategoryModal}>
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput style={styles.modalInput} placeholder="Type category name..." value={newCategoryName} onChangeText={setNewCategoryName} autoFocus />
            <div style={styles.modalButtons}>
              <TouchableOpacity onPress={closeCategoryModal}>
                <Text style={styles.modalBtnCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddCategory}>
                <Text style={styles.modalBtnAdd}>Add</Text>
              </TouchableOpacity>
            </div>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fffbff',
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  heroSection: {
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#7b5f45',
    fontFamily: FontFamily.bodyBold,
    marginBottom: 4,
  },
  heroTitleStatic: {
    fontSize: 34,
    lineHeight: 44,
    fontFamily: FontFamily.headlineBold,
    fontWeight: '800',
    color: '#4A3439',
    letterSpacing: -0.5,
  },
  formCard: {
    backgroundColor: '#f8f6c3',
    borderRadius: Radius.lg,
    padding: 20,
    gap: 24,
    ...Shadow.soft,
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: '#7b5f45',
    letterSpacing: 1,
  },
  taskNameInput: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 16,
    fontSize: 17,
    fontFamily: FontFamily.headlineBold,
    color: '#39391b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  inputRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearTimeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f6c3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyMedium,
    color: '#666643',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: '#ffffff',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pillText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    color: '#666643',
  },
  tagScrollHeight: {
    height: 180,
  },
  tagGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 10,
    paddingRight: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: '#ffffff',
    width: 140,
    height: 50,
    justifyContent: 'center',
  },
  tagChipActive: {
    backgroundColor: '#ffd1dc',
    borderWidth: 1.5,
    borderColor: '#7e5b6420',
  },
  addTagText: {
    fontSize: 13,
    color: '#7e5b64',
    fontFamily: FontFamily.bodyBold,
  },
  tagText: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    color: '#666643',
  },
  tagTextActive: {
    color: '#52333c',
    fontFamily: FontFamily.bodyBold,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: 16,
    minHeight: 80,
    fontSize: 14,
    fontFamily: FontFamily.bodyMedium,
    textAlignVertical: 'top',
    color: '#39391b',
  },
  footer: {
    gap: 6,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: '#ffd1dc',
    paddingVertical: 18,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadow.medium,
  },
  saveBtnText: {
    fontSize: 18, // Synchronized with LoginScreen[cite: 7]
    fontFamily: FontFamily.headlineBold,
    color: '#52333c',
    fontWeight: '900', // Synchronized with LoginScreen[cite: 7]
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    color: '#666643',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fffdf7',
    padding: 24,
    borderRadius: Radius.lg,
    width: '84%',
    gap: 16,
    ...Shadow.soft,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: '#7e5b64',
  },
  modalInput: {
    borderBottomWidth: 1.5,
    borderColor: '#7e5b64',
    paddingVertical: 8,
    fontSize: 16,
    color: '#39391b',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 8,
  },
  modalBtnCancel: {
    color: '#666',
    fontFamily: FontFamily.bodyBold,
  },
  modalBtnAdd: {
    color: '#7e5b64',
    fontFamily: FontFamily.bodyBold,
  },
});

export default CreateTaskScreen;