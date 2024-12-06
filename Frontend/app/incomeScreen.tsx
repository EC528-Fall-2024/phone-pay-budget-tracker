import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getTransactionData } from './apiService';
import { Auth } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';

export default function IncomeScreen() {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    totalSpending: 0,
    avgMonthlySpending: 0,
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('line'); // To track the selected chart type

  const navigation = useNavigation(); // Access navigation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();

        const response = await getTransactionData();
        const transactions = response.map((item) => ({
          id: item.sk,
          name: item.expenseName,
          amount: parseFloat(item.amount),
          date: item.sk.split('#')[0],
        }));

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalIncomeThisMonth = transactions.reduce((sum, transaction) => {
          const transactionDate = new Date(transaction.date);
          if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && transaction.amount > 0) {
            return sum + transaction.amount;
          }
          return sum;
        }, 0);

        const monthlyTotals = transactions.reduce((acc, transaction) => {
          if (transaction.amount > 0) { // Only count positive values
            const monthYear = transaction.date.slice(0, 7);
            if (!acc[monthYear]) acc[monthYear] = 0;
            acc[monthYear] += transaction.amount;
          }
          return acc;
        }, {});

        const nonZeroMonths = Object.values(monthlyTotals).filter(total => total > 0).length;
        const avgMonthlyIncome = Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0) / (nonZeroMonths || 1);

        setFinancialData({
          balance: 8500.75, // Example static balance
          totalSpending: totalIncomeThisMonth,
          avgMonthlySpending: avgMonthlyIncome,
          recentTransactions: transactions.filter((transaction) => transaction.amount > 0), // Filter for positive amounts
        });
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const aggregateDataByMonth = (data) => {
    const monthlyData = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month + 1}`;

      if (!monthlyData[key]) {
        monthlyData[key] = 0;
      }

      monthlyData[key] += item.amount;
    });

    const labels = Object.keys(monthlyData).sort();
    const values = labels.map((label) => monthlyData[label]);

    return {
      labels,
      datasets: [
        {
          data: values,
        },
      ],
    };
  };

  const renderChart = () => {
    const chartData = aggregateDataByMonth(financialData.recentTransactions);

    const chartConfig = {
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
    };

    if (selectedChart === 'bar') {
      return (
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={250}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chartStyle}
        />
      );
    }

    return (
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={250}
        yAxisLabel="$"
        chartConfig={chartConfig}
        bezier
        style={styles.chartStyle}
      />
    );
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, styles.greenBackground]}>
            <Text style={styles.summaryLabel}>Total Income This Month</Text>
            <Text style={styles.summaryValue}>${financialData.totalSpending.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryBox, styles.greenBackground]}>
            <Text style={styles.summaryLabel}>Average Monthly Income</Text>
            <Text style={styles.summaryValue}>${financialData.avgMonthlySpending.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          {financialData.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, styles.positive]}>
                +${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Transaction Trends</Text>
          <Picker
            selectedValue={selectedChart}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedChart(itemValue)}
          >
            <Picker.Item label="Line Chart" value="line" />
            <Picker.Item label="Bar Chart" value="bar" />
          </Picker>
          {renderChart()}
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
  },
  backButton: {
    padding: 10,
    marginLeft: 20,
    marginTop: 10,
    width: 60,
    borderRadius: 10,
    backgroundColor: '#ff9800',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  greenBackground: {
    backgroundColor: '#4caf50',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
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
    flex: 1,
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
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: -50,
  },
  chartStyle: {
    borderRadius: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 120,
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
});