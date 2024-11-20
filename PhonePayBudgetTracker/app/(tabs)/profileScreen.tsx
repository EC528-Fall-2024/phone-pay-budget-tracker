import React from 'react';
import { useCallback} from 'react';
import {TextInput, Text, TouchableOpacity} from 'react-native';
import { View, Image, ScrollView, ActivityIndicator} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {styles} from '../(styles)/linkScreen.styles';
import { useState } from 'react';
import { Button, Alert } from 'react-native';
import axios from 'axios';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import { router } from "expo-router";

import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useUserContext } from "../(context)/UserContext";
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



export default function PlaidLinkScreen() {
  // Render using the link_token integration. Refer to the docs
  // https://plaid.com/docs/#create-link-token on how to create
  // a new link_token.

  // Use event emitter to get real time events during a Link Session.
  usePlaidEmitter((event: LinkEvent) => {
    console.log(event);
  });

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

  const [linkToken, setLinkToken] = React.useState('');

  const [text, onChangeText] = React.useState('');
  const [disabled, setDisabled] = React.useState(true);
  const [publicToken, setPublicToken] = useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { transactions, addTransactions } = useTransactionContext();
  const { accounts, addAccounts } = useAccountContext();
  const { userData } = useUserContext();

  const [loading, setLoading] = useState(false);

  function createLinkOpenProps(): LinkOpenProps {
    return {
      onSuccess: (success: LinkSuccess) => {
        // User was able to successfully link their account.
        console.log('Success: ', success);
        success.metadata.accounts.forEach(it => console.log('accounts', it));
        const { publicToken } = success;
        setPublicToken(publicToken);
        console.log('Public Token:', publicToken);
      },
      onExit: (linkExit: LinkExit) => {
        console.log('Exit: ', linkExit);
        dismissLink();
      },
      // MODAL or FULL_SCREEEN presentation on iOS. Defaults to MODAL.
      iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
      logLevel: LinkLogLevel.ERROR,
    };
  }

  const fetchLinkToken = async () => {
    try {
      const response = await axios.post('https://us-central1-phonepaybudgettracker.cloudfunctions.net/createLinkToken');
      const data = response.data;
      console.log(data);
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          Alert.alert('Error', error.response.data.error || 'Unable to fetch link token');
        } else {
          Alert.alert('Error', 'Unable to fetch link token');
        }
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };
  
  const exchangePublicToken = async (publicToken: string) => {
    try {
      const response = await axios.post('https://us-central1-phonepaybudgettracker.cloudfunctions.net/exchangePublicToken', {
        public_token: publicToken,
        user_id: userData?.uid ||  'KX1AXEGMHgfMlawWDNTQlx4Z8O43',
      });
      const { access_token, item_id } = response.data;
  
      // Store or use the access token and item ID as needed
      console.log('Access Token:', access_token);
      console.log('Item ID:', item_id);
    } catch (error) {
      console.error('Error exchanging public token:', error);
      Alert.alert('Error', 'Unable to exchange public token');
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const userId = userData?.uid || 'KX1AXEGMHgfMlawWDNTQlx4Z8O43';
      const response = await fetch('https://us-central1-phonepaybudgettracker.cloudfunctions.net/fetchTransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      const pTransactions = data.transactions.map((transaction :Transaction) => ({
        account_id: transaction.account_id,
        amount: Math.abs(transaction.amount),
        authorized_date: transaction.authorized_date,
        iso_currency_code: transaction.iso_currency_code,
        logo_url: transaction.logo_url,
        name: transaction.name,
        payment_channel: transaction.payment_channel
    }));
    
    console.log("parsed:", pTransactions);
    addTransactions(pTransactions);
    console.log("saved:", transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Could not fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountBalances = async () => {
    try {
      const userId = userData?.uid || 'KX1AXEGMHgfMlawWDNTQlx4Z8O43';
      const response = await fetch('https://us-central1-phonepaybudgettracker.cloudfunctions.net/getAccountBalances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch account balances');
      }
  
      const data = await response.json();
      console.log('Account Balances:', data.accounts);
      
      const pAccounts = data.accounts.map((account :Account) => ({
        account_id: account.account_id,
        current_balance: account.balances.current,
        iso_currency_code: account.balances.iso_currency_code || 'N/A',
        credit_limit: account.balances.limit || 0, // Fallback to 0 if null
        mask: account.mask,
        name: account.name,
        subtype: account.subtype,
        type: account.subtype,
      }));

      addAccounts(pAccounts);
      console.log("saved:", accounts);

    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  };


  const onSyncPress = async () => {
    setLoading(true);
  
    try {
      const openProps = createLinkOpenProps();
  
      // Create a Promise that resolves when the user completes the interaction
      const publicToken = await new Promise<string>((resolve, reject) => {
        open({
          ...openProps,
          onSuccess: (linkSuccess) => {
            console.log("Link success object received:", linkSuccess);
            resolve(linkSuccess.publicToken); // Extract publicToken from LinkSuccess
          },
          onExit: (error) => {
            if (error) {
              console.error("User exited with error:", error);
              reject(error); // Reject the promise if there's an error
            } else {
              console.log("User exited without completing the process");
              reject(new Error("User exited the process"));
            }
          },
        });
      });
  
      // Execute after open completes successfully
      await exchangePublicToken(publicToken);
      await fetchTransactions();
      await fetchAccountBalances();
    } catch (error) {
      console.error("Error during sync:", error);
      // Handle error (e.g., show an alert or log it)
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView className="p-6 h-screen dark:bg-neutral-900">
    <StatusBar style={"dark"} />
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
          <View className="px-6">
      <View className="justify-center">
        <View className="items-center mb-10">
          <Image
            source={require("../../assets/images/profile_img.png")}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
            }}
          />
          <Text
            className="text-white text-2xl mt-4"
            style={{ fontFamily: "SpaceGroteskBold" }}
          >
            {userData?.name || "Guest"}
          </Text>
          <Text
            className="text-neutral-400 text-sm"
            style={{ fontFamily: "SpaceGroteskMedium" }}
          >
            {userData?.email || "guest@example.com"}
          </Text>
          <TouchableOpacity className="mt-6 bg-amber-100 py-3 px-8 rounded-full">
            <Text
              className="text-neutral-900 text-base"
              style={{ fontFamily: "SpaceGroteskBold" }}
            >
              Upgrade Bill Plan
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="w-full" contentContainerStyle={{ alignItems: 'center' }}>
          {[
            { label: "Sync with Plaid", 
              icon: "🔄",
              action: () => {
                onSyncPress();
              }
            },
            { label: "Your Profile", icon: "👤" },
            { label: "Settings", icon: "⚙️" },
            { label: "Payment Method", icon: "🛒" },
            { label: "Help Center", 
              icon: "❓",
              action: () => {
                console.log("fetch link");
                fetchLinkToken();
              } },
            { label: "Privacy Policy", 
              icon: "🔒",
              action: () => {
                create({token: linkToken});
                setDisabled(false);
                console.log("created")
              } },
            {
              label: "Logout",
              icon: "🚪",
              action: () => {
                console.log("Logging out...");
                router.replace("/loginScreen");
              },
            },
          ].map((item, index) => (
            <TouchableOpacity
              disabled={isLoading}
              key={index}
              className="flex-row items-center justify-between bg-neutral-800 py-4 px-6 mb-2 mt-2 rounded-full w-5/6"
              onPress={item.action || (() => {})}
            >
              <View className="flex-row items-center space-x-4" style={{ columnGap: 12 }}>
                <Text className="text-white text-xl">{item.icon}</Text>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (<Text
                  className="text-amber-200 text-xl"
                  style={{ fontFamily: "SpaceGroteskSemiBold" }}
                >
                  {item.label}
                </Text>)}
              </View>
              <Text className="text-neutral-400 text-2xl">{">"}</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>
    </View>
      </View>
    </View>
  </SafeAreaView>
  );
}