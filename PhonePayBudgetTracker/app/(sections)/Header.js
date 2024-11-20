import { View, Text, Image, Switch,TouchableOpacity } from "react-native";
import React from "react";
import { BellIcon } from "react-native-heroicons/outline";
import { useColorScheme } from "nativewind";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Header({toggleSidebar}) {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View>
      <Animated.View
        className="flex-row justify-between items-center"
        entering={FadeInDown.duration(500).springify().delay(100)}
      >
        <TouchableOpacity onPress={toggleSidebar}>
          <View className="border-2 border-white rounded-full overflow-hidden">
            <Image
              source={require("../../assets/images/profile_img.png")}
              style={{
                width: 45,
                height: 45,
              }}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}