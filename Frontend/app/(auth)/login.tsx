import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from "expo-router";
import { useUser } from '../(context)/UserContext';
import { Auth } from 'aws-amplify';



export default function LoginScreen() {
  const { setUserData } = useUser();
  // const { userData } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async () => {
    //router.replace("/home")
    console.log('email:', email, 'pass:', password);

    if (!email || !password) {
      setError('Email and password cannot be empty');
      return;
    }

    // login with cognito
    try {
      const user = await Auth.signIn(email, password);
      console.log('User signed in:', user)
      
      console.log('User data set. Navigating to home...');
      router.replace("/home")
    } catch (error) {
        console.log("couldnt log in")
        if (error instanceof Error) {
          setError(error.message || 'Failed to log in');
        } else {
          setError('An unknown error occurred');
        }
      }

    
  };

  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.appTitle}>BudgetTracker</Text>
      
      {/* Login Section */}
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Login</Text>

        {/* Email Input */}
        <TextInput 
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        {/* Password Input */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry 
          style={styles.input} 
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}    

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity onPress={() => router.replace("/signup")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7', // Light background color for a clean look
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50', // Greenish color for the app title
    marginBottom: 50, // Spacing from the top
    textAlign: 'center',
  },
  loginContainer: {
    width: '85%',
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
  loginButton: {
    backgroundColor: '#4CAF50', // Greenish button color
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff', // White text on the login button
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