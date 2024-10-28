import React, { useState } from 'react';
<<<<<<< HEAD
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
=======
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
import { Auth } from 'aws-amplify';
import { router, useLocalSearchParams } from 'expo-router';

export default function ConfirmSignUpScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const { username } = useLocalSearchParams();
  const userNameString = Array.isArray(username) ? username[0] : username;

  const handleConfirm = async () => {
    try {
      await Auth.confirmSignUp(userNameString, code);
      console.log('User confirmed');
      router.replace("/login"); // Redirect to login page after successful confirmation
    } catch (error) {
      setError('Failed to confirm sign-up. Try again.');
      console.log('Error confirming sign-up:', error);
    }
  };

  // New function to navigate back to the login page
  const navigateToLogin = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Sign-Up</Text>
      <Text style={styles.subtitle}>Enter the confirmation code sent to your email:</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Confirmation code"
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
<<<<<<< HEAD

      <Button title="Confirm" onPress={handleConfirm} />

      {/* Green button to navigate back to the login page */}
      <TouchableOpacity style={styles.greenButton} onPress={navigateToLogin}>
        <Text style={styles.buttonText}>Go Back to Login</Text>
=======
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
<<<<<<< HEAD
    flex: 1,
    justifyContent: 'center', // Centers everything vertically
=======
    justifyContent: 'center',
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
<<<<<<< HEAD
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center', // Centers the text horizontally
  },
  buttonText: {
    color: 'white',
=======
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
>>>>>>> cfeef7fc54fe97fa0e13deb404eb0bb15ec3697b
    fontWeight: 'bold',
  },
});
