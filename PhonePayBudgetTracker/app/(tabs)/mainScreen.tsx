import React from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../(sections)/Accounts";
import Transactions from "../(sections)/Transactions";
import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";
import { useColorScheme } from "nativewind";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";

cssInterop(SafeAreaView, { className: "style" });

export default function App() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [sidebarVisible, setSidebarVisible] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../../assets/fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../../assets/fonts/SpaceGrotesk-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaView className="p-6 dark:bg-neutral-900">
      <StatusBar style={"dark"} />
      <View onLayout={onLayoutRootView}>
          {sidebarVisible && (
              <View className="absolute top-0 left-0 h-full w-5/5 z-9 bg-black/30">
              </View>
            )}
          {sidebarVisible && (
              <Animated.View className="absolute top-0 left-0 h-full w-3/5 z-10 bg-gray-800" entering={FadeInLeft.duration(500).springify().delay(200)}>
                <Sidebar onClose={() => setSidebarVisible(false)} />
              </Animated.View>
            )}
            
          <View className="my-6">
          <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

          <Card />

          <Transactions />
        </View>
      </View>
    </SafeAreaView>
  );
}