import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from "expo-router";

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

  const { setUserData } = useUserContext();
  const { addTransactions } = useTransactionContext();
  const { addAccounts } = useAccountContext();

  const onLoginPress = () => {
    
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
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>BudgetTracker</Text>
      <View style={styles.authContainer}>
      <Text style={styles.title}>Login</Text>
        <FormInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          isEmpty={isEmpty.email}
        />
        <FormInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          isEmpty={isEmpty.password}
        />
        <Pressable 
          disabled={isLoading} 
          style={styles.authButton} 
          onPress={onLoginPress} 
          className={`${isLoading ? 'opacity-50' : 'opacity-100'}`}>

        {isLoading ? (
          <View className="flex-row justify-center items-center">
            <ActivityIndicator size="small" color="white" />
          </View>
        ) : (
          <Text style={styles.authButtonText} className="text-white font-bold">Login</Text>
        )}
        </Pressable>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        <Pressable onPress={() => router.replace("/signupScreen")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
