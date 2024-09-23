import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useUser } from '../(context)/UserContext';

export default function HomeScreen() {
  const { userData } = useUser();
  console.log('Home screen userData:', userData);
  // Mock financial data
  const financialData = {
    balance: 8500.75,
    monthlySpending: 1200.50,
    recentTransactions: [
      { id: 1, name: 'Groceries', amount: -150.0, date: '2024-09-15' },
      { id: 2, name: 'Rent', amount: -850.0, date: '2024-09-01' },
      { id: 3, name: 'Salary', amount: 3000.0, date: '2024-09-10' },
    ],
  };

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
});
