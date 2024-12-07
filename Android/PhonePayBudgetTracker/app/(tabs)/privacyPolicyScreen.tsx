import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";

const PrivacyPolicyScreen = () => {
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
          Privacy Policy
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 12 }}>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and
          protect your information.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Data Collection: We only collect data necessary for providing our services.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Data Usage: We use your data to enhance your experience and ensure app functionality.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Data Protection: We implement security measures to safeguard your information.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Third-Party Services: Some features may involve third-party services that have their own
          privacy policies.
        </Text>
        <Text style={{ fontSize: 16, color: bodyTextColor, fontFamily, marginBottom: 8 }}>
          • Contact Us: Reach out for questions regarding your data or privacy.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;
