import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const pages = [
    {
      title: "Plan your days in a cute way",
      subtitle: "Organize your schedule with aesthetic stickers and themes.",
      image: require('../../../assets/OnboardingLogo.png'),
      accent: "cute"
    },
    {
      title: "Stay organized with Comfort",
      subtitle: "Soft colors and gentle reminders for your busy life.",
      image: require('../../../assets/OnboardingLogo.png'),
      accent: "Comfort"
    },
    {
      title: "Your Privacy is our Priority",
      subtitle: "All your data stays local and safe on your device.",
      image: require('../../../assets/OnboardingLogo.png'),
      accent: "Priority"
    }
  ];

  const handleScroll = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Auth')}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>

        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {pages.map((item, index) => (
            <View key={index} style={styles.page}>
              <View style={styles.imageArea}>
                <View style={styles.glowLayer} />
                <View style={styles.whiteCard}>
                   <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
                </View>
              </View>

              <View style={styles.textArea}>
                <Text style={styles.mainTitle}>
                  {item.title.split(item.accent)[0]}
                  <Text style={styles.italicHighlight}>{item.accent}</Text>
                  {item.title.split(item.accent)[1]}
                </Text>
                <Text style={styles.subTitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          <View style={styles.dotContainer}>
            {pages.map((_, i) => (
              <View key={i} style={[styles.dot, currentPage === i && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => {
              if (currentPage < 2) {
                scrollViewRef.current.scrollTo({ x: (currentPage + 1) * width, animated: true });
              } else {
                navigation.replace('Auth');
              }
            }}
          >
            <LinearGradient 
              colors={['#FFD1DC', '#FED9B8']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}}
              style={styles.nextBtn}
            >
              <Text style={styles.nextBtnTxt}>
                {currentPage === 2 ? "Get Started" : "Next →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', paddingRight: 30, paddingTop: 10 },
  skipTxt: { color: '#7B5F45', fontSize: 16, fontWeight: '600', opacity: 0.5 },
  
  page: { width: width, alignItems: 'center' },
  imageArea: { 
    height: height * 0.5,
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10 
  },
  glowLayer: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 100,
    transform: [{ scale: 1.1 }],
  },
  
  whiteCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 60,
    width: width * 0.85, 
    height: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7E5B64',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20
  },
  
  heroImage: { 
    width: '95%', 
    height: '95%' 
  },
  
  textArea: { paddingHorizontal: 40, marginTop: 10, alignItems: 'center' },
  mainTitle: { 
    fontSize: 34, 
    lineHeight: 44, 
    fontWeight: '800', 
    color: '#4A3439', 
    textAlign: 'center',
    letterSpacing: -0.5
  },
  italicHighlight: { 
    fontStyle: 'italic', 
    color: '#7E5B64',
    fontWeight: '800',
  },
  subTitle: { 
    fontSize: 17, 
    color: '#8B7378', 
    textAlign: 'center', 
    marginTop: 15, 
    lineHeight: 26 
  },
  bottomBar: { paddingBottom: 60, alignItems: 'center' },
  dotContainer: { flexDirection: 'row', marginBottom: 35 },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#EFCBAB', 
    marginHorizontal: 5, 
    opacity: 0.3 
  },
  dotActive: { 
    width: 26, 
    opacity: 1, 
    backgroundColor: '#7E5B64' 
  },
  nextBtn: { 
    paddingVertical: 18, 
    paddingHorizontal: 100, 
    borderRadius: 100,
    elevation: 6,
    shadowColor: '#FFD1DC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15
  },
  nextBtnTxt: { color: '#52333C', fontWeight: '900', fontSize: 18 }
});

export default OnboardingScreen;