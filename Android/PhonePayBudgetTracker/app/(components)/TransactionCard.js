import { View, Text, Dimensions, Image, StyleSheet } from "react-native";
import React from "react";

const { width, height } = Dimensions.get("window");

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

export default function TransactionCard({
  name,
  category,
  amount,
  authorized_date,
  logo_url,
}) {
  const imageSource = logo_url
    ? { uri: logo_url }
    : categoryImageMap[category] || require("../../assets/images/profile_img.png"); // Fallback image

  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Image
            source={imageSource}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <Text style={styles.category}>{category}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>{"$" + amount.toFixed(2)}</Text>
        <Text style={styles.date}>{authorized_date}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: "100%",
    maxWidth: width,
    height: height * 0.12,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    borderRadius: 10,
    marginRight: 12,
  },
  logo: {
    width: 65,
    height: 65,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "SpaceGroteskBold",
    color: "#000",
    width: "100%",
  },
  category: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#6b7280",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  amount: {
    fontSize: 18,
    fontFamily: "SpaceGroteskBold",
    color: "#000",
  },
  date: {
    fontSize: 14,
    fontFamily: "SpaceGroteskMedium",
    color: "#6b7280",
  },
});