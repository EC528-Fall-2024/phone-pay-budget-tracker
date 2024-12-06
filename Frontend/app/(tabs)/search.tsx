// import React, { useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   SafeAreaView,
//   TextInput,
// } from 'react-native';
// import { getTransactionData } from '../apiService';

// export default function SearchScreen() {
//   const [transactions, setTransactions] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredTransactions, setFilteredTransactions] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await getTransactionData();
//         const transactions = response.map((item) => ({
//           id: item.sk,
//           name: item.expenseName,
//           amount: parseFloat(item.amount),
//           date: item.sk.split('#')[0],
//         }));
//         setTransactions(transactions);
//       } catch (error) {
//         console.error('Error fetching transaction data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (searchQuery === '') {
//       setFilteredTransactions([]);
//     } else {
//       const filtered = transactions.filter((transaction) =>
//         transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredTransactions(filtered);
//     }
//   }, [searchQuery, transactions]);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <Text style={styles.title}>Search Transactions</Text>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search transactions..."
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       <ScrollView style={styles.container}>
//         {filteredTransactions.length > 0 ? (
//           filteredTransactions.map((transaction) => (
//             <View key={transaction.id} style={styles.transactionItem}>
//               <View style={styles.transactionDetails}>
//                 <Text style={styles.transactionName}>{transaction.name}</Text>
//                 <Text style={styles.transactionDate}>{transaction.date}</Text>
//               </View>
//               <Text
//                 style={[
//                   styles.transactionAmount,
//                   { color: transaction.amount < 0 ? '#f44336' : '#4caf50' },
//                 ]}
//               >
//                 {transaction.amount < 0 ? '-' : '+'}$
//                 {Math.abs(transaction.amount).toFixed(2)}
//               </Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noResultsText}>No transactions found</Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#333',
//   },
//   searchInput: {
//     height: 50,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//     fontSize: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   transactionDetails: {
//     flex: 1,
//   },
//   transactionName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   transactionDate: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 5,
//   },
//   transactionAmount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   noResultsText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#999',
//     marginTop: 20,
//   },
// });

// import React, { useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   SafeAreaView,
//   TextInput,
// } from 'react-native';
// import { getTransactionData } from '../apiService';

// export default function SearchScreen() {
//   const [transactions, setTransactions] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredTransactions, setFilteredTransactions] = useState([]);
//   const [hasTransactions, setHasTransactions] = useState(true); // New state to track if transactions exist

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await getTransactionData();

//         // Check if transactions exist
//         if (response.message === 'No transactions found') {
//           setHasTransactions(false);
//           return; // Exit early if no transactions
//         } else {
//           setHasTransactions(true);
//         }

//         const transactions = response.map((item) => ({
//           id: item.sk,
//           name: item.expenseName,
//           amount: parseFloat(item.amount),
//           date: item.sk.split('#')[0],
//         }));
//         setTransactions(transactions);
//       } catch (error) {
//         console.error('Error fetching transaction data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (searchQuery === '') {
//       setFilteredTransactions([]);
//     } else {
//       const filtered = transactions.filter((transaction) =>
//         transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredTransactions(filtered);
//     }
//   }, [searchQuery, transactions]);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <Text style={styles.title}>Search Transactions</Text>
//       {hasTransactions ? (
//         <>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search transactions..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           <ScrollView style={styles.container}>
//             {filteredTransactions.length > 0 ? (
//               filteredTransactions.map((transaction) => (
//                 <View key={transaction.id} style={styles.transactionItem}>
//                   <View style={styles.transactionDetails}>
//                     <Text style={styles.transactionName}>{transaction.name}</Text>
//                     <Text style={styles.transactionDate}>{transaction.date}</Text>
//                   </View>
//                   <Text
//                     style={[
//                       styles.transactionAmount,
//                       { color: transaction.amount < 0 ? '#f44336' : '#4caf50' },
//                     ]}
//                   >
//                     {transaction.amount < 0 ? '-' : '+'}$
//                     {Math.abs(transaction.amount).toFixed(2)}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.noResultsText}>No transactions match your query</Text>
//             )}
//           </ScrollView>
//         </>
//       ) : (
//         <View style={styles.noDataContainer}>
//           <Text style={styles.noDataText}>
//             No transactions available. Link an account to start tracking your spending!
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#333',
//   },
//   searchInput: {
//     height: 50,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//     fontSize: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   transactionDetails: {
//     flex: 1,
//   },
//   transactionName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   transactionDate: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 5,
//   },
//   transactionAmount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   noResultsText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#999',
//     marginTop: 20,
//   },
//   noDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   noDataText: {
//     fontSize: 18,
//     color: '#555',
//     textAlign: 'center',
//   },
// });


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Hook to check if the screen is focused
import { getTransactionData } from '../apiService';

export default function SearchScreen() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [hasTransactions, setHasTransactions] = useState(true); // Track if transactions exist
  const isFocused = useIsFocused(); // Check if the screen is currently in focus

  const fetchData = async () => {
    try {
      const response = await getTransactionData();

      if (response.message === 'No transactions found') {
        setHasTransactions(false);
        setTransactions([]);
        return; // Exit if no transactions
      }

      setHasTransactions(true);

      const transactions = response.map((item) => ({
        id: item.sk,
        name: item.expenseName,
        amount: parseFloat(item.amount),
        date: item.sk.split('#')[0],
      }));

      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  // Fetch data whenever the screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredTransactions([]);
    } else {
      const filtered = transactions.filter((transaction) =>
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Search Transactions</Text>
      {hasTransactions ? (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView style={styles.container}>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: transaction.amount < 0 ? '#f44336' : '#4caf50' },
                    ]}
                  >
                    {transaction.amount < 0 ? '-' : '+'}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noResultsText}>No transactions match your query</Text>
            )}
          </ScrollView>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No transactions available. Link an account to start tracking your spending!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
});
