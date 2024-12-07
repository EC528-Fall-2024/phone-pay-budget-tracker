import React, { useCallback, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Dimensions, Modal, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import Animated from "react-native-reanimated";
import Header from "../(sections)/Header";
import Sidebar from "../(sections)/Sidebar";
import { useTransactionContext } from "../(context)/transactionContext";
import { useUserContext } from "../(context)/UserContext";
import { fetchTransactionsForMonth } from "../(utils)/fetchUtils";
import DonutChart from "../(components)/DonutChart";
import LineChartCard from "../(components)/LineChart";
import TopCategoriesCard from "../(components)/TopCategoriesCard";
import TopSpendingTransactionsCard from "../(components)/TopTransactionsCard";

const { width } = Dimensions.get("window");

const analysisScreen = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false); 
  const { userData } = useUserContext();
  const { transactions, addTransactions } = useTransactionContext();

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../../assets/fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../../assets/fonts/SpaceGrotesk-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return null;
  }

  const backgroundColor = "#121212"; // Neutral-900
  const textColor = "#fde68a"; // Amber-200
  const cardColor = "#1E1E1E"; // Neutral-800

  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.authorized_date);
    return (
      txnDate.getMonth() + 1 === selectedMonth &&
      txnDate.getFullYear() === selectedYear
    );
  });

  const dailySpending = Array.from({ length: 31 }, (_, i) =>
    filteredTransactions
      .filter((txn) => new Date(txn.authorized_date).getDate() === i + 1)
      .reduce((sum, txn) => sum + txn.amount, 0)
  );
  
  const incomeCategories = ["Income", "Transfer in"];
  const income = filteredTransactions
    .filter((txn) => incomeCategories.includes(txn.category))
    .reduce((sum, txn) => sum + txn.amount, 0);
  const spending = filteredTransactions
    .filter((txn) => !incomeCategories.includes(txn.category))
    .reduce((sum, txn) => sum + txn.amount, 0);
  const balance = income - spending;

  const daysInMonth = 30;
  const avgSpent = spending / daysInMonth;
  const maxSpent = Math.max(...dailySpending);
  const maxSpentDay = dailySpending.indexOf(maxSpent) + 1;

  const categoryTotals = filteredTransactions.reduce(
    (acc: Record<string, number>, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    },
    {}
  );
  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));
  
  const categoriesData = filteredTransactions.reduce((acc, txn) => {
    if (!acc[txn.category]) {
      acc[txn.category] = { name: txn.category, spent: 0, count: 0 };
    }
    acc[txn.category].spent += txn.amount;
    acc[txn.category].count += 1;
    return acc;
  }, {} as Record<string, { name: string; spent: number; count: number }>);

  const sortedCategories = Object.values(categoriesData).sort(
    (a, b) => b.spent - a.spent
  );
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleMonthSelect = async (month: number) => {
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

  const cardsData = [
    {
      id: "1",
      type: "MonthlyBalance",
      component: (
        <View
          style={{
            backgroundColor: cardColor,
            borderRadius: 12,
            padding: 16,
            marginVertical: 16,
            width: width - 48,
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              color: textColor,
              fontFamily: "SpaceGroteskMedium",
              fontSize: 24,
              marginBottom: 8,
            }}
          >
            Monthly Balance
          </Text>
          <Text
            style={{
              color: balance >= 0 ? "#4ade80" : "#F8719D", 
              fontFamily: "SpaceGroteskBold",
              fontSize: 36,
              marginBottom: 12,
            }}
          >
            {`$${balance.toFixed(2)}`}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                backgroundColor: "#4ade80",
                height: 10,
                width: 0.5 * (width - 48), 
                borderRadius: 5,
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                color: "#4ade80",
                fontFamily: "SpaceGroteskMedium",
                textAlign: "right",
                flex: 1, 
              }}
            >
              +${income.toFixed(2)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#F8719D", 
                height: 10,
                width: 0.5 * (width - 48),
                borderRadius: 5,
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                color: "#F8719D",
                fontFamily: "SpaceGroteskMedium",
                textAlign: "right",
                flex: 1, 
              }}
            >
              -${spending.toFixed(2)}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: "2",
      type: "LineChart",
      component: <LineChartCard transactions={filteredTransactions} />,
    },
    {
      id: "3",
      type: "DonutChart",
      component: (
        <View
            style={{
              backgroundColor: cardColor,
              borderRadius: 12,
              padding: 16,
              marginVertical: 16,
              width: width - 48,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: textColor,
                fontFamily: "SpaceGroteskMedium",
                marginBottom: 8,
              }}
            >
              Spending by Category
            </Text>
            {chartData.length > 0 ? (
              <DonutChart data={chartData} cardColor = "#1E1E1E"/>
            ) : (
              <Text
                style={{
                  color: textColor,
                  fontFamily: "SpaceGroteskMedium",
                  textAlign: "center",
                  marginVertical: 16,
                }}
              >
                No data available for the selected month.
              </Text>
            )}
          </View>
      ),
    },
    {
      id: "4",
      type: "TopCategories",
      component: <TopCategoriesCard categories={sortedCategories} />,
    },
    {
      id: "5",
      type: "TopTransactions",
      component: <TopSpendingTransactionsCard
      transactions={filteredTransactions.map((txn) => ({
        name: txn.name,
        category: txn.category,
        amount: txn.amount,
        date: txn.authorized_date,
        logo_url: txn.logo_url,
      }))}
    />
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor }}>
      <StatusBar style="light" />
      <View onLayout={onLayoutRootView}>
        {sidebarVisible && (
          <>
            <TouchableOpacity
              className="absolute top-0 left-0 h-full w-full z-9 bg-black-800/30"
              onPress={() => setSidebarVisible(false)}
            />
            <Animated.View
              className="absolute top-0 left-0 h-full w-64 z-10 bg-neutral-800 shadow-md"
              style={{
                width: 256,
                transform: [{ translateX: sidebarVisible ? 0 : -256 }],
              }}
            >
              <Sidebar onClose={() => setSidebarVisible(false)} />
            </Animated.View>
          </>
        )}

      <View className="my-6">
          <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

          <View
            className="flex-row justify-between items-center"
            style={{ marginVertical: 16 }}
          >
            <Text
              className="text-3xl"
              style={{ color: textColor, fontFamily: "SpaceGroteskBold" }}
            >
              Spending Analysis
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{alignItems: "center"}}
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
        <View style={{marginVertical: 10, alignItems: "center",}}>
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)",justifyContent: "center", alignItems: "center",}}>
          <View style={{backgroundColor: "#262626", borderRadius: 10, padding: 16, width: "80%", alignItems: "center"}}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={{padding: 10, width: "100%", alignItems: "center",}}
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
        data={cardsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.component}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      />
      </View>
      </View>
    </SafeAreaView>
  );
};

export default analysisScreen;
