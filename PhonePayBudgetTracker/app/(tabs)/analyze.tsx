import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { getTransactionData } from '../apiService';

export default function AnalyzeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [avgSpending, setAvgSpending] = useState(0);
  const [avgIncome, setAvgIncome] = useState(0);
  const [highestSpendingCategory, setHighestSpendingCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getTransactionData();
      const transactions = response.map((item) => ({
        id: item.sk,
        name: item.expenseName,
        amount: parseFloat(item.amount),
        date: item.sk.split('#')[0],
        category: item.category || 'Uncategorized',
      }));
      setTransactions(transactions);

      const spending = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const spendingMonths = new Set(transactions.filter(t => t.amount < 0).map(t => t.date.slice(0, 7))).size;
      const incomeMonths = new Set(transactions.filter(t => t.amount > 0).map(t => t.date.slice(0, 7))).size;
      const avgSpending = spending / (spendingMonths || 1);
      const avgIncome = income / (incomeMonths || 1);

      const categorySpending = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0;
        acc[t.category] += Math.abs(t.amount);
        return acc;
      }, {});
      const highestCategory = Object.keys(categorySpending).reduce((a, b) => categorySpending[a] > categorySpending[b] ? a : b, 'Uncategorized');

      setTotalSpending(spending);
      setTotalIncome(income);
      setAvgSpending(avgSpending);
      setAvgIncome(avgIncome);
      setHighestSpendingCategory(highestCategory);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      Alert.alert("Error", "Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisText}>Total Spending: ${totalSpending.toFixed(2)}</Text>
          <Text style={styles.analysisText}>Total Income: ${totalIncome.toFixed(2)}</Text>
          <Text style={styles.analysisText}>Average Monthly Spending: ${avgSpending.toFixed(2)}</Text>
          <Text style={styles.analysisText}>Average Monthly Income: ${avgIncome.toFixed(2)}</Text>
          <Text style={styles.analysisText}>Highest Spending Category: {highestSpendingCategory}</Text>
        </View>
        <View style={styles.recommendationsContainer}>
          <Text style={styles.title}>Recommendations</Text>
          {totalSpending > totalIncome && (
            <Text style={styles.recommendationText}>
              Your spending exceeds your income. Consider reducing expenses in the "{highestSpendingCategory}" category.
            </Text>
          )}
          {avgSpending > avgIncome && (
            <Text style={styles.recommendationText}>
              Your average monthly spending is higher than your average monthly income. Try to balance your budget.
            </Text>
          )}
          {totalIncome > totalSpending && (
            <Text style={styles.recommendationText}>
              Great job! Your income exceeds your spending. Consider saving or investing the surplus.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f5f5f5", // Same background color as the HomeScreen
    },
    container: {
      flex: 1,
    },
    scrollViewContent: {
      padding: 20,
      paddingBottom: 40, // Ensures the last button/text isn't cut off
    },
    title: {
      fontSize: 30, // Matches the font size of the "Welcome" text in HomeScreen
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: "#333", // Consistent text color
    },
    analysisContainer: {
      backgroundColor: "#ffffff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    analysisText: {
      fontSize: 18,
      marginBottom: 10,
      color: "#333", // Matches text color in HomeScreen
    },
    recommendationsContainer: {
      marginTop: 20,
      backgroundColor: "#4caf50", // Matches balance container background color
      padding: 15,
      borderRadius: 10,
    },
    recommendationText: {
      fontSize: 16,
      marginBottom: 10,
      color: "#fff", // White text for better contrast against green background
    },
    loadingText: {
      fontSize: 20,
      textAlign: "center",
      marginTop: 50,
      color: "#333", // Matches the overall theme
    },
  });
  