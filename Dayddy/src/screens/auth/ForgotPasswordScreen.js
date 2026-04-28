import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color="#7E5B64" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dayddy</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.mainTitle}>Lost your way?</Text>
                    <Text style={styles.subTitle}>
                        Don't worry, we'll help you find your keys. Enter your email below to get back inside.
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.iconBadge}>
                            <Icon name="key-variant" size={24} color="#7E5B64" />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="hello@example.com"
                                placeholderTextColor="#A8A8A8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <TouchableOpacity activeOpacity={0.8} style={styles.btnContainer}>
                            <LinearGradient
                                colors={['#FFD1DC', '#FED9B8']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitBtn}
                            >
                                <Text style={styles.submitBtnText}>Send Reset Link 🪄</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.linkWrapper, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={styles.linkText}>Remembered it? </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Auth')}
                            activeOpacity={0.5}
                        >
                            <Text style={styles.linkBold}>Log in here</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tipCard}>
                        <Icon name="lightbulb-outline" size={20} color="#7E5B64" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                            Tip: Use a password manager to keep your Dayddy account extra secure.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 60
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#7E5B64', marginLeft: 10 },

    content: { flex: 1, paddingHorizontal: 30, paddingTop: 40, alignItems: 'center' },
    mainTitle: { fontSize: 32, fontWeight: '900', color: '#4A3439', textAlign: 'center' },
    subTitle: {
        fontSize: 16,
        color: '#8B7378',
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 24,
        paddingHorizontal: 10
    },

    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        width: '100%',
        borderRadius: 50,
        padding: 30,
        marginTop: 50,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
    },
    iconBadge: {
        position: 'absolute',
        top: -25,
        right: 20,
        backgroundColor: '#FED9B8',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    inputWrapper: { width: '100%', marginTop: 10 },
    inputLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#7B5F45',
        marginBottom: 10,
        marginLeft: 5
    },
    input: {
        backgroundColor: '#E9EAB3',
        height: 60,
        borderRadius: 30,
        paddingHorizontal: 25,
        fontSize: 16,
        color: '#52333C',
    },

    btnContainer: { width: '100%', marginTop: 25 },
    submitBtn: {
        height: 65,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },

    submitBtnText: { 
        color: '#52333C', 
        fontWeight: '900', 
        fontSize: 18 },

    linkWrapper: { marginTop: 30 },

    linkText: { color: '#7B5F45', fontSize: 14 },

    linkBold: { 
        fontWeight: '900', 
        textDecorationLine: 'underline', 
        color: '#7E5B64' },

    tipCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(214, 228, 255, 0.5)',
        padding: 20,
        borderRadius: 25,
        marginTop: 40,
        alignItems: 'center'
    },

    tipIcon: { marginRight: 15 },

    tipText: { 
        flex: 1, 
        fontSize: 13, 
        color: '#4A3439', 
        lineHeight: 18 }
});

export default ForgotPasswordScreen;