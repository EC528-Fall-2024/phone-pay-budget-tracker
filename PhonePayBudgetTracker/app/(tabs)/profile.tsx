import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { getProfileData } from '../apiService'; // Import your API call function

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    profilePhoto: '',
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(true); // State to manage loading

  // useEffect to automatically fetch user data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfileData(); // Call the API to get user data
        setUserData(profileData); // Update user data in your state
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false); // Set loading back to false after fetching data
      }
    };

    fetchProfileData(); // Automatically fetch the profile data on mount
  }, []);

  const handleLogout = () => {
    setUserData({
      profilePhoto: '',
      firstName: '',
      lastName: '',
      username: '',
      password: ''
    });
    router.replace('/login');
  };

  const handleEditProfile = () => {
    // Navigate to the editProfile page
    router.push('editProfile'); // TO DO: IMPLEMENT THE EDIT PROFILE PAGE
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Header with Gradient */}
        <View style={styles.profileHeader}>
          <View style={styles.headerBackground}>
            <Image
              source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </View>

          {/* First and Last Name in one line */}
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{userData.firstName || 'First'}</Text>
            <Text style={styles.profileName}> {userData.lastName || 'Last'}</Text>
          </View>

          {/* Move the username here */}
          <Text style={styles.profileUsername}>{userData.username || 'username'}</Text>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleEditProfile}>
            <Text style={styles.optionText}>Edit Profile</Text>
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
  nameContainer: {
    flexDirection: 'row', // Arrange names in a row
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
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
    backgroundColor: '#e3f2fd', // Blueish background
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
