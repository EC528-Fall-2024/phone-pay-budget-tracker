import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text>Enter confirmation code sent to your email:</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Confirmation code"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  error: {
    color: 'red',
  },
});
