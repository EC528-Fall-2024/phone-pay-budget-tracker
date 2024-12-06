import React, {useEffect} from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../(sections)/Accounts";
import Transactions from "../(sections)/Transactions";
import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { colorScheme, useColorScheme } from "nativewind";
import { onLoadScreen } from '../(utils)/loginUtils';
import { useUserContext } from "../(context)/UserContext";

cssInterop(SafeAreaView, { className: "style" });
colorScheme.set("dark");

export default function App() {
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const { userData } = useUserContext();

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

  const backgroundColor = "#121212"; // Neutral-900
  const cardColor = "#1E1E1E"; // Neutral-800
  const textColor = "#FBBF24"; // Amber-200
  const headerTextColor = "#FFFFFF"; // White
  const subTextColor = "#9CA3AF"; // Neutral-400

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor }}>
      <StatusBar style="light" />
      <View onLayout={onLayoutRootView}>
        {sidebarVisible && (
          <>
            <TouchableOpacity
              className="absolute top-0 left-0 h-full w-full z-9 bg-black-800/30"
              onPress={() => setSidebarVisible(false)}
            />
            <Animated.View
              className="absolute top-0 left-0 h-full w-64 z-10 bg-neutral-800 shadow-md"
              style={{
                width: 256,
                transform: [
                  {translateX: sidebarVisible ? 0 : -256,},],}}>
              <Sidebar onClose={() => setSidebarVisible(false)} />
            </Animated.View>
          </>
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