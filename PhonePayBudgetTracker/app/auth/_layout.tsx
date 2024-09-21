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
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
