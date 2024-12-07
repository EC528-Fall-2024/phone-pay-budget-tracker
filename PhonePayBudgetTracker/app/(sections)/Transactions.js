import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useTransactionContext } from "../(context)/transactionContext";
import { useUserContext } from "../(context)/UserContext";
import TransactionCard from "../(components)/TransactionCard";
import Animated, { FadeInDown } from "react-native-reanimated";
import { fetchTransactionsForMonth } from "../(utils)/fetchUtils";

export default function Transactions() {
  const { transactions, addTransactions } = useTransactionContext();
  const { userData } = useUserContext();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false); 

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.authorized_date);
      return (
        transactionDate.getMonth() + 1 === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });
    setFilteredTransactions(filtered);
  }, [selectedMonth, selectedYear, transactions]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleMonthSelect = async (month) => {
    setSelectedMonth(month);
    setModalVisible(false);

    const isMonthLoaded = transactions.some((transaction) => {
      const transactionDate = new Date(transaction.authorized_date);
      return (
        transactionDate.getMonth() + 1 === month &&
        transactionDate.getFullYear() === selectedYear
      );
    });

    if (!isMonthLoaded) {
      if (!userData?.uid) {
        console.error("User ID not available in context");
        return;
      }
      setIsFetching(true);
      try {
        const newTransactions = await fetchTransactionsForMonth(userData.uid, selectedYear, month);
        addTransactions(newTransactions); 
      } catch (error) {
        console.error("Error fetching transactions for selected month:", error);
      } finally {
        setIsFetching(false);
      }
    }
  };
  return (
    <Animated.View
      className="mt-8"
      entering={FadeInDown.duration(500).springify().delay(300)}
    >
      <View style={styles.headerRow}>
        <Text
          className="text-3xl dark:text-amber-200"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          Recent Activity
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.monthSelector}
        >
          <Text
            className="text-3xl dark:text-amber-200"
            style={{ fontFamily: "SpaceGroteskBold" }}
          >
            {months[selectedMonth - 1]} ▼
          </Text>
        </TouchableOpacity>
      </View>
      {isFetching && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => handleMonthSelect(index + 1)}
              >
                <Text
                  className="text-xl dark:text-amber-200"
                  style={{ fontFamily: "SpaceGroteskBold" }}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        removeClippedSubviews={false}
        height={500}
        renderItem={({ item }) => <TransactionCard {...item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthSelector: {
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#262626",
    borderRadius: 10,
    padding: 16,
    width: "80%",
    alignItems: "center",
  },
  modalItem: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  loadingIndicator: {
    marginVertical: 10,
    alignItems: "center",
  },
});
