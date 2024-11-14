import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { router } from "expo-router";
import Animated, { FadeInLeft } from 'react-native-reanimated';

const Sidebar = ({ onClose }) => {
  return (

    <Animated.View className="bg-primary w-64 my-6 mx-5" entering={FadeInLeft.duration(500).springify().delay(200)}>
      {/* User Info */}
      <TouchableOpacity onPress={onClose}>
        <View className="flex-row items-center space-x-4">
          <Image
            source={require("../../assets/images/profile_img.png")}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <Text
          className="text-2xl dark:text-white mb-4"
          style={{
            fontFamily: "SpaceGroteskBold",
            lineHeight: 48,
          }}
          >John Doe</Text>
        </View>
      </TouchableOpacity>

      {/* Navigation */}
      <ScrollView className="mt-6 h-full">
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" onPress={() => router.replace("/mainScreen")}>
            <Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" >
        <   Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Data Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" >
        <   Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Financial Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" >
        <   Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Sync Data</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" >
        <   Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Billing Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" onPress={() => router.replace("/profile")}>
        <   Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mb-4 p-2 rounded bg-pumpkin" onPress={() => router.replace("/index")}>
            <Text className="text-l dark:text-white mb-4" style={{fontFamily: "SpaceGroteskBold",}}> Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

export default Sidebar;
