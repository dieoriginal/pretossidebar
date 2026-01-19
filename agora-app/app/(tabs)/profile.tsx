import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ArtistProfileScreen() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Artist Studio</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={26} color={Colors.dark.text} />
                </TouchableOpacity>
            </View>

            {session ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{session.user.email?.[0].toUpperCase()}</Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark.text }}>{session.user.email.split('@')[0]}</Text>
                                <Text style={{ color: Colors.dark.tint }}>Verified Artist</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>1.2M</Text>
                            <Text style={styles.statLabel}>Listeners</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>45</Text>
                            <Text style={styles.statLabel}>Gigs</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>Releases</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ecosystem Management</Text>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="musical-notes" size={24} color={Colors.dark.tint} />
                            <Text style={styles.menuText}>My Catalog (DistroKid)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="videocam" size={24} color={Colors.dark.tint} />
                            <Text style={styles.menuText}>Audiovisual Projects</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="document-text" size={24} color={Colors.dark.tint} />
                            <Text style={styles.menuText}>Sync Licensing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="school" size={24} color={Colors.dark.tint} />
                            <Text style={styles.menuText}>Education & Mentoship</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
                        <Text style={styles.logoutText}>Log Out Studio Session</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View style={styles.content}>
                    <Ionicons name="musical-note" size={80} color={Colors.dark.grey2} />
                    <Text style={styles.title}>Join the Ecosystem</Text>
                    <Text style={styles.subtitle}>Manage your music career, book venues, and distribute worldwide.</Text>

                    <Link href="/(modals)/login" asChild>
                        <TouchableOpacity style={styles.btn}>
                            <Text style={styles.btnText}>Connect Studio</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.dark.grey,
        padding: 20,
        borderRadius: 20,
        marginHorizontal: 24,
        marginTop: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.dark.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 24,
        marginTop: 20,
    },
    statBox: {
        backgroundColor: Colors.dark.grey,
        padding: 15,
        borderRadius: 15,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statNumber: {
        color: Colors.dark.text,
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: Colors.dark.grey4,
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginTop: 30,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.grey,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        gap: 15,
    },
    menuText: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.dark.grey4,
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    btn: {
        backgroundColor: Colors.dark.primary,
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
    },
    btnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    logoutBtn: {
        alignItems: 'center',
        marginTop: 40,
        paddingVertical: 10,
    },
    logoutText: {
        color: Colors.dark.error,
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});

