import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import { useFonts } from "expo-font";

import { useUserContext } from '../(context)/UserContext';
import { useTransactionContext } from '../(context)/transactionContext';
import { useAccountContext } from '../(context)/accountContext';
import FormInput from '../(components)/inputForm';
import styles from '../(styles)/authScreen.styles';
import { validateLogin, handleLogin } from '../(utils)/loginUtils';



export default function LoginScreen() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isEmpty, setIsEmpty] = React.useState({
    email: false,
    password: false,
  });

  const [fontsLoaded, fontError] = useFonts({
    SpaceGroteskSemiBold: require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    SpaceGroteskBold: require("../../assets/fonts/SpaceGrotesk-Bold.ttf"),
    SpaceGroteskMedium: require("../../assets/fonts/SpaceGrotesk-Medium.ttf"),
  });


  const { setUserData } = useUserContext();
  const { addTransactions } = useTransactionContext();
  const { addAccounts } = useAccountContext();
  

  const onLoginPress = () => {

    const redirectToMainScreen = () => {
      router.replace('/mainScreen'); // Redirect to main screen
    };
    
    const validationError = validateLogin(email, password);
    console.log('validation complete');
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setIsLoading(true);
    handleLogin(
      email,
      password,
      setUserData,
      addTransactions,
      addAccounts,
      () => {
        setIsLoading(false);
        console.log('Login successful');
        router.replace('/mainScreen');
      },
      (error: string) => {
        setIsLoading(false);
        setErrorMsg(error)
      },
      () => {
        setIsLoading(false);
        router.replace('/mainScreen'); // Redirect for new users
      }
    );
  };

  return (
    <View className="flex-1 bg-neutral-900 justify-center items-center px-6 py-4">
      <Text className="text-amber-200 text-4xl text-center" style={{ fontFamily: "SpaceGroteskBold" }}>Budget Tracker</Text>
      <View className="w-full max-w-md bg-neutral-800 rounded-lg p-6 mt-5 shadow-md">
        <FormInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          isEmpty={isEmpty.email}
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
          isEmpty={isEmpty.password}
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
        <Pressable className="mt-2 self-end">
          <Text className="text-amber-200 text-sm underline" style={{ fontFamily: "SpaceGroteskMedium" }}>
            Forgot password?
          </Text>
        </Pressable>
        <Pressable
          disabled={isLoading}
          className={`mt-6 p-4 rounded-md ${
            isLoading ? 'bg-amber-200 opacity-50' : 'bg-amber-100'
          } flex justify-center items-center`}
          onPress={onLoginPress}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-neutral-900 text-2xl" style={{ fontFamily: "SpaceGroteskBold" }}>Login</Text>
          )}
        </Pressable>
        {errorMsg ? <Text className="text-red-400 text-base mt-2" style={{ fontFamily: "SpaceGroteskMedium"}}>{errorMsg}</Text> : null}
        <View className="mt-6 flex flex-row justify-center">
        <Text className="text-amber-200 text-medium" style={{ fontFamily: "SpaceGroteskMedium" }}>
          Don't have an account?{' '}
        </Text>
        <Pressable onPress={() => router.replace("/signupScreen")}>
          <Text className="text-white text-mediu underline" style={{ fontFamily: "SpaceGroteskBold" }}>
            Sign Up
          </Text>
        </Pressable>
      </View>
      </View>
    </View>
  );
  
}
