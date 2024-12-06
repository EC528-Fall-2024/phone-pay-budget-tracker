import React, { useEffect, useState } from 'react';
import { useCallback} from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DonutChart from '../(components)/DonutChart';
import { useTransactionContext } from '../(context)/transactionContext'; // Import TransactionContext
import RenderItem from '../(components)/RenderItem';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { calculatePercentage } from '../(utils)/calculateUtils';
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import {useFont} from '@shopify/react-native-skia';
import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";

import { useFonts } from "expo-font";
import Animated from "react-native-reanimated";

interface Data {
    value: number;
    name: string;
    percentage: number;
    color: string;
  }

const MAX_NAME_LENGTH = 15;
const RADIUS = 160;
const STROKE_WIDTH = 30;
const OUTER_STROKE_WIDTH = 46;
const GAP = 0.04;
const colors = ['#fe769c', '#46a0f8', '#c3f439', '#88dabc', '#e43433', '#8fffa0'];

export const DonutChartContainer = () => {
  const { transactions } = useTransactionContext(); // Fetch transactions
  const [data, setData] = useState<Data[]>([]);
  const totalValue = useSharedValue(0);
  const decimals = useSharedValue<number[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  const font = useFont(require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"), 60);
  const smallFont = useFont(require("../../assets/fonts/SpaceGrotesk-Medium.ttf"), 25);

  const generateData = () => {
    const groupedTransactions = transactions.reduce((acc, transaction) => {
        const truncatedName =
      transaction.name.length > MAX_NAME_LENGTH
        ? transaction.name.substring(0, MAX_NAME_LENGTH) + "..."
        : transaction.name;
    acc[truncatedName] = (acc[truncatedName] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);
    
    const amounts = Object.values(groupedTransactions);
    const names = Object.keys(groupedTransactions);
    const total = amounts.reduce((acc, amount) => acc + amount, 0);
    const percentages = calculatePercentage(amounts, total);

    const arrayOfObjects = amounts.map((value, index) => ({
      value,
      name: names[index],
      percentage: percentages[index],
      color: colors[index % colors.length],
    }));

    totalValue.value = withTiming(total, { duration: 1000 });
    decimals.value = percentages.map((p) => Number(p.toFixed(0)) / 100);
    setData(arrayOfObjects);
  };

  // Execute on mount
  useEffect(() => {
    generateData();
  }, []); // Empty dependency array ensures this runs only on mount

  if (!font || !smallFont) {
    return <View />;
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
          <View className="px-6"></View>
      
      <ScrollView
        contentContainerStyle={{ alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{width: RADIUS * 2,height: RADIUS * 2, marginTop: 10, marginBottom: 20}}>
          <DonutChart
            radius={RADIUS}
            gap={GAP}
            strokeWidth={STROKE_WIDTH}
            outerStrokeWidth={OUTER_STROKE_WIDTH}
            totalValue={totalValue}
            n={data.length}
            decimals={decimals}
            colors={colors}
            font={font} 
            smallFont={smallFont}
          />
        </View>
        {data.map((item, index) => (
          <RenderItem item={item} key={index} index={index} />
        ))}
      </ScrollView>
      </View>
      </View>
    </SafeAreaView>
  );
};


export default DonutChartContainer;
