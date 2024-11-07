import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { useUser } from '../(components)/UserContext'; // Import the useUser hook
import { getData } from '../apiService'; // Import your API call function

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, setUserData } = useUser();
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleEditProfile = async () => {
    setLoading(true); // Set loading to true while fetching data
    try {
      const profileData = await getData(); // Call the API to get user data
      console.log(profileData)
      setUserData(profileData); // Update user data in your context
      Alert.alert('Profile Updated', 'Your profile information has been updated.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch profile data.');
    } finally {
      setLoading(false); // Set loading back to false after fetching data
    }
  };

  const handleLogout = () => {
    setUserData(null);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Header with Gradient */}
        <View style={styles.profileHeader}>
          <View style={styles.headerBackground}>
            <Image
              source={{ uri: userData ? userData.profilePicture : 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{userData ? userData.name : 'Guest'}</Text>
          <Text style={styles.profileEmail}>{userData ? userData.email : 'guest@example.com'}</Text>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleEditProfile}>
            <Text style={styles.optionText}>{loading ? 'Updating...' : 'Edit Profile'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.optionButton]}>
            <Text style={styles.optionText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.optionButton]}>
            <Text style={styles.optionText}>Transaction History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.logoutButton]}>
            <Text onPress={handleLogout} style={[styles.optionText, styles.logoutText]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background for the app
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  headerBackground: {
    width: '100%',
    height: 150,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginTop: -60, // Move the profile image up
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  optionItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#ffebee',
  },
  logoutText: {
    color: '#f44336',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
  },
});
