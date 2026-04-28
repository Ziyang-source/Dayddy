import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTab from '../../components/BottomTab';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.starDecoration}>
        <Icon name="star" size={30} color="#D1D1D1" style={styles.grayStar} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          automaticallyAdjustKeyboardInsets={true}
        >

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                navigation.replace('Onboarding');
              }}
              style={styles.backButton}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} 
            >
              <Icon name="arrow-left" size={28} color="#7B5F45" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dayddy</Text>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../../assets/LoginLogo.png')}
                style={styles.calendarImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subText}>Ready to plan your day with Dayddy?</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="hello@dayddy.com"
                placeholderTextColor="#A8A8A8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#A8A8A8"
              />
            </View>

            <View style={styles.forgotContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Main')}
            >
              <LinearGradient
                colors={['#FFD1DC', '#FED9B8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.buttonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestButton} activeOpacity={0.7}>
              <Icon name="account" size={20} color="#52333C" style={{ marginRight: 8 }} />
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupBox}>
            <Text style={styles.newHere}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
              <Text style={styles.createAccount}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      <BottomTab activeRoute="Login" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  starDecoration: { 
    position: 'absolute', 
    top: 50, 
    right: 30, 
    opacity: 0.3 },

  grayStar: { transform: [{ rotate: '15deg' }] },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    height: 60 },

  backButton: { padding: 5 },

  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#7E5B64', 
    marginLeft: 10 },

  logoSection: { 
    alignItems: 'center', 
    marginTop: 10 },

  logoWrapper: {
    width: 140, height: 140, backgroundColor: '#95D5D2',
    borderRadius: 45, borderWidth: 6, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15,
  },
  calendarImg: { 
    width: '70%', 
    height: '70%' },

  welcomeText: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#4A3439', 
    marginTop: 15 },

  subText: { 
    fontSize: 16, 
    color: '#8B7378', 
    marginTop: 5 },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)', marginHorizontal: 25,
    marginTop: 25, borderRadius: 50, padding: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  inputBox: { marginBottom: 15 },

  label: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#7B5F45', 
    marginBottom: 8, 
    marginLeft: 15 },

  textInput: {
    backgroundColor: '#E9EAB3', height: 55, borderRadius: 28,
    paddingHorizontal: 25, fontSize: 16, color: '#52333C',
  },

  forgotContainer: {
  alignSelf: 'flex-end',
  marginRight: 20,
  marginTop: 10,
  marginBottom: 20,
},

forgotPasswordText: {
  color: '#7E5B64',
  fontSize: 14,
  fontWeight: '600',
  textDecorationLine: 'underline',
},

  loginButton: {
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12, 
    elevation: 4, 
    shadowColor: '#FFD1DC', 
    shadowOpacity: 0.3, 
    shadowRadius: 10,
  },

  buttonText: { 
    color: '#52333C', 
    fontWeight: '900', 
    fontSize: 18 },

  guestButton: {
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#E9EAB3',
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
  },

  guestText: { 
    color: '#52333C', 
    fontWeight: '900', 
    fontSize: 16 },

  signupBox: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 20 },

  newHere: { 
    color: '#7B5F45', 
    fontSize: 14, 
    fontWeight: '600' },

  createAccount: { color: '#7E5B64', fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
});

export default LoginScreen;