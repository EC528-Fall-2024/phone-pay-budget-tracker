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
          <View className="overflow-hidden">
            <Image
              source={require("../../assets/images/menu_icon.png")}
              style={{
                width: 30,
                height: 30,
              }}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}