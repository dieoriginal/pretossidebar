import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Studio Error', error.message);
        } else {
            router.back();
        }
        setLoading(false);
    };

    const onSignUpPress = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Studio Error', error.message);
        } else {
            Alert.alert('Studio Access', 'Check your email for the confirmation link!');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Ionicons name="close-outline" size={28} color={Colors.dark.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Artist Studio Access</Text>
                <Text style={styles.subtitle}>Enter the EventOS ecosystem</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        autoCapitalize="none"
                        placeholder="Artist Email"
                        placeholderTextColor={Colors.dark.grey4}
                        value={email}
                        onChangeText={setEmail}
                        style={styles.inputField}
                    />
                    <TextInput
                        secureTextEntry
                        placeholder="Password"
                        placeholderTextColor={Colors.dark.grey4}
                        value={password}
                        onChangeText={setPassword}
                        style={styles.inputField}
                    />
                </View>

                <TouchableOpacity style={styles.btn} onPress={onSignInPress} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Open Studio</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.separatorView}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>or join as</Text>
                    <View style={styles.separatorLine} />
                </View>

                <View style={{ gap: 15 }}>
                    <TouchableOpacity style={styles.btnOutline} onPress={onSignUpPress}>
                        <Ionicons name="mail-outline" size={24} color={Colors.dark.text} style={styles.btnIcon} />
                        <Text style={styles.btnOutlineText}>New Artist Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnOutline}>
                        <Ionicons name="logo-google" size={24} color={Colors.dark.text} style={styles.btnIcon} />
                        <Text style={styles.btnOutlineText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnOutline}>
                        <Ionicons name="logo-apple" size={24} color={Colors.dark.text} style={styles.btnIcon} />
                        <Text style={styles.btnOutlineText}>Continue with Apple</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        padding: 26,
    },
    content: {
        marginTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: Colors.dark.text,
        fontFamily: 'System',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.dark.grey4,
        marginBottom: 32,
        fontFamily: 'System',
    },
    closeBtn: {
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputField: {
        height: 55,
        borderWidth: 1,
        borderColor: Colors.dark.grey2,
        borderRadius: 12,
        padding: 15,
        backgroundColor: Colors.dark.grey,
        marginBottom: 16,
        fontSize: 16,
        color: Colors.dark.text,
    },
    btn: {
        backgroundColor: Colors.dark.primary,
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    btnOutline: {
        backgroundColor: Colors.dark.background,
        borderWidth: 1,
        borderColor: Colors.dark.grey2,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    btnOutlineText: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '600',
    },
    btnIcon: {
        position: 'absolute',
        left: 20,
    },
    separatorView: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        marginVertical: 30,
    },
    separatorLine: {
        flex: 1,
        borderBottomColor: Colors.dark.grey2,
        borderBottomWidth: 1,
    },
    separatorText: {
        color: Colors.dark.grey4,
        fontSize: 14,
        fontWeight: '500',
    },
});

