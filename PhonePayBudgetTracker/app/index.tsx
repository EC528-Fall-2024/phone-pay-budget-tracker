import React from 'react';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function IndexPage() {
  useEffect(() => {
    // Redirect to the login page when the index page loads
    router.replace('/loginScreen');
  }, []);

  return null; // Return null as the page is just for redirection
}