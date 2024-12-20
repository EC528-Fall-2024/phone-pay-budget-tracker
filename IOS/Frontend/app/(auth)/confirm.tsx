import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';
import { router, useLocalSearchParams } from 'expo-router';
import { setProfileData } from '../apiService';


export default function ConfirmSignUpScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const { username, email } = useLocalSearchParams();

  //const userNameString = Array.isArray(username) ? username[0] : username;
  const userNameString = Array.isArray(username) ? username[0].toLowerCase() : username?.toLowerCase();

  const handleConfirm = async () => {
    try {
      const response = await Auth.confirmSignUp(userNameString, code);
      console.log('User confirmed', response);


      const profileData = {
        pk: userNameString,  // Using the username as the primary key (pk)
        email: email,
        profilePhoto: 'https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii'  // Optionally add a default profile photo URL
      };
  
      // Call the setProfileData API to save the profile data
      try {
        await setProfileData(profileData);
        console.log('Profile data saved successfully');
      } catch (error) {
        console.error('Error saving profile data:', error);
        return;  // Exit if saving profile data fails
      }


      router.replace("/login"); // Redirect to login page after successful confirmation
    } catch (error) {
      setError('Failed to confirm sign-up. Try again.');
      console.log('Error confirming sign-up:', error);
    }
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
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    fontWeight: 'bold',
  },
});
