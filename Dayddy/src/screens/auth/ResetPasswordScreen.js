import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { userEmail } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in both password fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match! Please try again!");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Weak Password", "Security first! Your password must be at least 8 characters long.");
            return;
        }

        try {
            const response = await fetch('http://172.30.224.1:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, newPassword: password }),
            });

            if (response.status === 200) {
                Alert.alert("Success 🪄", "Password updated! Now try logging in.", [
                    { text: "OK", onPress: () => navigation.navigate('Auth', { screen: 'Login' }) }
                ]);
            } else {
                const data = await response.json();
                Alert.alert("Failed", data.error || "Update failed");
            }
        } catch (error) {
            Alert.alert("Error", "Server connection failed.");
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF5F7', '#FFFBF0', '#F8F6C3']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color="#7E5B64" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dayddy</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>New Password</Text>
                    <Text style={styles.subTitle}>Set a strong password for {userEmail}</Text>

                    <View style={styles.card}>
                        <View style={styles.inputBox}>
                            <Text style={styles.label}>NEW PASSWORD</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#A8A8A8"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#7E5B64" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputBox}>
                            <Text style={styles.label}>CONFIRM PASSWORD</Text>
                            <TextInput
                                style={styles.inputSimple}
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#A8A8A8"
                            />
                        </View>

                        <TouchableOpacity onPress={handleReset} style={styles.btn}>
                            <LinearGradient colors={['#FFD1DC', '#FED9B8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                                <Text style={styles.btnText}>Update Password 🪄</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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

    backBtn: { padding: 5 },

    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#7E5B64',
        marginLeft: 10
    },

    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'center'
    },

    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#4A3439',
        textAlign: 'center'
    },

    subTitle: {
        fontSize: 14,
        color: '#8B7378',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30
    },

    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 40,
        padding: 25,
        borderWidth: 1,
        borderColor: '#FFF'
    },

    inputBox: {
        marginBottom: 20
    },

    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#7B5F45',
        marginBottom: 8,
        marginLeft: 15
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9EAB3',
        borderRadius: 25,
        paddingHorizontal: 20
    },

    input: {
        flex: 1,
        height: 50,
        color: '#52333C'
    },

    inputSimple: {
        backgroundColor: '#E9EAB3',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 20,
        color: '#52333C'
    },

    btn: {
        marginTop: 10
    },

    gradientBtn: {
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center'
    },

    btnText: {
        color: '#52333C',
        fontWeight: '900',
        fontSize: 16
    }
});

export default ResetPasswordScreen;