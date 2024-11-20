import { View, Text, FlatList } from "react-native";
import React from "react";
import { useTransactionContext } from '../(context)/transactionContext';
import TransactionCard from "../(components)/TransactionCard";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Transactions() {
  const { transactions, addTransactions } = useTransactionContext();
  return (
    <Animated.View
      className="mt-8"
      entering={FadeInDown.duration(500).springify().delay(300)}
    >
      <Text className="text-3xl dark:text-amber-200 mb-4" style={{fontFamily: "SpaceGroteskBold",}}>Recent Activity</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1}}
        removeClippedSubviews={false}
        height={500}
        renderItem={({ item }) => <TransactionCard {...item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </Animated.View>
  );
}