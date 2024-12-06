import React from 'react';
import { useState, useEffect, useCallback} from 'react';
import {TextInput, Text, TouchableOpacity} from 'react-native';
import { AppState, View, Image, ScrollView, ActivityIndicator} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {styles} from '../(styles)/linkScreen.styles';
import { Button, Alert } from 'react-native';
import axios from 'axios';
import { useUserContext } from '../(context)/UserContext';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import { router } from "expo-router";

import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Animated from "react-native-reanimated";

interface Transaction {
  account_id: string;
  amount: number;
  authorized_date: string;
  iso_currency_code: string;
  logo_url: string;
  merchant_name: string;
  name: string;
  payment_channel: string;
}

interface Account {
  account_id: string;
  balances: {
    current: number;
    limit: number | null;
    iso_currency_code: string;
  };
  mask: string;
  name: string;
  subtype: string;
  type: string;
}

import {
  LinkExit,
  LinkEvent,
  LinkLogLevel,
  LinkSuccess,
  dismissLink,
  LinkOpenProps,
  usePlaidEmitter,
  LinkIOSPresentationStyle,
  LinkTokenConfiguration,
  submit,
  SubmissionData,
} from 'react-native-plaid-link-sdk';

import {create, open} from 'react-native-plaid-link-sdk';



export default function profileScreen() {
  const backgroundColor = "#121212"; // Neutral-900
  const cardColor = "#1E1E1E"; // Neutral-800
  const textColor = "#FBBF24"; // Amber-200
  const subTextColor = "#9CA3AF"; // Neutral-400
  const buttonBackgroundColor = "#FDE68A"; // Amber-100
  const buttonTextColor = "#111827"; // Neutral-900

  const { setUserData } = useUserContext();
  const { clearAccounts } = useAccountContext();
  const { clearTransactions } = useTransactionContext();

  usePlaidEmitter((event: LinkEvent) => {
    console.log(event);
  });

  const onLogoutPress = () => {
    setUserData(null);
    clearAccounts();
    clearTransactions();
    router.replace('/loginScreen');
  };

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { transactions, addTransactions } = useTransactionContext();
  const { accounts, addAccounts } = useAccountContext();
  const { userData } = useUserContext();

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
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 24,
                  color: textColor,
                  fontFamily: "SpaceGroteskBold",
                  marginTop: 16,
                }}
              >
                {userData?.name || "Guest"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: subTextColor,
                  fontFamily: "SpaceGroteskMedium",
                }}
              >
                {userData?.email || "guest@example.com"}
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 24,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                  backgroundColor: buttonBackgroundColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: buttonTextColor,
                    fontFamily: "SpaceGroteskBold",
                  }}
                >
                  Upgrade Bill Plan
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {[
                { label: "Your Profile", icon: "👤" },
                { label: "Settings", icon: "⚙️" },
                { label: "Payment Method", icon: "🛒" },
                {
                  label: "Help Center",
                  icon: "❓",
                  action: () => {
                    console.log("help center pressed");
                  },
                },
                {
                  label: "Privacy Policy",
                  icon: "🔒",
                  action: () => {
                    console.log("privacy policy pressed");
                  },
                },
                {
                  label: "Logout",
                  icon: "🚪",
                  action: () => onLogoutPress()
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={isLoading}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    marginVertical: 8,
                    width: "85%",
                    backgroundColor: cardColor,
                  }}
                  onPress={item.action || (() => {})}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 20, color: textColor, marginRight: 12 }}>
                      {item.icon}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: textColor,
                        fontFamily: "SpaceGroteskSemiBold",
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 24, color: subTextColor }}>{">"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}