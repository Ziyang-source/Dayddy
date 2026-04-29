import React, {useEffect, useState} from 'react';
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
  Switch,
  Pressable,
} from 'react-native';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createEvent, updateEvent, getEventCategories, createEventCategory} from '../services/database';
import {FontFamily, Radius, Shadow} from '../theme/theme';

interface CreateEventScreenProps {
  navigation: any;
  route?: any;
}

const DEFAULT_TAGS = [
  {label: 'Birthday', icon: 'cake-variant'},
  {label: 'Social', icon: 'account-group'},
  {label: 'Anniversary', icon: 'ring'},
  {label: 'Ceremony', icon: 'mace'},
  {label: 'Party', icon: 'party-popper'},
  {label: 'Concert', icon: 'ticket-confirmation-outline'},
];

const parseEventTime = (time?: string) => {
  if (!time) return null;
  const parts = String(time).split(':');
  if (parts.length < 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
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

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({navigation, route}) => {
  const editingEvent = route?.params?.event;
  const [title, setTitle] = useState(editingEvent?.title ?? '');
  const [notes, setNotes] = useState(editingEvent?.notes ?? '');
  const [eventDate, setEventDate] = useState<Date | null>(
    editingEvent?.event_date ? new Date(editingEvent.event_date) : null
  );
  const [eventTime, setEventTime] = useState<Date | null>(parseEventTime(editingEvent?.event_time));
  const [tag, setTag] = useState(editingEvent?.tag ?? 'Festival');
  const [customTags, setCustomTags] = useState<any[]>([]);
  const [reminder, setReminder] = useState(editingEvent?.reminder === 1);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('tag-outline');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const dbTags = await getEventCategories();
      setCustomTags(dbTags || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createEventCategory(newCategoryName.trim());
      setCustomTags((prev) => [{label: newCategoryName.trim(), icon: newCategoryIcon}, ...prev]);
      setTag(newCategoryName.trim());
      setNewCategoryName('');
      setNewCategoryIcon('tag-outline');
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Could not add category.');
    }
  };

  const openDatePicker = () => {
    const todayStart = startOfDay(new Date());

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: eventDate || new Date(),
        mode: 'date',
        minimumDate: todayStart,
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          if (startOfDay(selectedDate).getTime() < todayStart.getTime()) {
            Alert.alert('Invalid Date', 'Please choose today or a future date.');
            return;
          }
          setEventDate(selectedDate);
        },
      });
      return;
    }
    // iOS native picker not used in this build
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: eventTime || new Date(),
        mode: 'time',
        is24Hour: false,
        onChange: (_event, selectedTime) => {
          if (!selectedTime) return;
          const now = new Date();
          const baseDate = eventDate || now;
          const candidate = new Date(baseDate);
          candidate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

          if (isSameDay(baseDate, now) && candidate.getTime() < now.getTime()) {
            Alert.alert('Invalid Time', 'Please choose a time from now onwards.');
            return;
          }
          setEventTime(selectedTime);
        },
      });
      return;
    }
    // iOS native picker not used in this build
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Empty Event', 'Please enter an event title.');
      return;
    }

    if (!eventDate) {
      Alert.alert('Missing Date', 'Event date is required.');
      return;
    }

    if (!eventTime) {
      Alert.alert('Missing Time', 'Event time is required.');
      return;
    }

    setSaving(true);
    try {
      const eventDateString = eventDate
        ? [eventDate.getFullYear(), String(eventDate.getMonth() + 1).padStart(2, '0'), String(eventDate.getDate()).padStart(2, '0')].join('-')
        : '';

      const payload = {
        title: title.trim(),
        event_date: eventDateString,
        event_time: eventTime ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false}) : '',
        tag,
        reminder: reminder ? 1 : 0,
        notes: notes.trim(),
      };

      if (editingEvent?.id) {
        await updateEvent(Number(editingEvent.id), payload);
      } else {
        await createEvent(payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const allTags = [...DEFAULT_TAGS, ...customTags];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Shadowed & Rounded Header (Matching Tasks) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color="#7e5b64" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingEvent ? 'Edit Event' : 'New Event'}</Text>
        <View style={{width: 32}} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>PLAN SOMETHING NICE</Text>
          <Text style={styles.heroTitleStatic}>What's happening next? ✨</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EVENT TITLE</Text>
            <TextInput
              style={styles.yellowInput}
              placeholder="e.g. Dinner with friends"
              placeholderTextColor="#bdbb9290"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>DATE</Text>
              <TouchableOpacity style={styles.yellowInputRow} activeOpacity={0.6} onPress={openDatePicker}>
                <MaterialCommunityIcons name="calendar-month" size={20} color="#7e5b64" />
                <Text style={styles.inputText}>{eventDate ? eventDate.toLocaleDateString() : 'Select date'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>TIME</Text>
              <TouchableOpacity style={styles.yellowInputRow} activeOpacity={0.6} onPress={openTimePicker}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#7e5b64" />
                <Text style={styles.inputText}>
                  {eventTime ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true}) : 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.tagScrollHeight}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagGrid}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.tagChip}
                  onPress={() => setModalVisible(true)}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="#7e5b64" />
                  <Text style={styles.addTagText}>New</Text>
                </TouchableOpacity>

                {allTags.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.label}-${idx}`}
                    style={[styles.tagChip, tag === item.label && styles.tagChipActive]}
                    onPress={() => setTag(item.label)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any || 'tag-outline'}
                      size={20}
                      color={tag === item.label ? '#52333c' : '#666643'}
                    />
                    <Text style={[styles.tagText, tag === item.label && styles.tagTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.reminderField}>
            <View style={styles.reminderInfo}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#7e5b64" />
              <Text style={styles.reminderTitle}>Send Reminder</Text>
            </View>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              thumbColor={reminder ? "#7e5b64" : "#fff"}
              trackColor={{false: "#f0f0f0", true: "#ffd1dc"}}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NOTES</Text>
            <TextInput
              style={[styles.yellowInput, styles.notesInput]}
              placeholder="Add a few details..."
              placeholderTextColor="#bdbb9290"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, saving && {opacity: 0.6}]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>
              {saving ? 'SAVING...' : editingEvent?.id ? 'UPDATE EVENT' : 'SAVE EVENT'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory}>
              <Text style={styles.saveBtnText}>Add</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fffbff', // Page background matching tasks
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headlineBold,
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
  },
  heroTitleStatic: {
    fontSize: 32,
    fontFamily: FontFamily.headlineBold,
    color: '#83835d',
    marginTop: 4,
  },
  formSection: {
    gap: 24,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: '#7b5f45',
    letterSpacing: 1,
  },
  yellowInput: {
    backgroundColor: '#f8f6c3',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d8cf8f',
    borderRadius: Radius.md,
    padding: 16,
    fontSize: 16,
    fontFamily: FontFamily.bodySemiBold,
    color: '#39391b',
  },
  yellowInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6c3',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d8cf8f',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  inputText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyMedium,
    color: '#666643',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  tagGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 10,
    paddingRight: 20,
  },
  tagScrollHeight: {
    height: 180,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: '#f8f6c3',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d8cf8f',
    width: 140,
    height: 50,
    justifyContent: 'center',
  },
  tagChipActive: {
    backgroundColor: '#ffd1dc',
    borderWidth: 1.5,
    borderColor: '#7e5b6420',
  },
  tagText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyMedium,
    color: '#666643',
  },
  tagTextActive: {
    color: '#52333c',
    fontFamily: FontFamily.bodyBold,
  },
  addTagText: {
    fontSize: 13,
    color: '#7e5b64',
    fontFamily: FontFamily.bodyBold,
  },
  reminderField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f6c3',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d8cf8f',
    borderRadius: Radius.md,
    padding: 16,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderTitle: {
    fontSize: 15,
    fontFamily: FontFamily.headlineBold,
    color: '#7e5b64',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 10,
    gap: 6,
  },
  saveBtn: {
    backgroundColor: '#ffd1dc',
    paddingVertical: 18,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadow.medium,
  },
  saveBtnText: {
    fontSize: 18,
    fontFamily: FontFamily.headlineBold,
    color: '#52333c',
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
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: Radius.lg,
    width: '85%',
    gap: 16,
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
});

export default CreateEventScreen;