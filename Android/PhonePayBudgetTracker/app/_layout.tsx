import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Import your global CSS file
import "../global.css";

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider } from './(context)/UserContext';
import { TransactionProvider } from './(context)/transactionContext';
import { AccountProvider } from './(context)/accountContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
<<<<<<<< HEAD:Frontend/app/_layout.tsx
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="accounts" options={{ headerShown: false }} />
        <Stack.Screen name="expenseScreen" options={{ headerShown: false }} />
        <Stack.Screen name="incomeScreen" options={{ headerShown: false }} />
        <Stack.Screen name="bothScreen" options={{ headerShown: false }} />
        <Stack.Screen name="faqs" options={{ headerShown: false }} />
        <Stack.Screen name="contactUs" options={{ headerShown: false }} />
        <Stack.Screen name="upgradePlan" options={{ headerShown: false }} />
        <Stack.Screen name="privacyPolicy" options={{ headerShown: false }} />


      </Stack>
    </ThemeProvider>
========
      <AccountProvider>
        <TransactionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </TransactionProvider>
      </AccountProvider>
>>>>>>>> main:Android/PhonePayBudgetTracker/app/_layout.tsx
    </UserProvider>
  );
}
