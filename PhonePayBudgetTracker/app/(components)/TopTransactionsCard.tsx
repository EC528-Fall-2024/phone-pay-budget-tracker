import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";

interface Transaction {
    name: string;
    category: string;
    amount: number;
    date: string;
    logo_url?: string;
  }

interface TopSpendingTransactionsCardProps {
  transactions: Transaction[];
}

const categoryImageMap = {
    "Bank fees": require("../../assets/images/bank_fees.png"),
    "Entertainment": require("../../assets/images/entertainment.png"),
    "Food and drink": require("../../assets/images/food_drink.png"),
    "General merchandise": require("../../assets/images/general_merchandise.png"),
    "General services": require("../../assets/images/general_services.png"),
    "Government & non-profit": require("../../assets/images/government_non_profit.png"),
    "Home improvement": require("../../assets/images/home_improvement.png"),
    "Income": require("../../assets/images/income.png"),
    "Loan payments": require("../../assets/images/loan_payments.png"),
    "Medical": require("../../assets/images/medical.png"),
    "Personal care": require("../../assets/images/personal_care.png"),
    "Rent and utilities": require("../../assets/images/rent_utilities.png"),
    "Transfer in": require("../../assets/images/transfer_in.png"),
    "Transfer out": require("../../assets/images/transfer_out.png"),
    "Transportation": require("../../assets/images/transportation.png"),
    "Travel": require("../../assets/images/travel.png"),
  };

const TopSpendingTransactionsCard: React.FC<TopSpendingTransactionsCardProps> = ({ transactions }) => {
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setShowMore(false);
  }, [transactions]);

  const sortedTransactions = transactions.sort((a, b) => b.amount - a.amount);
  const visibleTransactions = showMore ? sortedTransactions.slice(0, 10) : sortedTransactions.slice(0, 3);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Spending Transactions</Text>
      {visibleTransactions.map((transaction, index) => (
        <View key={index} style={styles.transactionRow}>
          <Image
            source={
              transaction.logo_url
                ? { uri: transaction.logo_url }
                : categoryImageMap[transaction.category as keyof typeof categoryImageMap] ||
                  require("../../assets/images/profile_img.png") 
            }
            style={styles.icon}
          />
          <View style={styles.details}>
            <Text style={styles.transactionName}>{transaction.name}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.transactionAmount}>{`$${transaction.amount.toFixed(2)}`}</Text>
              <Text style={styles.transactionDate}>{new Date(transaction.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}</Text>
            </View>
          </View>
        </View>
      ))}
      {transactions.length > 3 && (
        <TouchableOpacity
          onPress={() => setShowMore((prev) => !prev)}
          style={{
            alignItems: "center",
            marginTop: 8,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "SpaceGroteskMedium",
              color: "#fde68a", 
            }}
          >
            {showMore ? "Show Less ▲" : "More Details ▼"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E", // Neutral-800
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    width: width - 48,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "SpaceGroteskMedium",
    color: "#fde68a", // Amber-200
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontFamily: "SpaceGroteskMedium",
    color: "#fde68a", // Amber-200
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#9CA3AF", // Neutral-400
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#9CA3AF", // Neutral-400
  },
});

export default TopSpendingTransactionsCard;
