import { View, Text, ScrollView } from "react-native";
import React from "react";
import { carousalData } from "../(components)/transactionData";
import CardItem from "../(components)/CardItem";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Card() {
  return (
    <Animated.View
      className="mt-8 mb-4"
      entering={FadeInDown.duration(500).springify().delay(200)}
    >
      <Text
        style={{
          fontFamily: "SpaceGroteskBold",
        }}
        className="text-3xl mb-4 dark:text-white"
      >
        Payment Method
      </Text>

      <ScrollView
        horizontal
        className="snap-x space-x-7"
        showsHorizontalScrollIndicator={false}
      >
        {carousalData.map((item) => (
          <CardItem
            key={item.id}
            imgUrl={item.imgUrl}
            price={item.price}
            cardType={item.cardType}
            cardNumber={item.cardNumber}
            backgroundColor={item.backgroundColor}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}