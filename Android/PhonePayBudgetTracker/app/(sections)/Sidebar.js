import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { useUserContext } from '../(context)/UserContext';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import { router } from "expo-router";

const Sidebar = ({ onClose }) => {
  const { userData, setUserData } = useUserContext();
  const { clearAccounts } = useAccountContext();
  const { clearTransactions } = useTransactionContext();

  const onLogoutPress = () => {
    setUserData(null);
    clearAccounts();
    clearTransactions();
    router.replace('/loginScreen');
  };

  return (
    <Animated.View
      className="absolute top-0 left-3 bg-neutral-800 h-full w-64 shadow-md"
      entering={FadeInLeft.duration(500).springify()}
    >
      <View className="w-full p-6 border-b border-amber-200">
        <View className="flex-row items-center" style={{ columnGap: 12 }}>
          <View>
            <Text
              className="text-amber-200 text-xl"
              style={{ fontFamily: "SpaceGroteskBold" }}
            >
              {userData?.name || "Guest"}
            </Text>
            <Text
              className="text-neutral-400 text-sm"
              style={{ fontFamily: "SpaceGroteskMedium" }}
            >
              {userData?.email || "Sign in Now"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-4 right-4"
        >
          <Text className="text-neutral-400 text-2xl">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-6">
        {[
          { label: "Dashboard", action: () => {router.replace("/mainScreen"); console.log("Dashboard") }},
          { label: "Analysis", action: () => {router.replace("/analysisScreen"); console.log("Analysis") }},
          { label: "Bill Plan", action: () => {router.replace('/billPlanScreen'); console.log("Bill Plan") }},
          { label: "Profile", action: () => {router.replace("/profileScreen"); console.log("Profile") }},
          { label: "Logout", action: () => { onLogoutPress(); console.log("Logout") }},
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center mb-4 space-x-4 p-2 rounded-md bg-neutral-800"
            onPress={item.action}
          >
            <Text className="text-purple-400 text-lg">{item.icon}</Text>
            <Text
              className="text-amber-200 text-lg"
              style={{ fontFamily: "SpaceGroteskMedium" }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default Sidebar;
