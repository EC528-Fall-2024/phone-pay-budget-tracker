import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { UserProvider } from './(context)/UserContext';
import { router } from 'expo-router';
import { Amplify } from 'aws-amplify';
import awsconfig from '../constants/config/aws-exports';
import 'react-native-get-random-values';


// initialize aws amplify
Amplify.configure(awsconfig)


export default function IndexPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Title */}
      <Text style={styles.appTitle}>Welcome to BudgetTracker</Text>

      {/* Description */}
      <Text style={styles.description}>
        Start managing your budget now. Log in or sign up to get started.
      </Text>

      {/* Navigate to Auth Button */}
      <TouchableOpacity style={styles.authButton} onPress={() => router.push('/login')}>
        <Text style={styles.authButtonText}>Go to Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.authButton} onPress={() => router.push('/signup')}>
        <Text style={styles.authButtonText}>Go to Signup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  authButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});