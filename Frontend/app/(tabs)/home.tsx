import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { getProfileData, getTransactionData } from "../apiService";

export default function HomeScreen() {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    accounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState("Guest");
  const [hasTransactions, setHasTransactions] = useState(true); // New state

  const fetchData = async () => {
    try {
      const profileData = await getProfileData();
      const transactions = await getTransactionData();
      setName(profileData.pk);

      console.log("Profile data", profileData);
      console.log("Transaction data", transactions.message);

      // Check if there are transactions
      if (transactions.message === "No transactions found") {
        setHasTransactions(false);
        setFinancialData({ balance: 0, accounts: [] });
        return;
      } else {
        setHasTransactions(true);
      }

      const totalBalance = profileData.accounts.reduce(
        (sum, account) => sum + account.Balance,
        0
      );

      // Get the current date and calculate the date 7 days ago
      const currentDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      // Process accounts to count recent transactions for each account
      const processedAccounts = profileData.accounts.map((account) => {
        const recentTransactions = transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.sk.split("#")[0]); // Extract date from `sk`
          return (
            transaction.accountId === account.accountID && // Match account ID
            transactionDate >= sevenDaysAgo // Check if the transaction is within the past 7 days
          );
        });

        return {
          ...account,
          recentTransactionCount: recentTransactions.length,
        };
      });

      setFinancialData({
        balance: totalBalance,
        accounts: processedAccounts,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
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
      <Text style={styles.welcomeText}>Welcome, {name}</Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {hasTransactions ? (
          <>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>
                ${financialData.balance.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.overviewTitle}>Overview:</Text>

            <View style={styles.accountsContainer}>
              {financialData.accounts.map((account, index) => (
                <View key={index} style={styles.accountItem}>
                  <View>
                    <Text style={styles.accountName}>{account.Bank}</Text>
                    <Text style={styles.accountType}>{account.Name}</Text>
                  </View>
                  <View>
                    <Text style={styles.accountBalance}>
                      ${account.Balance.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionCount}>
                      {account.recentTransactionCount} transactions in the last
                      7 days
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("../expenseScreen")}
              >
                <Text style={styles.buttonText}>View Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("../incomeScreen")}
              >
                <Text style={styles.buttonText}>View Income</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("../bothScreen")}
              >
                <Text style={styles.buttonText}>View Expenses and Income</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Link an account to see data!</Text>
          </View>
        )}
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
    paddingBottom: 40, // Add padding to the bottom to ensure the last button is not cut off
  },
  welcomeText: {
    fontSize: 44,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center",
  },
  balanceContainer: {
    backgroundColor: "#4caf50",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#fff",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "left",
    color: "#333",
  },
  accountsContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  accountType: {
    fontSize: 14,
    color: "#666",
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
    textAlign: "right",
  },
  transactionCount: {
    fontSize: 14,
    color: "#999",
    textAlign: "right",
  },
  buttonContainer: {
    marginTop: 0,
  },
  button: {
    backgroundColor: "#ff9800",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});
