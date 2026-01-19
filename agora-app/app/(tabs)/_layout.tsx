import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const TabBarIcon = ({ focused, name, color }: { focused: boolean; name: React.ComponentProps<typeof Ionicons>['name']; color: string }) => {
    return <Ionicons size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.dark.tint,
                tabBarInactiveTintColor: Colors.dark.tabIconDefault,
                tabBarStyle: {
                    ...Platform.select({
                        ios: {
                            position: 'absolute',
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slate 900 with alpha
                            borderTopWidth: 0,
                            elevation: 0,
                        },
                        default: {
                            backgroundColor: '#0F172A',
                        },
                    }),
                },
                tabBarBackground: () => (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.95)' : '#0F172A' }
                        ]}
                    />
                ),
            }}>
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Ecosystem',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'apps' : 'apps-outline'} color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="wishlists"
                options={{
                    title: 'Venues',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'business' : 'business-outline'} color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Tickets',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'ticket' : 'ticket-outline'} color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="inbox"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Artist',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'musical-note' : 'musical-note-outline'} color={color} focused={focused} />,
                }}
            />
        </Tabs>
    );
}
