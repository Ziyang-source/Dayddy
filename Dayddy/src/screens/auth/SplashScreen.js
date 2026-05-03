import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient 
          colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']} 
          style={styles.gradient}
        >

          <Text style={[styles.decorStar, { top: '10%', left: '15%' }]}>★</Text>
          <Text style={[styles.decorStar, { top: '20%', right: '15%', fontSize: 40 }]}>✨</Text>
          <Text style={[styles.decorStar, { bottom: '25%', left: '10%' }]}>❤</Text>

          <View style={styles.content}>
            <View style={styles.cloudLayer}>
              <View style={styles.logoCard}>
                <Image 
                  source={require('../../../assets/SplashScreenLogo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.stickerBadge}>
                  <Text style={{fontSize: 16}}>❤</Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>Dayddy</Text>
            <Text style={styles.subtitle}>Your gentle time companion</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => navigation.replace('Onboarding')}
            >
              <LinearGradient 
                colors={['#FFD1DC', '#FED9B8']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}} 
                style={styles.mainButton}
              >
                <Text style={styles.buttonText}>Get Start</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>

        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: 'center' },
  
  decorStar: { 
    position: 'absolute', 
    color: '#7E5B64', 
    opacity: 0.15, 
    fontSize: 30 
  },

  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 40
  },

  cloudLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 25,
    borderRadius: 70,
    marginBottom: 30,
  },

  logoCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 50,
    shadowColor: '#39391B',
    shadowOffset: { width: 0, height: 12 },
  },

  logoImage: { width: 100, height: 100 },

  stickerBadge: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#FFD1DC',
    borderRadius: 30,
    padding: 12,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },

  title: {
    fontSize: 54,
    fontWeight: '800',
    color: '#7E5B64',
    letterSpacing: -1.5,
  },

  subtitle: {
    fontSize: 17,
    color: '#7B5F45',
    fontFamily: 'serif',
    marginTop: 5,
    opacity: 0.8
  },

  footer: { 
    width: '100%', 
    alignItems: 'center', 
    paddingBottom: 60 
  },

  mainButton: {
    paddingVertical: 20,
    paddingHorizontal: 90,
    borderRadius: 50,
    shadowColor: '#7E5B64',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#52333C',
  },
});

export default SplashScreen;