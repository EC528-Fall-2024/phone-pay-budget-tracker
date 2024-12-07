import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { router } from "expo-router";

const aboutUsScreen = () => {
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
          About Us
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
               {/* App Introduction Card */}
               <View
          style={{
            backgroundColor: "#1E1E1E", // Neutral-800
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={{
              width: 60,
              height: 60,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              fontSize: 24,
              fontFamily,
              color: textColor,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Phone Pay Budget Tracking
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 12 }}>
            Simplify your finances starting today! Say goodbye to scattered expense tracking and hello
            to a clear view of your financial health. We empower you to make smarter financial
            decisions by helping you track, manage, and analyze your spending in one easy-to-use app.
          </Text>
          <Text style={{ fontSize: 14, color: textColor, fontFamily, marginBottom: 12 }}>
            Why Choose Us?
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 4 }}>
            - Keep all your expenses organized in one place
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 4 }}>
            - Visualize your spending trends with dynamic charts
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 4 }}>
            - Sync across devices for seamless tracking
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
            - Advanced security towards data protection
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily,
              color: bodyTextColor,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Version 1.0.0
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#1E1E1E", // Neutral-800
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily,
              color: textColor,
              marginBottom: 8,
            }}
          >
            Developer
          </Text>
          <Text style={{ fontSize: 14, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
            Developed by: Jonathan Shum
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: textColor,
              fontFamily,
              textDecorationLine: "underline",
              marginBottom: 8,
            }}
            onPress={() => Linking.openURL("https://www.linkedin.com/in/hinlui-shum/")}
          >
            Developer's LinkedIn
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: textColor,
              fontFamily,
              textDecorationLine: "underline",
            }}
            onPress={() => Linking.openURL("https://github.com/jshumhl")}
          >
            Developer's GitHub 
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default aboutUsScreen;
