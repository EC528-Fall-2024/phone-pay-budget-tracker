import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from "expo-router";
import SignupForm from "../../components/SignupForm";
import { Auth } from 'aws-amplify';

export function checkEmpty(toCheck: string) {
  return !toCheck
}

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setcPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEmpty, setIsEmpty] = useState({
    username: false,
    email: false,
    password: false,
    cpassword: false,
  });

  const passwordSame = () => password === cpassword
  // const passwordSame = (): boolean => {
  //   return password == cpassword;
  // };

  const onSignupPress = async () => {
    const emptyCheck = {
      username: !username,
      email: !email,
      password: !password,
      cpassword: !cpassword,
    };
    setIsEmpty(emptyCheck)
    if (checkEmpty(username)) {
      setErrorMsg('username cannot be empty!');
      return;
    };
    if (checkEmpty(email)) {
      setErrorMsg('Email cannot be empty!');
      return;
    };
    if (checkEmpty(password)) {
      setErrorMsg('Password cannot be empty!');
      return;
    };
    if (checkEmpty(cpassword)) {
      setErrorMsg('Confirm password cannot be empty!');
      return;
    };
    // check password same
    if (!passwordSame()) {
      setErrorMsg('Passwords do not match!');
      return;
    };
    setErrorMsg('');

    // sign up with cognito
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        }
      });
      console.log('User signed up:', user);
      router.push({
        pathname: "/(auth)/confirm",
        params: { username },  // username is passed as a query param
      });
      
      //router.replace("/login");
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error signing up:', error.message);
        setErrorMsg(error.message);
      } else {
        console.log('An unknown error occurred');
        setErrorMsg('An unknown error occurred');
      }
    }
    // const userData = {
    //   username,
    //   email,
    //   password,
    // };
    // SignupForm(userData);
    // console.log('User signuping');
    // router.replace("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Title */}
      <Text style={styles.appTitle}>BudgetTracker</Text>
      {/* Signup Section */}
      <View style={styles.signupContainer}>
        <Text style={styles.title}>Create Your Account</Text>

        {/* Name Input */}
        <TextInput value={username} onChangeText={setUsername} placeholder='Username' style={[styles.input, isEmpty.username && styles.emptyInput]} />

        {/* Email Input */}
        <TextInput value={email} onChangeText={setEmail} placeholder='Email' style={[styles.input, isEmpty.email && styles.emptyInput]} />

        {/* Password Input */}
        <TextInput value={password} onChangeText={setPassword} placeholder='Password' secureTextEntry style={[styles.input, isEmpty.password && styles.emptyInput]} />

        {/* Confirm Password Input */}
        <TextInput value={cpassword} onChangeText={setcPassword} placeholder="Confirm Password" secureTextEntry style={[styles.input, isEmpty.cpassword && styles.emptyInput]} />

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={onSignupPress}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
        {/* Error Message */}
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Link to Login */}
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7', // Light background color for a clean look
  },
  error: {
    color: 'red',
    marginBottom: 10, 
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50', // Greenish color for the app title
    marginBottom: 50, // Spacing from the top
    textAlign: 'center',
  },
  signupContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000', // Add shadow for depth
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // Elevation for Android shadow
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Darker text color
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fafafa', // Light background for input fields
  },
  emptyInput:{
    backgroundColor: '#fddfdf'
  },
  signupButton: {
    backgroundColor: '#4CAF50', // Greenish button color
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#fff', // White text on the signup button
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    color: '#4CAF50', // Matching color with the app title and button
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline', // Underline for the link
  },
});