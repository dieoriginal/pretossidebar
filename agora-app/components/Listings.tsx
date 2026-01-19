import { View, Text, StyleSheet, FlatList, ListRenderItem, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

interface Listing {
    id: string;
    name: string;
    type: string;
    review_scores_rating: number;
    room_type: string;
    price: number;
    image_url: string;
    guests_included: number;
}

interface Props {
    listings: any[];
    category: string;
}

const Listings = ({ listings: items, category }: Props) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Reload listings for category: ', category);
        setLoading(true);
        // Mimic network request
        setTimeout(() => {
            setLoading(false);
        }, 200);
    }, [category]);

    const renderRow: ListRenderItem<Listing> = ({ item }) => (
        <Link href={`/listing/${item.id}`} asChild>
            <TouchableOpacity>
                <View style={styles.listing}>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                    <TouchableOpacity style={{ position: 'absolute', right: 30, top: 30 }}>
                        <Ionicons name="heart-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16, fontFamily: 'System', fontWeight: '600', color: Colors.dark.text }}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            <Ionicons name="star" size={16} color={Colors.dark.text} />
                            <Text style={{ fontFamily: 'System', color: Colors.dark.text }}>{item.review_scores_rating / 20}</Text>
                        </View>
                    </View>
                    <Text style={{ fontFamily: 'System', color: Colors.dark.grey4 }}>{item.room_type}</Text>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'System', fontWeight: '600', color: Colors.dark.text }}>
                            {item.type === 'Venues' ? `Pax ${item.guests_included}` :
                                item.type === 'Artist Profile' ? 'Book Now' :
                                    item.type === 'Ticketing' ? `From €${item.price}` :
                                        `€${item.price}`}
                        </Text>
                        <Text style={{ fontFamily: 'System', color: Colors.dark.grey4 }}>
                            {item.type === 'Venues' ? 'capacity' :
                                item.type === 'Artist Profile' ? 'interactions' :
                                    item.type === 'Education' ? 'per session' :
                                        'starting'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.default}>
            <FlatList
                renderItem={renderRow}
                data={items}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    default: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    listing: {
        padding: 16,
        gap: 10,
        marginVertical: 8,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 16,
    },
});

export default Listings;
