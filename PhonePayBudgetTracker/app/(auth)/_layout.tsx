import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // No header for login/signup screens
        animation: 'fade',  // Optional: smooth animation between auth screens
      }}
    >
      {/* Login and Signup screens are routed here */}
      <Stack.Screen name="loginScreen" />
      <Stack.Screen name="signupScreen" />
      <Stack.Screen name="link" />
    </Stack>
  );
}
