import React from 'react';
import {TextInput, Text, TouchableOpacity} from 'react-native';
import {styles} from '../(styles)/linkScreen.styles';
import { useState } from 'react';
import { Button, Alert } from 'react-native';
import axios from 'axios';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import { router } from "expo-router";

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

function isValidString(str: string): boolean {
  if (str && str.trim() !== '') {
    return true;
  }
  return false;
}

function createLinkTokenConfiguration(
  token: string,
  noLoadingState: boolean = false,
  ): LinkTokenConfiguration {
  console.log(`token: ${token}`);
  return {
    token: token,
    // Hides native activity indicator if true.
    noLoadingState: noLoadingState,
  };
}

function createSubmissionData(phoneNumber: string): SubmissionData {
  return {
    phoneNumber: phoneNumber,
  };
}



export default function PlaidLinkScreen() {
  // Render using the link_token integration. Refer to the docs
  // https://plaid.com/docs/#create-link-token on how to create
  // a new link_token.

  // Use event emitter to get real time events during a Link Session.
  usePlaidEmitter((event: LinkEvent) => {
    console.log(event);
  });

  const [linkToken, setLinkToken] = React.useState('');

  const [text, onChangeText] = React.useState('');
  const [disabled, setDisabled] = React.useState(true);
  const [publicToken, setPublicToken] = useState('');

  const { transactions, addTransactions } = useTransactionContext();
  const { accounts, addAccounts } = useAccountContext();

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
        user_id: 'EFubzb6vVXbCx1iCSVoOzKmY2k23',
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
      const userId = 'KX1AXEGMHgfMlawWDNTQlx4Z8O43';
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
      const userId = 'KX1AXEGMHgfMlawWDNTQlx4Z8O43';
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

      addTransactions(pAccounts);
      console.log("saved:", accounts);

    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  };


  return (
    <>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="link-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        placeholderTextColor={'#D3D3D3'}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (isValidString(text)) {
            const tokenConfiguration = createLinkTokenConfiguration('text');
            create(tokenConfiguration);
            setDisabled(false);
          }
        }}>
        <Text style={styles.button}>Fucked up</Text>
      </TouchableOpacity>


      <TouchableOpacity
        disabled={disabled}
        style={disabled ? styles.disabledButton : styles.button}
        onPress={() => {
          const submissionData = createSubmissionData('415-555-0015');
          submit(submissionData);
        }}>
        <Text style={styles.button}>Dont Press</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={fetchLinkToken}>
        <Text style={styles.button}>Generate Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
            create({token: linkToken});
            setDisabled(false);
          }
        }>
        <Text style={styles.button}>Create Link</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={disabled ? styles.disabledButton : styles.button}
        onPress={() => {
          const openProps = createLinkOpenProps();
          open(openProps);
        }}
        disabled={disabled}>
        <Text style={styles.button}>Link Bank</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.button} onPress={() => exchangePublicToken(publicToken)}>
        <Text style={styles.button}>Get acesss token</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => fetchTransactions()}>
        <Text style={styles.button}>Get Transactions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => fetchAccountBalances()}>
        <Text style={styles.button}>Get Accounts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/mainScreen")}>
        <Text style={styles.button}>Main Screen</Text>
      </TouchableOpacity>
    </>
  );
}