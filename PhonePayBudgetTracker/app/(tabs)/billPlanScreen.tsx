import React from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState} from 'react';

import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";
import Animated from "react-native-reanimated";

const { width } = Dimensions.get("window");

const billPlanScreen = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const plans = [
    {
      name: "Basic",
      description:
        "Perfect for getting started. Keep track of your transactions for the past month with ease. Simple and effective.",
      features: ["1 Month of Transactions", "Card Support"],
      buttonText: "Current Plan",
      isCurrent: true,
    },
    {
      name: "Standard",
      description:
        "Take your finances to the next level! Access a full year of transactions, enhanced data analysis, and better insights.",
      features: ["1 Year of Transactions", "Detailed Data Analysis"],
      buttonText: "Upgrade Now",
      isCurrent: false,
    },
    {
      name: "Pro",
      description:
        "Maximize your financial potential! Unlimited access to all transactions, advanced data analysis, and financial data insights.",
      features: [
        "All Transactions",
        "Detailed Data Analysis",
        "Comprehensive Financial Data",
      ],
      buttonText: "Upgrade Now",
      isCurrent: false,
    },
  ];

  const backgroundColor = "#121212"; // Neutral-900
  const buttonColor = "#fde68a"; // Amber-200
  const textColor = "#fde68a"; // White
  const cardColor = "#1E1E1E"; // Neutral-800
  const bodyTextColor = "#9CA3AF"; // Neutral-400
  const fontFamily = "SpaceGroteskMedium";

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor }}>
      <StatusBar style="light" />
      <View>
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
        <View style={{ marginVertical: 24 }}>
        <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      <ScrollView>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "SpaceGroteskBold",
            color: textColor,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Choose Your Plan
        </Text>
        {plans.map((plan, index) => (
          <View
            key={index}
            style={{
              backgroundColor: cardColor,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              width: width - 32,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "SpaceGroteskBold",
                color: textColor,
                marginBottom: 8,
              }}
            >
              {plan.name} Plan
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: fontFamily,
                color: bodyTextColor,
                marginBottom: 12,
              }}
            >
              {plan.description}
            </Text>
            <View style={{ marginBottom: 12 }}>
              {plan.features.map((feature, idx) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: 14,
                    fontFamily: fontFamily,
                    color: bodyTextColor,
                    marginBottom: 4,
                  }}
                >
                  - {feature}
                </Text>
              ))}
            </View>
            <TouchableOpacity
              disabled={plan.isCurrent}
              style={{
                backgroundColor: plan.isCurrent ? "#3F3F46" : buttonColor,
                paddingVertical: 12,
                borderRadius: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "SpaceGroteskBold",
                  color: plan.isCurrent ? bodyTextColor : "#000000",
                }}
              >
                {plan.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      </View>
      </View>
    </SafeAreaView>
  );
};

export default billPlanScreen;
