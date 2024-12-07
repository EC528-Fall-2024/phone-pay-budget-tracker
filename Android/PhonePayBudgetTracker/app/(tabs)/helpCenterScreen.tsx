import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";

const HelpCenterScreen = () => {
  const backgroundColor = "#121212"; // Neutral-900
  const textColor = "#fde68a"; // Amber-200
  const bodyTextColor = "#9CA3AF"; // Neutral-400
  const fontFamily = "SpaceGroteskMedium";

  return (
    <View style={{ flex: 1, backgroundColor, padding: 24, }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop:24, marginBottom: 16 }}>
        <TouchableOpacity onPress={() => router.replace('/profileScreen')} style={{ marginRight: 8 }}>
          <Image
            source={require("../../assets/images/back_arrow_icon.png")}
            style={{
              width: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontFamily,
            color: textColor,
          }}
        >
          Help Center
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 12 }}>
          Welcome to the Help Center. Here you can find answers to commonly asked questions and
          learn how to get the most out of your experience with our app.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • How do I link my bank account?
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • How do I manage my budget categories?
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • What should I do if I encounter an error?
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Contact support for unresolved issues.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Learn more about your account settings and privacy.
        </Text>
      </ScrollView>
    </View>
  );
};

export default HelpCenterScreen;
