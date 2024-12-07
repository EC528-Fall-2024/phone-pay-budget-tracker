import React from 'react';
import { useState, useEffect, useCallback} from 'react';
import {TextInput, Text, TouchableOpacity, Dimensions} from 'react-native';
import { AppState, View, Image, ScrollView, ActivityIndicator} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Alert } from 'react-native';
import axios from 'axios';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import { router } from "expo-router";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useUserContext } from "../(context)/UserContext";

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
const { height } = Dimensions.get('window'); 

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [showButtons, setShowButtons] = useState(false);
  const [page, setPage] = useState(1);
  usePlaidEmitter((event: LinkEvent) => {
    console.log(event);
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowButtons(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [page]);

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
  const [appState, setAppState] = useState(AppState.currentState);
  const [, forceUpdate] = useState(0); 

  const { transactions, addTransactions } = useTransactionContext();
  const { accounts, addAccounts } = useAccountContext();
  const { userData } = useUserContext();

  const [loading, setLoading] = useState(false);

  const content = [
    {
      title: 'Track Spending',
      description: 'Gain real-time insights into your expenses and monitor where your money goes.',
      gif: require('../../assets/gifs/spending.gif'), // Replace with your spending GIF path
    },
    {
      title: 'Categorize Transactions',
      description: 'Automatically organize your transactions into categories to simplify budgeting.',
      gif: require('../../assets/gifs/transactions.gif'), // Replace with your categorization GIF path
    },
    {
      title: 'Save Smarter',
      description: 'Set savings goals and let us help you track your progress effortlessly.',
      gif: require('../../assets/gifs/savings.gif'), // Replace with your savings GIF path
    },
  ];

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
      await exchangePublicToken(publicToken);
      await fetchTransactions();
      await fetchAccountBalances();
      router.replace('/mainScreen')
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    console.log(page)
    if (page === 1) {
        console.log("fetch link");
        fetchLinkToken();
        setPage(page + 1);
    } if (page === 2) {
        create({token: linkToken});
        setDisabled(false);
        setPage(page + 1);
        console.log("created")
    }
    if (page === 3) {
        onSyncPress();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={content[page - 1].gif}
          style={{
            height: height * 0.4,
            resizeMode: 'contain',
          }}
        />

        <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            {content[page - 1].title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#666',
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            {content[page - 1].description}
          </Text>
        </View>
      </View>
      {showButtons && ( 
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1, 2, 3].map((indicator, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: page === indicator ? '#333' : '#ccc',
                }}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: '#007aff',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
            }}
          >
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
              {page < 3 ? 'NEXT' : 'Link Plaid'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
