import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

const categories = [
    {
        name: 'Venues',
        icon: 'place',
    },
    {
        name: 'Artist Profile',
        icon: 'person-pin',
    },
    {
        name: 'Obra Erudita',
        icon: 'auto-stories',
    },
    {
        name: 'Ticketing',
        icon: 'confirmation-number',
    },
    {
        name: 'Audiovisual',
        icon: 'videocam',
    },
    {
        name: 'Beats',
        icon: 'speaker',
    },
    {
        name: 'Sync',
        icon: 'sync',
    },
    {
        name: 'Superstar',
        icon: 'star',
    },
    {
        name: 'Education',
        icon: 'school',
    },
    {
        name: 'Playbook',
        icon: 'menu-book',
    },
    {
        name: 'Sponsorships',
        icon: 'monetization-on',
    },
    {
        name: 'Distrokid',
        icon: 'cloud-upload',
    },
];

interface Props {
    onCategoryChanged: (category: string) => void;
}

const ExploreHeader = ({ onCategoryChanged }: Props) => {
    const scrollRef = useRef<ScrollView>(null);
    const itemsRef = useRef<Array<View | null>>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const selectCategory = (index: number) => {
        const selected = itemsRef.current[index];
        setActiveIndex(index);
        onCategoryChanged(categories[index].name);
        Haptics.selectionAsync();

        selected?.measure((x: number) => {
            scrollRef.current?.scrollTo({ x: x - 16, y: 0, animated: true });
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.actionRow}>
                <Link href="/(modals)/login" asChild>
                    <TouchableOpacity style={styles.searchBtn}>
                        <Ionicons name="search" size={24} color={Colors.dark.text} />
                        <View>
                            <Text style={{ fontFamily: 'System', fontWeight: '600', color: Colors.dark.text }}>Where to?</Text>
                            <Text style={{ color: Colors.dark.grey4, fontFamily: 'System', fontSize: 12 }}>Venues · Artists · Events</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: 'center',
                    gap: 30,
                    paddingHorizontal: 16,
                }}>
                {categories.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        ref={(el) => { itemsRef.current[index] = el; }}
                        style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}
                        onPress={() => selectCategory(index)}>
                        <MaterialIcons
                            name={item.icon as any}
                            size={24}
                            color={activeIndex === index ? Colors.dark.text : Colors.dark.grey4}
                        />
                        <Text
                            style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.background,
        height: 140,
        borderBottomColor: Colors.dark.grey,
        borderBottomWidth: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 10,
    },
    searchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderColor: Colors.dark.grey2,
        borderWidth: StyleSheet.hairlineWidth,
        flex: 1,
        padding: 10,
        borderRadius: 30,
        backgroundColor: Colors.dark.grey,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: {
            width: 1,
            height: 1,
        },
    },
    filterBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.dark.grey2,
        borderRadius: 24,
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'System',
        color: Colors.dark.grey4,
    },
    categoryTextActive: {
        fontSize: 14,
        fontFamily: 'System',
        color: Colors.dark.text,
        fontWeight: '600',
    },
    categoriesBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
    },
    categoriesBtnActive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: Colors.dark.tint,
        borderBottomWidth: 2,
        paddingBottom: 8,
    },
});

export default ExploreHeader;
