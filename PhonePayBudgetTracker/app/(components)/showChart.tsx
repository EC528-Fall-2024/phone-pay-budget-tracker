import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

type SortItem = {
    id: number;
    sortName: string;
    money: number;
    backColor: string;
    sortImg: string;
  };
  
  type MonthChartBean = {
    outSortlist: SortItem[];
    inSortlist: SortItem[];
    totalOut: number;
    totalIn: number;
  };

  type PieChartData = {
    name: string;
    amount: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[];
  
  type Transaction = {
    id: number;
    name: string;
    amount: number;
    date: string;
  };
  
const MonthChartScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [monthChartBean, setMonthChartBean] = useState<MonthChartBean | null>(null);
  const [totalMoney, setTotalMoney] = useState(0);
  const [chartData, setChartData] = useState<PieChartData>([]); // Correctly typed chartData
  const [listData, setListData] = useState<SortItem[]>([]); // Correctly typed listData
  const [isOutcome, setIsOutcome] = useState(true); // Whether it's outcome or income

  const fetchMonthChart = () => {
    const recentTransactions: Transaction[] = [
        { id: 2, name: 'Rent', amount: -850.0, date: '10/01/24' },
        { id: 4, name: 'Electricity Bill', amount: -100.0, date: '10/05/24' },
        { id: 3, name: 'Salary', amount: 3000.0, date: '10/10/24' },
        { id: 5, name: 'Gym Membership', amount: -60.0, date: '10/12/24' },
        { id: 1, name: 'Groceries', amount: -150.0, date: '10/15/24' },
        { id: 6, name: 'Freelance Payment', amount: 500.0, date: '10/18/24' },
        { id: 7, name: 'Car Insurance', amount: -200.0, date: '10/20/24' },
        { id: 8, name: 'Dining Out', amount: -120.0, date: '10/22/24' },
        { id: 9, name: 'Rent', amount: -850.0, date: '11/01/24' },
        { id: 10, name: 'Groceries', amount: -175.0, date: '11/05/24' },
    ];

    const outSortlist = recentTransactions
    .filter((t) => t.amount < 0)
    .map((t) => ({
      id: t.id,
      sortName: t.name,
      money: Math.abs(t.amount),
      backColor: getRandomColor(),
      sortImg: 'some_image_url',
    }));

  const inSortlist = recentTransactions
    .filter((t) => t.amount > 0)
    .map((t) => ({
      id: t.id,
      sortName: t.name,
      money: t.amount,
      backColor: getRandomColor(),
      sortImg: 'some_image_url',
    }));

  const fetchedData = {
    outSortlist,
    inSortlist,
    totalOut: outSortlist.reduce((sum, item) => sum + item.money, 0),
    totalIn: inSortlist.reduce((sum, item) => sum + item.money, 0),
    };
  
    setMonthChartBean(fetchedData);
    setChartData(fetchedData.outSortlist.map((item) => ({
        id: item.id,
        name: item.sortName,
        amount: item.money,
        color: item.backColor,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
    })));
    setListData(fetchedData.outSortlist); // Initially show the outcome list
    setTotalMoney(fetchedData.totalOut); // Initially show the outcome total
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMonthChart();
    setRefreshing(false);
  };

  // Switch between Income and Outcome data
  const toggleIncomeOutcome = () => {
    setIsOutcome(!isOutcome);
    if (monthChartBean) {
      if (!isOutcome) {
        setChartData(monthChartBean.outSortlist.map((item) => ({
          id: item.id,
          name: item.sortName,
          amount: item.money,
          color: item.backColor,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        })));
        setListData(monthChartBean.outSortlist);
        setTotalMoney(monthChartBean.totalOut);
      } else {
        setChartData(monthChartBean.inSortlist.map((item) => ({
          id: item.id,
          name: item.sortName,
          amount: item.money,
          color: item.backColor,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        })));
        setListData(monthChartBean.inSortlist);
        setTotalMoney(monthChartBean.totalIn);
      }
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    fetchMonthChart(); // Fetch data when component mounts
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Toggle between Income/Outcome */}
      <TouchableOpacity onPress={toggleIncomeOutcome} style={styles.toggleButton}>
        <Text style={styles.toggleText}>{isOutcome ? 'Show Income' : 'Show Spending'}</Text>
      </TouchableOpacity>

      {/* Pie Chart */}
      <PieChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
          barPercentage: 0.5,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Total Money */}
      <Text style={styles.totalText}>Total: {totalMoney}</Text>

      {/* List of Bills */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.sortName}: ${item.money}</Text>
          </View>
        )}
        extraData={listData}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    padding: 10,
    backgroundColor: '#694fad',
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
  },
  totalText: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  listText: {
    fontSize: 18,
  },
});

export default MonthChartScreen;
