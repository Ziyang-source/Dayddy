import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTab from '../../components/BottomTab';

const HelpScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'text',
            text: "Welcome to Dayddy! 🌸 Hi there! How can I help you today? ✨",
            sender: 'bot'
        },
        {
            id: 2,
            type: 'options',
            options: [
                'How do I create an account?',
                'Can I use it without logging in?',
                'Is my data safe here?',
                'I forgot my password!'
            ],
            sender: 'bot'
        }
    ]);

    const scrollViewRef = useRef();

    const faqDatabase = {
        'How do I create an account?': 'Tap the "JOIN" tab at the bottom to start your Dayddy journey! It only takes a minute. ✨',
        'Can I use it without logging in?': 'Yes! You can tap "Continue as Guest" on the Login page to explore first. 🐾',
        'Is my data safe here?': 'Absolutely! All your data stays local and safe on your device. 🔒',
        'I forgot my password!': 'Click "Forgot Password" on the Login screen, and we will send a reset link to your email. 🔑',
    };

const handleOptionClick = (selectedText, optionMsgId) => {
  setMessages(prev => {
    const filtered = prev.filter(m => m.id !== optionMsgId);
    return [...filtered, { id: Date.now(), type: 'text', text: selectedText, sender: 'user' }];
  });

  setTimeout(() => {
    const botAnswer = { 
      id: Date.now() + 1, 
      type: 'text', 
      text: faqDatabase[selectedText], 
      sender: 'bot' 
    };
    setMessages(prev => [...prev, botAnswer]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        type: 'options',
        options: Object.keys(faqDatabase).filter(opt => opt !== selectedText),
        sender: 'bot'
      }]);
    }, 800);
  }, 600);
};

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                                <View style={styles.header}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const parent = navigation.getParent && navigation.getParent();
                                                if (parent && parent.navigate) parent.navigate('Auth', { screen: 'Login' });
                                                else navigation.replace('Login');
                                            }}
                                            style={styles.backBtn}
                                        >
                                                <Icon name="arrow-left" size={26} color="#7E5B64" />
                                        </TouchableOpacity>
                                        <Text style={styles.headerTitle}>Help Chat</Text>
                                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatArea}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} style={[styles.msgWrapper, msg.sender === 'user' ? styles.userWrapper : styles.botWrapper]}>
                            {msg.sender === 'bot' && (
                                <View style={styles.botAvatar}>
                                    <Icon name="robot-love" size={18} color="#FFF" />
                                </View>
                            )}

                            {msg.type === 'text' ? (
                                <View style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                                    <Text style={[styles.msgText, msg.sender === 'user' && { color: '#FFF' }]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.optionsWrapper}>
                                    {msg.options.map((opt, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.optionBtn}
                                            onPress={() => handleOptionClick(opt, msg.id)}
                                        >
                                            <Text style={styles.optionText}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>

            <BottomTab activeRoute="Help" navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        height: 60 },

    headerTitle: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#7E5B64', 
        marginLeft: 10 },

    chatArea: { 
        flex: 1, 
        paddingHorizontal: 20 },

    msgWrapper: { 
        flexDirection: 'row', 
        marginVertical: 8, 
        alignItems: 'flex-start' },

    userWrapper: { 
        justifyContent: 'flex-end' },

    botWrapper: { 
        justifyContent: 'flex-start' },

    botAvatar: {
        width: 32, 
        height: 32, 
        borderRadius: 16,
        backgroundColor: '#FF8FA3', 
        justifyContent: 'center',
        alignItems: 'center', 
        marginRight: 8, 
        marginTop: 4
    },

    bubble: { 
        maxWidth: '75%', 
        padding: 12, 
        borderRadius: 20 },

    botBubble: { 
        backgroundColor: '#FFF', 
        borderTopLeftRadius: 4, 
        elevation: 1 },

    userBubble: { 
        backgroundColor: '#FF8FA3', 
        borderTopRightRadius: 4 },

    msgText: { 
        fontSize: 15, 
        color: '#4A3439', 
        lineHeight: 22 },

    optionsWrapper: { width: '75%' },

    optionBtn: {
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FFD1DC',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    optionText: { 
        color: '#7E5B64', 
        fontSize: 14, 
        fontWeight: '700' },
});

export default HelpScreen;