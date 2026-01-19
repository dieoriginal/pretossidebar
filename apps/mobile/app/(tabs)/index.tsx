import React, { useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";

// Placeholder for VenuesMap and VenuesBottomSheet - to be implemented
const Page = () => {
    const [category, setCategory] = useState("Conference");

    const onCategoryChanged = (category: string) => {
        setCategory(category);
    };

    return (
        <View style={{ flex: 1, marginTop: 40 }}>
            <Stack.Screen
                options={{
                    header: () => null, // VenueExploreHeader will go here
                }}
            />
            {/* VenuesMap component will go here */}
            {/* VenuesBottomSheet component will go here */}
        </View>
    );
};

export default Page;
