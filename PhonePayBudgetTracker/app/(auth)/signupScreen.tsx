import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import { useFonts } from "expo-font";

import FormInput from '../(components)/inputForm';
import styles from '../(styles)/authScreen.styles';
import { validateSignup, handleSignup } from '../(utils)/signupUtils';

export default function SignupScreen() {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [cpassword, setcPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState({
    username: false,
    email: false,
    password: false,
    cpassword: false,
  });

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../../assets/fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../../assets/fonts/SpaceGrotesk-Medium.ttf"),
  });

  const onSignupPress = () => {
    const validationError = validateSignup(username, email, password, cpassword);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    handleSignup(
      username,
      email,
      password,
      () => {
        setIsLoading(false);
        console.log('Signup successful');
        router.replace('/loginScreen');
      },
      (error: string) => {
        setIsLoading(false);
        setErrorMsg(error)
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", backgroundColor: "#171717", paddingHorizontal: 24 }}>
      <Text
        className="text-amber-200 text-4xl text-center"
        style={{ fontFamily: "SpaceGroteskBold" }}
      >
        Budget Tracker
      </Text>
  
      <View className="w-full max-w-md bg-neutral-800 rounded-lg p-6 mt-5 shadow-md">
        <Text
          className="text-amber-200 text-2xl font-semibold text-center"
          style={{ fontFamily: "SpaceGroteskMedium" }}
        >
          Create Your Account
        </Text>
  
        <FormInput
          value={username}
          onChangeText={setUsername}
          placeholder="Full Name"
          className="bg-neutral-700 text-white rounded-md mt-5"
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontFamily: "SpaceGroteskMedium",
            fontSize: 18,
            borderWidth: 1,
            borderColor: "#fde68a",
            borderRadius: 8,
          }}
          placeholderTextColor="#ffffff"
        />
  
        <FormInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          className="bg-neutral-700 text-white rounded-md mt-5"
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontFamily: "SpaceGroteskMedium",
            fontSize: 18,
            borderWidth: 1,
            borderColor: "#fde68a",
            borderRadius: 8,
          }}
          placeholderTextColor="#ffffff"
        />
  
        <FormInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          className="bg-neutral-700 text-white rounded-md mt-5"
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontFamily: "SpaceGroteskMedium",
            fontSize: 18,
            borderWidth: 1,
            borderColor: "#fde68a",
            borderRadius: 8,
          }}
          placeholderTextColor="#ffffff"
        />
  
        <FormInput
          value={cpassword}
          onChangeText={setcPassword}
          placeholder="Confirm Password"
          secureTextEntry
          className="bg-neutral-700 text-white rounded-md mt-5"
          style={{
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontFamily: "SpaceGroteskMedium",
            fontSize: 18,
            borderWidth: 1,
            borderColor: "#fde68a",
            borderRadius: 8,
          }}
          placeholderTextColor="#ffffff"
        />
  
        <Pressable
          disabled={isLoading}
          className={`mt-6 p-4 rounded-md ${
            isLoading ? 'bg-amber-200 opacity-50' : 'bg-amber-100'
          } flex justify-center items-center`}
          onPress={onSignupPress}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-neutral-900 text-2xl" style={{ fontFamily: "SpaceGroteskBold" }}>
              Sign Up
            </Text>
          )}
        </Pressable>
  
        {errorMsg ? (
          <Text
            className="text-red-400 text-base mt-2"
            style={{ fontFamily: "SpaceGroteskMedium" }}
          >
            {errorMsg}
          </Text>
        ) : null}

        <View className="mt-6 flex flex-row justify-center">
          <Text
            className="text-amber-200 text-medium"
            style={{ fontFamily: "SpaceGroteskMedium" }}
          >
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.replace("/linkScreen")}>
            <Text
              className="text-white text-medium underline"
              style={{ fontFamily: "SpaceGroteskBold" }}
            >
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
  
}