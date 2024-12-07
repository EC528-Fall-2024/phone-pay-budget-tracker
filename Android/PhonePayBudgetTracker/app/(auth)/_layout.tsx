import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // No header for login/signup screens
        animation: 'fade',  // Optional: smooth animation between auth screens
      }}
    >
      <Stack.Screen name="loginScreen" />
      <Stack.Screen name="signupScreen" />
    </Stack>
  );
}
