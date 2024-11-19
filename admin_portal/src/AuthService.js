import { Amplify } from 'aws-amplify';
import * as auth from '@aws-amplify/auth'; // Import all authentication methods from @aws-amplify/auth
import awsConfig from './aws-exports'; // Update this path to match your configuration file
import { jwtDecode } from 'jwt-decode';

// Configure Amplify with AWS settings
Amplify.configure(awsConfig);

export const login = async (email, password) => {
  try {
    // Sign in the user with email and password
    const user = await auth.signIn(email, password);

    // Get the ID token and decode it to check for user groups
    const idToken = user.signInUserSession.idToken.jwtToken;
    const decodedToken = jwtDecode(idToken);
    const groups = decodedToken['cognito:groups'] || [];

    // Check if the user belongs to the Admin group
    if (groups.includes('Admin')) {
      return { success: true, user };
    } else {
      throw new Error('Access denied. You are not an admin.');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth.signOut(); // Sign out the user
    console.log('Logout successful.');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
