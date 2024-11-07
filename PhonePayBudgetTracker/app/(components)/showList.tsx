import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns'; // Optional for date formatting
import { router } from 'expo-router';
import BillItem from './billItem'; // Component for each bill in the list

type Transaction = {
    id: number;
    name: string;
    amount: number;
    date: string;
  };

const MonthListScreen = () => {
  const [billList, setBillList] = useState([]); // List of bills
  const [year, setYear] = useState(format(new Date(), 'yyyy')); // Current year
  const [month, setMonth] = useState(format(new Date(), 'MM')); // Current month
  const [outcome, setOutcome] = useState(''); // Total outcome
  const [income, setIncome] = useState(''); // Total income
  const [total, setTotal] = useState(''); // Total balance
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const navigation = useNavigation();

  {/*
  // Fetch data when the component mounts
  useEffect(() => {
    fetchMonthData();
  }, [year, month]); // Re-fetch when year or month changes

  const fetchMonthData = async () => {
    try {
      // Simulating API call here
      const response = await fetch(`/api/month/${year}/${month}`); // Adjust the API call
      const data = await response.json();

      setBillList(data.daylist);
      setOutcome(data.t_outcome);
      setIncome(data.t_income);
      setTotal(data.t_total);
    } catch (error) {
      console.error('Error fetching month data:', error);
    }
  };*/}

  useEffect(() => {
    // Sample data as per your request
    const recentTransactions: Transaction[] = [
      { id: 2, name: 'Rent', amount: -850.0, date: '10/01/24' },
      { id: 4, name: 'Electricity Bill', amount: -100.0, date: '10/05/24' },
      { id: 3, name: 'Salary', amount: 3000.0, date: '10/10/24' },
      { id: 5, name: 'Gym Membership', amount: -60.0, date: '10/12/24' },
      { id: 1, name: 'Groceries', amount: -150.0, date: '10/15/24' },
      { id: 6, name: 'Freelance Payment', amount: 500.0, date: '10/18/24' },
      { id: 7, name: 'Car Insurance', amount: -200.0, date: '10/20/24' },
      { id: 8, name: 'Dining Out', amount: -120.0, date: '10/22/24' },
      { id: 9, name: 'Rent', amount: -850.0, date: '11/01/24' },
      { id: 10, name: 'Groceries', amount: -175.0, date: '11/05/24' },
    ];

    // Set the transactions state with this data
    setTransactions(recentTransactions);
  }, []);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionName}>{item.name}</Text>
      <Text style={styles.transactionDate}>{item.date}</Text>
      <Text
        style={[
          styles.transactionAmount,
          item.amount < 0 ? styles.negativeAmount : styles.positiveAmount,
        ]}
      >
        {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>

      {/* FlatList to render the transactions */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#694fad',
          padding: 15,
          borderRadius: 50,
        }}
        onPress={() => router.replace('/addTransaction')}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>+ Add Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    transactionName: {
      fontSize: 16,
      color: '#333',
      flex: 1, // Takes 1/3 of the available width
    },
    transactionAmount: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center', // Center the amount in the middle column
      flex: 1, // Takes 1/3 of the available width
    },
    transactionDate: {
      fontSize: 14,
      color: '#999',
      textAlign: 'right', // Align the date to the right
      flex: 1, // Takes 1/3 of the available width
    },
    positiveAmount: {
      color: 'green',
    },
    negativeAmount: {
      color: 'red',
    },
  });
  
  

export default MonthListScreen;
