// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { Dimensions } from 'react-native';
// import { getTransactionData } from '../apiService';  // Import your API call function
// import { Auth } from 'aws-amplify';  // Import Amplify Auth

// export default function HomeScreen() {
//   const [financialData, setFinancialData] = useState({
//     balance: 0,
//     monthlySpending: 0,
//     recentTransactions: [],
//   });

//   const [loading, setLoading] = useState(true);

//   const [name, setName] = useState('Guest');

//   // API call to fetch data when component mounts
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const currentUser = await Auth.currentAuthenticatedUser();
//         setName(currentUser.username.toString())

//         const response = await getTransactionData(); // Make the API call

//         console.log("Transaction Data:", response)
        
//         // Map the response to the format needed for recent transactions
//         const transactions = response.map((item) => ({
//           id: item.sk,  // Use the `sk` as unique transaction ID
//           name: item.expenseName,  // Map `expenseName` to `name`
//           amount: parseFloat(item.amount),  // Convert the string `amount` to a float
//           date: item.sk.split('#')[0],  // Extract date part from `sk`
//         }));
        
//         // Calculate balance, spending, etc. as needed
//         const balance = 8500.75; // Example balance, adjust as needed
//         const monthlySpending = transactions.reduce((acc, transaction) => {
//           return transaction.amount < 0 ? acc + Math.abs(transaction.amount) : acc;
//         }, 0);

//         // Update state with the fetched data
//         setFinancialData({
//           balance,
//           monthlySpending,
//           recentTransactions: transactions,
//         });
//       } catch (error) {
//         console.error('Error fetching transaction data:', error);
//       } finally {
//         setLoading(false); // Hide loading spinner when the data is fetched
//       }
//     };

//     fetchData();
//   }, []);

//   // Prepare data for the graph
//   const transactionAmounts = financialData.recentTransactions.map((t) => t.amount);
//   const transactionDates = financialData.recentTransactions.map((t) => t.date);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <Text style={styles.loadingText}>Loading...</Text>
//       </SafeAreaView>
//     );
//   }

 

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <Text style={styles.welcomeText}>
//         Welcome, {name}
//       </Text>
//       <ScrollView style={styles.container}>
//         {/* Current Balance */}
//         <View style={styles.balanceContainer}>
//           <Text style={styles.balanceLabel}>Total Spending</Text>
//           <Text style={styles.balanceValue}>${financialData.balance.toFixed(2)}</Text>
//         </View>

//         {/* Monthly Spending */}
//         <View style={styles.spendingContainer}>
//           <Text style={styles.spendingLabel}>Avg Monthly Spending</Text>
//           <Text style={styles.spendingValue}>${financialData.monthlySpending.toFixed(2)}</Text>
//         </View>

//         {/* Recent Transactions */}
//         <View style={styles.transactionsContainer}>
//           <Text style={styles.transactionsTitle}>Recent Transactions</Text>
//           {financialData.recentTransactions.map((transaction) => (
//             <View key={transaction.id} style={styles.transactionItem}>
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

//         {/* Graph showing the recent transactions */}
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>Transaction Amounts Over Time</Text>
//           <LineChart
//             data={{
//               labels: transactionDates.slice(0, 6), // Show first 6 dates
//               datasets: [
//                 {
//                   data: transactionAmounts.slice(0, 6), // Show first 6 amounts
//                 },
//               ],
//             }}
//             width={Dimensions.get('window').width - 40} // Adjusted width
//             height={250}
//             yAxisLabel="$"
//             yAxisSuffix=""
//             yAxisInterval={1} // optional, defaults to 1
//             chartConfig={{
//               backgroundColor: '#e26a00',
//               backgroundGradientFrom: '#fb8c00',
//               backgroundGradientTo: '#ffa726',
//               decimalPlaces: 2, // optional, defaults to 2dp
//               color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//               labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//               style: {
//                 borderRadius: 16,
//               },
//               propsForDots: {
//                 r: '6',
//                 strokeWidth: '2',
//                 stroke: '#ffa726',
//               },
//             }}
//             bezier
//             style={styles.chartStyle}
//           />
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
//   welcomeText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center', 
//   },
//   balanceContainer: {
//     backgroundColor: '#4caf50',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   balanceLabel: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   balanceValue: {
//     color: '#fff',
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   spendingContainer: {
//     backgroundColor: '#ff9800',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   spendingLabel: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   spendingValue: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginTop: 5,
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
//   chartContainer: {
//     marginTop: 20,
//     alignItems: 'center', // Center the chart horizontally
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   chartStyle: {
//     marginVertical: 8,
//     borderRadius: 16,
//     alignItems: 'center', // Center the chart content
//   },
//   loadingText: {
//     fontSize: 20,
//     textAlign: 'center',
//     marginTop: 50,
//   },
// });

// Import statements remain the same
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getTransactionData } from '../apiService';
import { Auth } from 'aws-amplify';

export default function HomeScreen() {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    totalSpending: 0,
    avgMonthlySpending: 0,
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Guest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setName(currentUser.username);

        const response = await getTransactionData();
        const transactions = response.map((item) => ({
          id: item.sk,
          name: item.expenseName,
          amount: parseFloat(item.amount),  // Convert the amount to a number
          date: item.sk.split('#')[0],  // Use sk for date
        }));

        // Calculate total spending across all transactions
        const totalSpending = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        // Group transactions by month-year for monthly spending calculation
        const monthlyTotals = transactions.reduce((acc, transaction) => {
          const monthYear = transaction.date.slice(0, 7);  // Extract "YYYY-MM" format
          if (!acc[monthYear]) acc[monthYear] = 0;
          acc[monthYear] += Math.abs(transaction.amount);
          return acc;
        }, {});

        // Average monthly spending
        const avgMonthlySpending = totalSpending / Object.keys(monthlyTotals).length || 0;

        setFinancialData({
          balance: 8500.75,
          totalSpending,
          avgMonthlySpending,
          recentTransactions: transactions,
        });
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <Text style={styles.welcomeText}>Welcome, {name}</Text>
      <ScrollView style={styles.container}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Spending</Text>
          <Text style={styles.balanceValue}>${financialData.totalSpending.toFixed(2)}</Text>
        </View>

        <View style={styles.spendingContainer}>
          <Text style={styles.spendingLabel}>Avg Monthly Spending</Text>
          <Text style={styles.spendingValue}>${financialData.avgMonthlySpending.toFixed(2)}</Text>
        </View>

        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          {financialData.recentTransactions.map((transaction) => (
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

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Transaction Amounts Over Time</Text>
          <LineChart
            data={{
              labels: transactionDates.slice(0, 6),
              datasets: [
                {
                  data: transactionAmounts.slice(0, 6),
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={250}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
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
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
});