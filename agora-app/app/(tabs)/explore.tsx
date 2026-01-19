import { View, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import ExploreHeader from '@/components/ExploreHeader';
import Listings from '@/components/Listings';
import Colors from '@/constants/Colors';
import listingsData from '@/assets/data/listings.json';

export default function ExploreScreen() {
    const [category, setCategory] = useState('Venues');

    const items = useMemo(() => {
        if (category === 'Venues' || category === 'All') {
            return listingsData as any;
        }
        return (listingsData as any[]).filter((item) => item.type === category);
    }, [category]);

    const onDataChanged = (category: string) => {
        setCategory(category);
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
            <Stack.Screen
                options={{
                    header: () => <ExploreHeader onCategoryChanged={onDataChanged} />,
                }}
            />
            <Listings listings={items} category={category} />
        </View>
    );
}

const styles = StyleSheet.create({});
