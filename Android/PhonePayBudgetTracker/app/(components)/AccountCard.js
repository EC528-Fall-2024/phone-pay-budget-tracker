import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import React from "react";

const { width, height } = Dimensions.get("window");

export default function CardItem({
  price,
  cardType,
  cardName,
  cardNumber,
}) {
  return (
    <TouchableOpacity className="mr-4 snap-center">
      <View
        className="rounded-3xl py-8 px-4 justify-between"
        style={{
          width: width * 0.8,
          height: height * 0.2,
          backgroundColor: "#0369A1",
        }}>

        <View className="space-y-2">
          
          <Text
            className="text-2xl text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {cardName}
          </Text>
          <Text
            className="text-m text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {cardNumber}
          </Text>
        </View>
        
        <View className="space-y-2 ">
          <Text
            className="text-3xl text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {price}
          </Text>

          <Text
            className="font-medium text-lg text-white"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {cardType}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}