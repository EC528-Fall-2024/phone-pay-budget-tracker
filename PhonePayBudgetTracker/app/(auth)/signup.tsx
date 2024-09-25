import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from "expo-router";
import SignupForm from "../../components/SignupForm";


export default function SignupScreen() {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [cpassword, setcPassword] = React.useState('');
  //const [profilePicture, setProfilePicture] = React.useState('');

  //const passwordSame = (): boolean => {
  //  return password === cpassword;
  //};

  const onSignupPress = () => {
    ///if (!passwordSame()) {
    //  return; // Prevent form submission if passwords don't match
    //}
    const userData = {
      username,
      email,
      password,
      //profilePicture,
    };
    SignupForm(userData);
    console.log('User signuping');
    router.replace("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Title */}
      <Text style={styles.appTitle}>BudgetTracker</Text>
      
      {/* Signup Section */}
      <View style={styles.signupContainer}>
        <Text style={styles.title}>Create Your Account</Text>

        {/* Name Input */}
        <TextInput value={username} onChangeText={setUsername} placeholder="Full Name" style={styles.input} />

        {/* Email Input */}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />

        {/* Password Input */}
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} />

        {/* Confirm Password Input */}
        <TextInput value={cpassword} onChangeText={setcPassword} placeholder="Confirm Password" secureTextEntry style={styles.input} />

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={onSignupPress}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Link to Login */}
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7', // Light background color for a clean look
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50', // Greenish color for the app title
    marginBottom: 50, // Spacing from the top
    textAlign: 'center',
  },
  signupContainer: {
    width: '40%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000', // Add shadow for depth
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // Elevation for Android shadow
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Darker text color
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fafafa', // Light background for input fields
  },
  signupButton: {
    backgroundColor: '#4CAF50', // Greenish button color
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#fff', // White text on the signup button
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    color: '#4CAF50', // Matching color with the app title and button
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline', // Underline for the link
  },
});
