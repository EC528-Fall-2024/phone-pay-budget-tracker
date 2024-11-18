import { View, Text, Dimensions, Image } from "react-native";
import React from "react";

const { width, height } = Dimensions.get("window");

export default function TransactionCard({
  name,
  payment_channel,
  amount,
  authorized_date,
  account_id,
  logo_url,
}) {
  return (
    <View
      className="rounded-3xl py-8 px-4 justify-between flex-row items-center bg-[#e5e5e5] shadow-sm"
      style={{
        width: "100%",
        maxWidth: width,
        height: height * 0.12,
      }}
    >
      <View className="flex-row space-x-6 items-center justify-center">
        <View className="bg-white rounded-xl">
          <Image
            source={
              logo_url
              ? { uri: logo_url } 
              : require('../../assets/images/profile_img.png') // Use a default or empty image if logoUrl is null
          }
            style={{
              width: 65,
              height: 65,
            }}
            resizeMode="contain"
          />
        </View>

        <View className="space-y-1" style={{ marginLeft: 8 }}>
          {/* Name */}
          <Text
            className="text-2xl"
            style={{
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {name.substring(0, 20)}
          </Text>

          {/* Type */}
          <Text
            className="text-sm text-neutral-500"
            style={{
              fontFamily: "SpaceGroteskMedium",
            }}
          >
            {payment_channel}
          </Text>
        </View>
      </View>

      <View className="space-y-1" style={{ marginLeft: 8 }}>
        {/* Amount */}
        <Text
          className="text-xl"
          style={{
            fontFamily: "SpaceGroteskBold",
          }}
        >
          {"$" + amount.toFixed(2)}
        </Text>

        {/* Date */}
        <Text
          className="text-sm text-neutral-500"
          style={{
            fontFamily: "SpaceGroteskBold",
          }}
        >
          {authorized_date}
        </Text>

        {/* Account */}
        <Text
          className="text-sm text-neutral-500"
          style={{
            fontFamily: "SpaceGroteskBold",
          }}
        >
          {account_id.substring(0, 5)}
        </Text>
      </View>
    </View>
  );
}