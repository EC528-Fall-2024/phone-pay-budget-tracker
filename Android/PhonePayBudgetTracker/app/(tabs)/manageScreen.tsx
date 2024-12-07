import React, { useEffect, useState } from "react";
import { ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";
import { useUserContext } from '../(context)/UserContext';
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface UserData {
    name: string;
    country: string;
    phone: string;
  }

const fetchUserData = async (uid: string) => {
    const functions = getFunctions();
    const getUserData = httpsCallable(functions, 'getUserData');
    try {
      const result = await getUserData({ uid });
      const userData = result.data as UserData;
      console.log('User data fetched successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };


const manageScreen = () => {
  const { userData, setUserData } = useUserContext();
  const [name, setName] = useState(userData?.name || "");
  const [country, setCountry] = useState(userData?.country || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const email = userData?.email || "";

  const backgroundColor = "#121212"; // Neutral-900
  const textColor = "#fde68a"; // Amber-200
  const bodyTextColor = "#9CA3AF"; // Neutral-400
  const fontFamily = "SpaceGroteskMedium";

  useEffect(() => {
    setName(userData?.name || "");
    setCountry(userData?.country || "");
    setPhone(userData?.phone || "");
  }, [userData]);

  const handleSave = async () => {
    const functions = getFunctions();
    console.log("Attempting to save profile details:", { name, country, phone });
  
    const updates = {
      name,
      country,
      phone,
    };
  
    try {
      const modifyUserDocument = httpsCallable(functions, "modifyUserDocument");
      const result = await modifyUserDocument({ uid: userData?.uid, updates });
      const data = result.data as { success: boolean; message?: string };
  
      if (data.success) {
        console.log("Profile updated successfully:", data.message);
        const response = await fetchUserData(userData?.uid || "");
        setUserData({
            uid: userData?.uid || '',
            email: email,
            name: response.name || '',
            country: response.country ||'',
            phone: response.phone ||'',
        });
        router.replace('/profileScreen');
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        console.error("Profile update failed:", data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", (error as Error).message);
      Alert.alert("Warning", "Failed to update profile. Please try again.");
    }
  };

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
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <Text style={[styles.nonEditableInput, { width: "70%" }]}>{email}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { width: "70%" }]}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Country</Text>
        <TextInput
          value={country}
          onChangeText={setCountry}
          style={[styles.input, { width: "70%" }]}
          placeholder="Enter your country"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={[styles.input, { width: "70%" }]} 
          placeholder="Enter your phone"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#121212",
    marginHorizontal: 20,
    width: "90%",
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "SpaceGroteskMedium",
    color: "#fde68a", // Amber-200
    marginBottom: 4,
  },
  nonEditableInput: {
    fontSize: 16,
    fontFamily: "SpaceGroteskMedium",
    color: "#9CA3AF", 
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    paddingBottom: 4,
  },
  input: {
    fontSize: 16,
    fontFamily: "SpaceGroteskMedium",
    color: "#ffffff", 
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    paddingBottom: 4,
    width: "80%", 
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#fde68a", // Amber-200
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "SpaceGroteskBold",
    color: "#121212",
  },
});

export default manageScreen;
