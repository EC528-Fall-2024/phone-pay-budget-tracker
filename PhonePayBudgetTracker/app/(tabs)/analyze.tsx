import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { getTransactionData } from '../apiService';
import { categorizeTransaction } from '../huggingFaceService'; // Import Hugging Face service

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      const categorySpending = expenses.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0;
        acc[t.category] += Math.abs(t.amount);
        return acc;
      }, {});

      const highestCategory = Object.keys(categorySpending).reduce(
        (a, b) => (categorySpending[a] > categorySpending[b] ? a : b),
        'Uncategorized'
      );

      setTotalSpending(totalSpending);
      setTotalIncome(totalIncome);
      setAvgSpending(avgSpending);
      setAvgIncome(avgIncome);
      setHighestSpendingCategory(highestCategory);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  incomeCard: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
  },
  spendingCard: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
  },
  avgCard: {
    backgroundColor: "#d1ecf1",
    borderColor: "#17a2b8",
  },
  categoryCard: {
    backgroundColor: "#fefefe",
    borderColor: "#6c757d",
  },
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
    color: "#333",
  },
});
