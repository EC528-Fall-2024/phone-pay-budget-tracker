import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useUser } from '../(context)/UserContext';

export default function HomeScreen() {
  // Extended financial data with more transactions
  const { userData } = useUser();
  const financialData = {
    balance: 8500.75,
    monthlySpending: 1200.50,
    recentTransactions: [
      { id: 1, name: 'Groceries', amount: -150.0, date: '09/15/24' },
      { id: 2, name: 'Rent', amount: -850.0, date: '09/01/24' },
      { id: 3, name: 'Salary', amount: 3000.0, date: '09/10/24' },
      { id: 4, name: 'Electricity Bill', amount: -100.0, date: '09/05/24' },
      { id: 5, name: 'Gym Membership', amount: -60.0, date: '09/12/24' },
      { id: 6, name: 'Freelance Payment', amount: 500.0, date: '09/18/24' },
      { id: 7, name: 'Car Insurance', amount: -200.0, date: '09/20/24' },
      { id: 8, name: 'Dining Out', amount: -120.0, date: '09/22/24' },
      { id: 9, name: 'Rent', amount: -850.0, date: '10/01/24' },
      { id: 10, name: 'Groceries', amount: -175.0, date: '10/05/24' },
    ],
  };

  // Prepare data for the graph (recent transactions)
  const transactionAmounts = financialData.recentTransactions.map((t) => t.amount);
  const transactionDates = financialData.recentTransactions.map((t) => t.date);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.welcomeText}>
        Welcome, {userData ? userData.name : 'Guest'}
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
          {financialData.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
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
            width={Dimensions.get('window').width - 40} // from react-native
            height={220}
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
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
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
  transactionName: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});
