import React from 'react';
import {SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavBar from '../../components/BottomNavBar';

export default function EmptyStateScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>✤ Dayddy</Text>
        <View style={styles.avatar}><Text>👩🏻</Text></View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      <View style={styles.center}>
        <View style={styles.emptyImage}>
          <Text style={styles.moon}>☾</Text>
        </View>

        <Text style={styles.title}>No plans or tasks yet ✨</Text>

        <Text style={styles.desc}>
          Your digital quilt is waiting to be filled with cozy moments. Add something!
        </Text>

        <TouchableOpacity style={styles.mainBtn}>
          <Icon name="plus-circle" size={26} color="#fff" />
          <Text style={styles.mainBtnText}>Create First Plan</Text>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn}>
            <Icon name="calendar-plus" size={22} color="#69643F" />
            <Text style={styles.quickText}>Quick Event</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn}>
            <Icon name="check-circle-outline" size={22} color="#69643F" />
            <Text style={styles.quickText}>New Task</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.moodBtn}>
          <Icon name="meditation" size={22} color="#5C5D70" />
          <Text style={styles.moodText}>Mood Check</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  
      <BottomNavBar activeRoute="EventDetail" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFF9FE'}, 
  header: {height: 90, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, backgroundColor: '#FFFBFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, justifyContent: 'space-between', elevation: 5}, 
  logo: {fontSize: 32, color: '#7E5B64', fontWeight: '900'}, 
  avatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#E7E8FF', alignItems: 'center', justifyContent: 'center'},
  
  center: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 90,
  },

  emptyImage: {width: 310, height: 310, borderRadius: 52, backgroundColor: '#FFFFF9', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#8B604E', shadowOpacity: 0.08, shadowRadius: 24}, 
  moon: {fontSize: 95, color: '#7E5B64'}, 
  title: {fontSize: 40, textAlign: 'center', fontWeight: '900', color: '#2A2E15', marginTop: 52},  
  desc: {fontSize: 23, color: '#69643F', textAlign: 'center', lineHeight: 34, marginTop: 26}, 
  mainBtn: {height: 76, borderRadius: 38, backgroundColor: '#8B604E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 38, marginTop: 46}, 
  mainBtnText: {fontSize: 22, fontWeight: '900', color: '#fff', marginLeft: 12}, 
  quickRow: {flexDirection: 'row', gap: 14, marginTop: 36}, 
  quickBtn: {height: 56, paddingHorizontal: 22, borderRadius: 28, backgroundColor: '#F4F3B2', flexDirection: 'row', alignItems: 'center'}, 
  quickText: {fontSize: 16, fontWeight: '900', color: '#69643F', marginLeft: 8}, 
  moodBtn: {marginTop: 20, height: 56, paddingHorizontal: 30, borderRadius: 28, backgroundColor: '#E8E7FA', flexDirection: 'row', alignItems: 'center'}, 
  moodText: {fontSize: 16, fontWeight: '900', color: '#5C5D70', marginLeft: 8},
  
  scrollContent: {
    paddingBottom: 130,
  },

});
