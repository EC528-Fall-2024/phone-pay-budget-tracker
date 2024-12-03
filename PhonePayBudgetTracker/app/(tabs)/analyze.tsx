import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { getTransactionData } from '../apiService';
import { categorizeTransaction } from '../huggingFaceService';
import { PieChart } from 'react-native-chart-kit';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
}

export default function AnalyzeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [avgSpending, setAvgSpending] = useState(0);
  const [avgIncome, setAvgIncome] = useState(0);
  const [highestSpendingCategory, setHighestSpendingCategory] = useState('');
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = [
    '#ff6384',
    '#36a2eb',
    '#cc65fe',
    '#ffce56',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#e74c3c',
    '#f1c40f',
    '#1abc9c',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getTransactionData();

      const categorizedTransactions: Transaction[] = await Promise.all(
        response.map(async (item: any) => {
          const category = await categorizeTransaction(item.expenseName || 'Uncategorized');
          return {
            id: item.sk,
            name: item.expenseName || 'Unknown Expense',
            amount: parseFloat(item.amount),
            date: item.sk.split('#')[0],
            category: category || 'Uncategorized',
          };
        })
      );

      setTransactions(categorizedTransactions);

      const expenses = categorizedTransactions.filter((t) => t.amount < 0);
      const income = categorizedTransactions.filter((t) => t.amount > 0);

      const totalSpending = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

      const spendingMonths = new Set(expenses.map((t) => t.date.slice(0, 7))).size;
      const incomeMonths = new Set(income.map((t) => t.date.slice(0, 7))).size;
      const avgSpending = totalSpending / (spendingMonths || 1);
      const avgIncome = totalIncome / (incomeMonths || 1);

      const categorySpending = groupByCategory(expenses);
      const highestCategory = Object.keys(categorySpending).reduce(
        (a, b) => (categorySpending[a] > categorySpending[b] ? a : b),
        'Uncategorized'
      );

      setTotalSpending(totalSpending);
      setTotalIncome(totalIncome);
      setAvgSpending(avgSpending);
      setAvgIncome(avgIncome);
      setHighestSpendingCategory(highestCategory);

      setExpenseData(mapToChartData(categorySpending));
      setIncomeData(mapToChartData(groupByCategory(income)));
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupByCategory = (transactions: Transaction[]) => {
    return transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += Math.abs(t.amount);
      return acc;
    }, {});
  };

  const mapToChartData = (categories: any) => {
    const keys = Object.keys(categories);
    return keys.map((key, index) => ({
      name: key,
      amount: categories[key],
      color: colors[index % colors.length], // Assign a color from the palette
      legendFontColor: '#333',
      legendFontSize: 15,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Transaction Analysis</Text>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.incomeCard]}>
            <Text style={styles.cardTitle}>Total Income</Text>
            <Text style={styles.cardValue}>${totalIncome.toFixed(2)}</Text>
          </View>
          <View style={[styles.card, styles.spendingCard]}>
            <Text style={styles.cardTitle}>Total Spending</Text>
            <Text style={styles.cardValue}>${totalSpending.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.avgCard]}>
            <Text style={styles.cardTitle}>Avg Monthly Spending</Text>
            <Text style={styles.cardValue}>${avgSpending.toFixed(2)}</Text>
          </View>
          <View style={[styles.card, styles.avgCard]}>
            <Text style={styles.cardTitle}>Avg Monthly Income</Text>
            <Text style={styles.cardValue}>${avgIncome.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.categoryCard]}>
            <Text style={styles.cardTitle}>Top Expense</Text>
            <Text style={styles.cardValue}>{highestSpendingCategory}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Expense Distribution</Text>
          {expenseData.length > 0 ? (
            <PieChart
              data={expenseData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No Expense Data Available</Text>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Income Distribution</Text>
          {incomeData.length > 0 ? (
            <PieChart
              data={incomeData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No Income Data Available</Text>
          )}
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
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  incomeCard: {
    backgroundColor: '#d4edda',
  },
  spendingCard: {
    backgroundColor: '#f8d7da',
  },
  avgCard: {
    backgroundColor: '#d1ecf1',
  },
  categoryCard: {
    backgroundColor: '#fefefe',
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
    color: '#333',
  },
});
