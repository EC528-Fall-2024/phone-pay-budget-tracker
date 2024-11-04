import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform, NativeModules } from 'react-native';
import { router } from 'expo-router';
import { create, open, dismissLink, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
import { fetchLinkToken, onSuccess, getProfileData } from '../apiService';  // Adjust your API import as needed

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    profilePhoto: '',
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);  // State to manage loading
  const [linkToken, setLinkToken] = useState(null);  // State to store the link token

  // Function to fetch the profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfileData();  // Call the API to get user data
        setUserData(profileData);  // Update user data in the state
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false);  // Set loading to false after fetching data
      }
    };

    fetchProfileData();  // Automatically fetch the profile data on mount
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

  // // Function to fetch the Plaid link token
  // const createLinkToken = useCallback(async () => {
  //   try {
  //     const token = await fetchLinkToken('custom_mahoney');  // Call your API to get the link token
  //     setLinkToken(token);
  //     console.log(linkToken)
  //   } catch (error) {
  //     console.error('Error fetching link token:', error);
  //     Alert.alert('Error', 'Failed to fetch link token');
  //   }
  // }, []);

  // // Helper function to create the open props for Plaid Link
  // const createLinkOpenProps = () => {
  //   return {
  //     onSuccess: async (success: LinkSuccess) => {
  //       try {
  //         console.log("try")
  //         await onSuccess(success.publicToken);  // Exchange the publicToken for an accessToken
  //         Alert.alert('Success', 'Account linked successfully');
  //         router.push('../onSuccess')
  //       } catch (err) {
  //         console.error('Error exchanging public token:', err);
  //         Alert.alert('Error', 'Failed to retrieve transactions');
  //       }
  //     },
  //     onExit: (linkExit: LinkExit) => {
  //       console.log('Exit: ', linkExit);
  //       dismissLink();  // Dismiss the Plaid Link UI
  //     },
  //     iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,  // Modal presentation on iOS
  //     logLevel: LinkLogLevel.ERROR,  // Log level for debugging
  //   };
  // };

  // // Handler to open the Plaid Link UI
  // const handleOpenLink = async () => {
  //   console.log("hello")
  //   await createLinkToken();
  //   const openProps = createLinkOpenProps();
  //   open(openProps);  // Open the Plaid Link UI

  // };

  const createLinkToken = useCallback(async () => {
    try {
      const token = await fetchLinkToken('custom_mahoney');
      setLinkToken(token);
      openPlaidLinkOnAndroid(token); // pass the token to android
    } catch (error) {
      console.error('Error fetching link token:', error);
      Alert.alert('Error', 'Failed to fetch link token');
    }
  }, []);

  // pass token to PhonePayBudgetTracker\android\app\src\main\java\com\anonymous\PhonePayBudgetTracker\MainActivity.kt
  const openPlaidLinkOnAndroid = (token) => {
    if (Platform.OS === 'android' && NativeModules.PlaidModule) { //only do it if its android OS
      NativeModules.PlaidModule.startPlaidLink(token); //pass the token
    }
  };

  useEffect(() => {
    createLinkToken();
  }, []);

  // Ensure the create() is called and its success is awaited before opening the link
  const handleOpenLink = async () => {
    if (!linkToken) {
      console.error('Link token is not available.');
      return;
    }

    openPlaidLinkOnAndroid(linkToken); // ensure android trigger plaid link

    try {
      const tokenConfig = { token: linkToken };
      await create(tokenConfig); // Call create with the token

      // Now open the link
      const openProps = {
        onSuccess: async (success: LinkSuccess) => {
          try {
            console.log(success.publicToken)
            const response = await onSuccess(success.publicToken); // Exchange the publicToken for an accessToken
            // Extract the required fields: name, date, amount, and merchant_name (description)
            
            console.log(response.transactions)
            response.transactions.transactions.forEach(transaction => {
              const { name, date, amount, transaction_type } = transaction;
              console.log(`Name: ${name}`);
              console.log(`Date: ${date}`);
              console.log(`Amount: $${amount}`);
              console.log(`Description: ${transaction_type}`);
              console.log('---------------------');
            });
            Alert.alert('Success', 'Account linked successfully');
            router.push('../onSuccess');
          } catch (err) {
            console.error('Error exchanging public token:', err);
            Alert.alert('Error', 'Failed to retrieve transactions');
          }
        },
        onExit: (linkExit: LinkExit) => {
          console.log('Exit: ', linkExit);
          dismissLink(); // Dismiss the Plaid Link UI
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL, // Modal presentation on iOS
        logLevel: LinkLogLevel.ERROR, // Log level for debugging
      };

      open(openProps); // Open the Plaid Link UI
    } catch (error) {
      console.error('Error during Plaid link creation or opening:', error);
      Alert.alert('Error', 'Unable to initiate Plaid Link.');
    }
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

          {/* Username */}
          <Text style={styles.profileUsername}>{userData.username || 'username'}</Text>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleOpenLink}>
            <Text style={styles.optionText}>Link your bank account</Text>
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
