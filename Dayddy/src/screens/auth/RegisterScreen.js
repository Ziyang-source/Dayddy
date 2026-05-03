import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTab from '../../components/BottomTab'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncCloudDataAfterLogin } from '../../services/database';
import { registerToAuth } from '../../services/apiService';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    // Basic form validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Required domain validation for assignment
    const emailRegex = /^[a-zA-Z0-9._%+-]+@dayddy\.com$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please use your email ending with @dayddy.com");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // API call to backend running on port 5001
      const data = await registerToAuth({ username, email, password });
      
      // Safety check for user ID extraction
      const cloudUserId = data?.user?.id || data?.id;

      if (cloudUserId) {
        await AsyncStorage.setItem('userId', String(cloudUserId));
        try {
          // Attempting cloud data sync
          await syncCloudDataAfterLogin(cloudUserId);
        } catch (syncErr) {
          console.warn('Background sync failed:', syncErr);
        }
      }

      // Persist session data locally
      await AsyncStorage.setItem('userToken', 'isLoggedIn');
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userRole', data?.user?.role || 'user');

      Alert.alert('Success', "Account created! Let's set up your profile. ✨");

      // Navigate to Main application stack
      const parent = navigation.getParent && navigation.getParent();
      if (parent && parent.replace) {
        parent.replace('Main');
      } else {
        navigation.replace('Main', { screen: 'Profile' });
      }

    } catch (error) {
      // Fix for 'Cannot read property get of undefined' by using optional chaining
      console.log('[Register] Error Context:', error);
      
      const errorMsg = error?.response?.data?.error || 
                       error?.message || 
                       "Connection error. Ensure backend is running on 5001 and ADB reverse is active.";

      Alert.alert('Registration Failed', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']} 
        style={StyleSheet.absoluteFill} 
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="arrow-left" size={26} color="#7E5B64" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dayddy</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        >
          <View style={styles.mainCard}>
            <View style={styles.topRightDecor}>
               <Icon name="sparkles" size={22} color="#7E5B64" />
            </View>

            <Text style={styles.welcomeTitle}>A Fresh Start</Text>
            <Text style={styles.welcomeSub}>Let's make every day a little brighter together.</Text>

            <View style={styles.inputGroup}>
              <TextInput 
                style={styles.input} 
                placeholder="Username" 
                placeholderTextColor="#A8A8A8" 
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Email address (@dayddy.com)" 
                placeholderTextColor="#A8A8A8" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email}
                onChangeText={setEmail}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Password (min 8 chars)" 
                secureTextEntry 
                placeholderTextColor="#A8A8A8" 
                value={password}
                onChangeText={setPassword}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Confirm Password" 
                secureTextEntry 
                placeholderTextColor="#A8A8A8" 
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.signUpBtnContainer}
              onPress={handleSignUp}
            >
              <LinearGradient 
                colors={['#FFD1DC', '#FED9B8']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={styles.signUpBtn}
              >
                <Text style={styles.signUpText}>Sign Up 🪄</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginHint}>
              <Text style={styles.hintText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomTab activeRoute="Register" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 60 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#7E5B64', marginLeft: 10 },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    marginHorizontal: 20,
    marginTop: 30, 
    borderRadius: 60, 
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  topRightDecor: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: '#D6E4FF', 
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: { fontSize: 28, fontWeight: '900', color: '#4A3439', marginTop: 15 },
  welcomeSub: { fontSize: 14, color: '#8B7378', marginTop: 8 },
  inputGroup: { width: '100%', marginTop: 30 },
  input: {
    backgroundColor: '#E9EAB3', 
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 25,
    marginBottom: 15,
    fontSize: 16,
    color: '#52333C',
  },
  signUpBtnContainer: { width: '100%', marginTop: 10 },
  signUpBtn: {
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: { color: '#52333C', fontWeight: '900', fontSize: 20 },
  loginHint: { flexDirection: 'row', marginTop: 30 },
  hintText: { color: '#7B5F45', fontSize: 14 },
  loginLink: { color: '#7E5B64', fontWeight: '900', textDecorationLine: 'underline' },
});

export default RegisterScreen;