import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from "expo-router";

import FormInput from '../(components)/inputForm';
import styles from '../(styles)/authScreen.styles';
import { validateSignup, handleSignup } from '../(utils)/signupUtils';

export default function SignupScreen() {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [cpassword, setcPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isEmpty, setIsEmpty] = React.useState({
    username: false,
    email: false,
    password: false,
    cpassword: false,
  });

  const onSignupPress = () => {
    const validationError = validateSignup(username, email, password, cpassword);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg('');
    handleSignup(
      username,
      email,
      password,
      () => {
        console.log('Signup successful');
        router.replace('/loginScreen');
      },
      (error: string) => setErrorMsg(error)
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appTitle}>BudgetTracker</Text>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Create Your Account</Text>
        <FormInput
          value={username}
          onChangeText={setUsername}
          placeholder="Full name"
          isEmpty={isEmpty.username}
        />
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
        <FormInput
          value={cpassword}
          onChangeText={setcPassword}
          placeholder="Confirm Password"
          secureTextEntry
          isEmpty={isEmpty.cpassword}
        />
        <Pressable style={styles.authButton} onPress={onSignupPress}>
          <Text style={styles.authButtonText}>Sign Up</Text>
        </Pressable>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        <Pressable onPress={() => router.replace("/linkScreen")}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}