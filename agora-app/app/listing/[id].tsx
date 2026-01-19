import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import listingsData from '@/assets/data/listings.json';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated, { SlideInDown, useAnimatedRef, useScrollViewOffset, useAnimatedStyle, interpolate } from 'react-native-reanimated';

const IMG_HEIGHT = 300;
const { width } = Dimensions.get('window');

export default function ListingDetails() {
    const { id } = useLocalSearchParams();
    const listing = (listingsData as any[]).find((item) => item.id === id);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const navigation = useNavigation();

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-IMG_HEIGHT, 0, IMG_HEIGHT],
                        [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
                    ),
                },
                {
                    scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
                },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
                <Animated.Image source={{ uri: listing.image_url }} style={[styles.image, imageAnimatedStyle]} />
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{listing.name}</Text>
                    <Text style={styles.location}>
                        {listing.room_type} in {listing.smart_location}
                    </Text>
                    <Text style={styles.rooms}>
                        {listing.guests_included} capacity · {listing.bedrooms} rooms · {listing.beds} stages ·{' '}
                        {listing.bathrooms} technical riders
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 8 }}>
                        <Ionicons name="star" size={16} color={Colors.dark.text} />
                        <Text style={styles.ratings}>
                            {listing.review_scores_rating / 20} · {listing.number_of_reviews} interactions
                        </Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.hostView}>
                        <Image source={{ uri: listing.host_picture_url }} style={styles.host} />
                        <View>
                            <Text style={{ fontWeight: '500', fontSize: 16, color: Colors.dark.text }}>Managed by {listing.host_name}</Text>
                            <Text style={{ color: Colors.dark.grey4 }}>Member since {listing.host_since}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.description}>{listing.description}</Text>
                </View>
            </Animated.ScrollView>

            <Animated.View style={styles.footer} entering={SlideInDown.delay(200)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.footerText}>
                        <Text style={styles.footerPrice}>€{listing.price}</Text>
                        <Text style={{ color: Colors.dark.grey4 }}>base</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, { paddingHorizontal: 20 }]}>
                        <Text style={styles.btnText}>Enquire Now</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    image: {
        height: IMG_HEIGHT,
        width,
    },
    infoContainer: {
        padding: 24,
        backgroundColor: Colors.dark.background,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'System',
        color: Colors.dark.text,
    },
    location: {
        fontSize: 18,
        marginTop: 10,
        fontFamily: 'System',
        color: Colors.dark.text,
    },
    rooms: {
        fontSize: 16,
        color: Colors.dark.grey4,
        marginVertical: 4,
        fontFamily: 'System',
    },
    ratings: {
        fontSize: 16,
        fontFamily: 'System',
        color: Colors.dark.text,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.dark.grey2,
        marginVertical: 16,
    },
    host: {
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: Colors.dark.grey2,
    },
    hostView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footer: {
        position: 'absolute',
        height: 100,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.dark.background,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopColor: Colors.dark.grey2,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerText: {
        height: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerPrice: {
        fontSize: 18,
        fontFamily: 'System',
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    btn: {
        backgroundColor: Colors.dark.primary,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'System',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginTop: 10,
        fontFamily: 'System',
        color: Colors.dark.text,
    },
});
