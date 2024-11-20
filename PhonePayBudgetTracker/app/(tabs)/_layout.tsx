import { Tabs, Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return(
    <Stack
    screenOptions={{
      headerShown: false,
      animation: 'fade', 
    }}
  >
    <Stack.Screen name="mainScreen" />
    <Stack.Screen name="profileScreen" />
  </Stack>
);
}

  
