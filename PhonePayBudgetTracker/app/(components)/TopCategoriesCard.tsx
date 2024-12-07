import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

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

interface Category {
  name: string;
  spent: number;
  count: number;
}

interface TopCategoriesCardProps {
  categories: Category[];
}

const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({ categories }) => {
  const maxSpent = Math.max(...categories.map((category) => category.spent));
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setShowMore(false);
  }, [categories]);
  const visibleCategories = showMore ? categories.slice(0, 5) : categories.slice(0, 3);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Spending Categories</Text>

      {visibleCategories.map((category, index) => (
        <View key={index} style={styles.categoryRow}>
          <Image
            source={
              categoryImageMap[category.name as keyof typeof categoryImageMap] || 
              require("../../assets/images/profile_img.png")
            }
            style={styles.icon}
          />
          <View style={styles.details}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(category.spent / maxSpent) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.spentAmount}>{`$${category.spent.toFixed(2)}`}</Text>
              <Text style={styles.spendingCount}>{`${category.count} transactions`}</Text>
            </View>
          </View>
        </View>
      ))}
      {categories.length > 3 && (
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
  categoryRow: {
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
  categoryName: {
    fontSize: 16,
    fontFamily: "SpaceGroteskMedium",
    color: "#fde68a", // Amber-200
    marginBottom: 4,
  },
  barContainer: {
    height: 10,
    backgroundColor: "transparent", // Neutral-400
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  bar: {
    height: "100%",
    backgroundColor: "#F8719D",
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spentAmount: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#9CA3AF", 
  },
  spendingCount: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#9CA3AF", 
  },
});

export default TopCategoriesCard;
