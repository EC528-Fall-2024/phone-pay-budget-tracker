import auth from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { checkEmpty, validateEmail} from './validationUtils';
import { useState } from 'react';
import { Alert } from 'react-native';

interface Transaction {
  account_id: string;
  amount: number;
  authorized_date: string;
  iso_currency_code: string;
  logo_url: string;
  merchant_name?: string;
  name: string;
  payment_channel: string;
  category?: string; 
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
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


interface UserData {
  name: string;
  country: string;
  phone: string;
}

export const onLoadScreen = async (
  uid: string,
) => {
  if (uid = "") {
    return;
  }
  const tranDetails = await fetchTransactions(uid);
  const accDetails = await fetchAccountBalances(uid);
}


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export const validateLogin = (
    email: string,
    password: string,
  ) => {
    if (!validateEmail(email)) return 'Invalid email format!';
    if (!checkEmpty(email).isValid) return 'Email cannot be empty!';
    if (!checkEmpty(password).isValid) return 'Password cannot be empty!';
    return '';
  };

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const fetchUserData = async (uid: string) => {
    const functions = getFunctions();
    const getUserData = httpsCallable(functions, 'getUserData');
    try {
      const result = await getUserData({ uid });
      const userData = result.data as UserData;
      console.log('User data fetched successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export const handleLogin = async (
    email: string,
    password: string,
    setUserData: (data: any) => void,
    addTranscations: (data: any) => void,
    addAccounts: (data: any) => void,
    onSuccess: () => void,
    onError: (message: string) => void,
    redirectToMain: () => void,
    redirectToOnBoard: () => void
  ) => {
    try {
      const data = await auth().signInWithEmailAndPassword(email, password);
      const response = await fetchUserData(data.user.uid);
      setUserData({
        uid: data.user.uid,
        email: email,
        name: response.name || '',
        country: response.country ||'',
        phone: response.phone ||'',
      });

      const tranDetails = await fetchTransactions(data.user.uid);
      if (!tranDetails || tranDetails.length === 0) {
        redirectToMain(); 
        return;
      }
      addTranscations(tranDetails);

      const accDetails = await fetchAccountBalances(data.user.uid);
      if (!accDetails || accDetails.length === 0) {
        redirectToMain(); 
        return;
      }
      addAccounts(accDetails);

      onSuccess();
    } catch (error: any) {
        if (error.code === 'auth/invalid-email') {
            onError('That email address is invalid!');
        } else {
            onError('Please check login credentials and try again.');
            console.error(error);
      }
    }
  };

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export const fetchTransactions = async (uid: string) => {
  try {
    const userId = uid;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    const currentYear = currentDate.getFullYear();

    const previousMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    const previousMonth = previousMonthDate.getMonth() + 1;
    const previousYear = previousMonthDate.getFullYear();

    const formatCategory = (rawCategory: string | null | undefined): string => {
      if (!rawCategory) return "Unknown";
      const formatted = rawCategory.replace(/_/g, " "); 
      return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
    };

    const fetchForMonth = async (month: number, year: number) => {
      const response = await fetch(
        "https://us-central1-phonepaybudgettracker.cloudfunctions.net/fetchTransactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, month, year }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions for ${month}/${year}`);
      }

      const data = await response.json();
      // console.log(data)
      return data.transactions.map((transaction: Transaction) => ({
        account_id: transaction.account_id,
        amount: Math.abs(transaction.amount),
        authorized_date: transaction.authorized_date,
        iso_currency_code: transaction.iso_currency_code,
        logo_url: transaction.logo_url,
        name: transaction.merchant_name || transaction.name,
        payment_channel: transaction.payment_channel,
        category: formatCategory(transaction.personal_finance_category?.primary),
      }));
    };

    const currentMonthTransactions = await fetchForMonth(currentMonth, currentYear);
    const previousMonthTransactions = await fetchForMonth(previousMonth, previousYear);

    const allTransactions = [...currentMonthTransactions, ...previousMonthTransactions].sort(
      (a, b) => new Date(a.authorized_date).getTime() - new Date(b.authorized_date).getTime()
    );
    console.log("All transactions fetched and sorted successfully");
    return allTransactions;
  } catch (error) {
    return null;
  }
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export const fetchAccountBalances = async (uid: string)  => {
  try {
    const userId = uid;
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
    console.log('accounts fetched successfully');
    
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

    return pAccounts;

  } catch (error) {
    throw error;
  }
};