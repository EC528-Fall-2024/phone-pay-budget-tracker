import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
<<<<<<< HEAD
import { useUser } from '../(context)/UserContext';
// import axios from 'axios';
=======
import { getTransactionData } from '../apiService';  // Import your API call function
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b

export default function HomeScreen() {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    monthlySpending: 0,
    recentTransactions: [],
  });

<<<<<<< HEAD
//   const [recentTransactions, setRecentTransactions] = useState([]);
//   const [error, setError] = useState<string | null>(null);

  const financialData = {
    balance: 8500.75,
    monthlySpending: 1200.50,
    recentTransactions: [
      //Sorted dates for expenses
      { id: 2, name: 'Rent', amount: -850.0, date: '09/01/24' },
      { id: 4, name: 'Electricity Bill', amount: -100.0, date: '09/05/24' },
      { id: 3, name: 'Salary', amount: 3000.0, date: '09/10/24' },
      { id: 5, name: 'Gym Membership', amount: -60.0, date: '09/12/24' },
      { id: 1, name: 'Groceries', amount: -150.0, date: '09/15/24' },
      { id: 6, name: 'Freelance Payment', amount: 500.0, date: '09/18/24' },
      { id: 7, name: 'Car Insurance', amount: -200.0, date: '09/20/24' },
      { id: 8, name: 'Dining Out', amount: -120.0, date: '09/22/24' },
      { id: 9, name: 'Rent', amount: -850.0, date: '10/01/24' },
      { id: 10, name: 'Groceries', amount: -175.0, date: '10/05/24' },
    ],
  };

  // Sort transactions from oldest to newest based on the date
  const sortedTransactions = financialData.recentTransactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Prepare data for the graph
  const transactionAmounts = sortedTransactions.map((t) => t.amount);
  const transactionDates = sortedTransactions.map((t) => t.date);
=======
  const [loading, setLoading] = useState(true);

  // API call to fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTransactionData(); // Make the API call
        
        // Map the response to the format needed for recent transactions
        const transactions = response.map((item) => ({
          id: item.sk,  // Use the `sk` as unique transaction ID
          name: item.expenseName,  // Map `expenseName` to `name`
          amount: parseFloat(item.amount),  // Convert the string `amount` to a float
          date: item.sk.split('#')[0],  // Extract date part from `sk`
        }));
        
        // Calculate balance, spending, etc. as needed
        const balance = 8500.75; // Example balance, adjust as needed
        const monthlySpending = transactions.reduce((acc, transaction) => {
          return transaction.amount < 0 ? acc + Math.abs(transaction.amount) : acc;
        }, 0);

        // Update state with the fetched data
        setFinancialData({
          balance,
          monthlySpending,
          recentTransactions: transactions,
        });
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false); // Hide loading spinner when the data is fetched
      }
    };

    fetchData();
  }, []);
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b

  // Prepare data for the graph
  const transactionAmounts = financialData.recentTransactions.map((t) => t.amount);
  const transactionDates = financialData.recentTransactions.map((t) => t.date);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.welcomeText}>
<<<<<<< HEAD
        Welcome, {userData ? userData.name : 'Guest'}
=======
        Welcome, {'Guest'}
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
      </Text>
      <ScrollView style={styles.container}>
        {/* Current Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>${financialData.balance.toFixed(2)}</Text>
        </View>

        {/* Monthly Spending */}
        <View style={styles.spendingContainer}>
          <Text style={styles.spendingLabel}>Monthly Spending</Text>
          <Text style={styles.spendingValue}>${financialData.monthlySpending.toFixed(2)}</Text>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
<<<<<<< HEAD
          {sortedTransactions.map((transaction) => (
=======
          {financialData.recentTransactions.map((transaction) => (
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.amount < 0 ? styles.negative : styles.positive,
                ]}
              >
                {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Graph showing the recent transactions */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Transaction Amounts Over Time</Text>
          <LineChart
            data={{
              labels: transactionDates.slice(0, 6), // Show first 6 dates
              datasets: [
                {
                  data: transactionAmounts.slice(0, 6), // Show first 6 amounts
                },
              ],
            }}
            width={Dimensions.get('window').width - 40} // Adjusted width
            height={250}
            yAxisLabel="$"
            yAxisSuffix=""
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', 
  },
  balanceContainer: {
    backgroundColor: '#4caf50',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  spendingContainer: {
    backgroundColor: '#ff9800',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  spendingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  spendingValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  transactionsTitle: {
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
  transactionDetails: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  transactionDate: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    textAlign: 'left',
  },
  transactionAmount: {
    fontSize: 16,
    textAlign: 'right',
    flex: 0.5,
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center', // Center the chart horizontally
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    alignItems: 'center', // Center the chart content
  },
<<<<<<< HEAD
});

//   // Fetch recent transactions from the API
//   const fetchTransactions = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/trans-dataanalysis');
//       setRecentTransactions(response.data);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load transactions.');
//     }
//   };

//   // Fetch the data when the component mounts
//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         {/* Recent Transactions */}
//         <View style={styles.transactionsContainer}>
//           <Text style={styles.transactionsTitle}>Recent Transactions</Text>
//           {error && <Text style={{ color: 'red' }}>{error}</Text>}
//           {recentTransactions.map((transaction, index) => (
//             <View key={index} style={styles.transactionItem}>
//               <View style={styles.transactionDetails}>
//                 <Text style={styles.transactionName}>{transaction.name}</Text>
//                 <Text style={styles.transactionDate}>{transaction.date}</Text>
//               </View>
//               <Text
//                 style={[
//                   styles.transactionAmount,
//                   transaction.amount < 0 ? styles.negative : styles.positive,
//                 ]}
//               >
//                 {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
//               </Text>
//             </View>
//           ))}
//         </View>
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
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   transactionsContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//   },
//   transactionsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   transactionDetails: {
//     flexDirection: 'row',
//     flex: 1,
//   },
//   transactionName: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'left',
//   },
//   transactionDate: {
//     flex: 1,
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'left',
//   },
//   transactionAmount: {
//     fontSize: 16,
//     textAlign: 'right',
//     flex: 0.5,
//   },
//   positive: {
//     color: '#4caf50',
//   },
//   negative: {
//     color: '#f44336',
//   },
// });
=======
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
});
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
