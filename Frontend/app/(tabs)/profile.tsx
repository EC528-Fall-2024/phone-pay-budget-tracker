// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
// import { router } from 'expo-router';
// import { create, open, dismissLink, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
// import { fetchLinkToken, onSuccess, getProfileData, getTransactions } from '../apiService';  // Adjust your API import as needed

// export default function ProfileScreen() {
//   const [userData, setUserData] = useState({
//     pk: '',
//     accounts: [],
//     profilePhoto: '',
//     username: '',
//   });
//   const [loading, setLoading] = useState(true);
//   const [linkToken, setLinkToken] = useState(null);
//   const [access_Token, setAccess_Token] = useState('');

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const profileData = await getProfileData();
//         setUserData(profileData);
//       } catch (error) {
//         console.error(error);
//         Alert.alert('Error', 'Failed to fetch profile data.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfileData();
//   }, []);

//   const handleLogout = () => {
//     setUserData({
//       pk: '',
//       accounts: [],
//       profilePhoto: '',
//       username: '',
//     });
//     router.replace('/login');
//   };

//   const createLinkToken = useCallback(async () => {
//     try {
//       const token = await fetchLinkToken('custom_mahoney');
//       setLinkToken(token);
//     } catch (error) {
//       console.error('Error fetching link token:', error);
//       Alert.alert('Error', 'Failed to fetch link token');
//     }
//   }, []);

//   useEffect(() => {
//     createLinkToken();
//   }, []);

//   const handleOpenLink = async () => {
//     if (!linkToken) {
//       console.error('Link token is not available.');
//       return;
//     }

//     try {
//       const tokenConfig = { token: linkToken };
//       await create(tokenConfig);

//       const openProps = {
//         onSuccess: async (success: LinkSuccess) => {
//           try {
//             console.log(success.publicToken);
//             console.log(success.metadata.institution?.name);
//             const response = await onSuccess(success.publicToken, success.metadata.institution?.name);
//             console.log(response.accessToken);
//             console.log(response.accounts);
//             setAccess_Token(response.accessToken);

//             const transactionData = await getTransactions({ accessToken: response.accessToken });
//             console.log(transactionData);
//             Alert.alert('Success', 'Account linked successfully');
//           } catch (err) {
//             console.error('Error exchanging public token:', err);
//             Alert.alert('Error', 'Failed to retrieve transactions');
//           }
//         },
//         onExit: (linkExit: LinkExit) => {
//           console.log('Exit: ', linkExit);
//           dismissLink();
//         },
//         iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
//         logLevel: LinkLogLevel.ERROR,
//       };

//       open(openProps);
//     } catch (error) {
//       console.error('Error during Plaid link creation or opening:', error);
//       Alert.alert('Error', 'Unable to initiate Plaid Link.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#4caf50" />
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         <View style={styles.profileHeader}>
//           <View style={styles.headerBackground}>
//             <Image
//               source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/150' }}
//               style={styles.profileImage}
//             />
//           </View>
//           <View style={styles.nameContainer}>
//             <Text style={styles.profileName}>{userData.pk || 'username'}</Text>
//           </View>
//         </View>

//         {/* Account Options */}
//         <View style={styles.optionsContainer}>
//           <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleOpenLink}>
//             <Text style={styles.optionText}>Link your bank account</Text>
//           </TouchableOpacity>

//           {/* New "View Linked Accounts" Button */}
//           <TouchableOpacity
//             style={[styles.optionItem, styles.optionButton]}
//             onPress={() => router.push('/accounts')}
//           >
//             <Text style={styles.optionText}>View Linked Accounts</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.optionItem, styles.logoutButton]}>
//             <Text onPress={handleLogout} style={[styles.optionText, styles.logoutText]}>
//               Logout
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   profileHeader: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     backgroundColor: '#fff',
//     marginBottom: 20,
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   headerBackground: {
//     width: '100%',
//     height: 150,
//     backgroundColor: '#4caf50',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 4,
//     borderColor: '#fff',
//     marginTop: -60,
//   },
//   nameContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   profileName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   optionsContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   optionItem: {
//     paddingVertical: 18,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     alignItems: 'center',
//   },
//   optionButton: {
//     backgroundColor: '#e3f2fd',
//     borderRadius: 10,
//     marginVertical: 10,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   optionText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#333',
//   },
//   logoutButton: {
//     marginTop: 20,
//     borderRadius: 10,
//     backgroundColor: '#ffebee',
//   },
//   logoutText: {
//     color: '#f44336',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     paddingVertical: 15,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
// import { router } from 'expo-router';
// import { create, open, dismissLink, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
// import { fetchLinkToken, onSuccess, getProfileData, getTransactions } from '../apiService';  // Adjust your API import as needed

// export default function ProfileScreen() {
//   const [userData, setUserData] = useState({
//     pk: '',
//     accounts: [],
//     profilePhoto: '',
//     username: '',
//   });
//   const [loading, setLoading] = useState(true);
//   const [linkToken, setLinkToken] = useState(null);
//   const [access_Token, setAccess_Token] = useState('');
//   const [totalBalance, setTotalBalance] = useState(0);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const profileData = await getProfileData();
//         setUserData(profileData);

//         console.log(profileData.accounts)
        
//         // Calculate total balance
//         if (profileData.accounts.length == 0){
//           setTotalBalance(0);
//         } else{
//           const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
//           setTotalBalance(balanceSum);
//         }

//       } catch (error) {
//         console.error(error);
//         Alert.alert('Error', 'Failed to fetch profile data.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfileData();
//   }, []);

//   const handleLogout = () => {
//     setUserData({
//       pk: '',
//       accounts: [],
//       profilePhoto: '',
//       username: '',
//     });
//     router.replace('/login');
//   };

//   const createLinkToken = useCallback(async () => {
//     try {
//       const token = await fetchLinkToken('custom_mahoney');
//       setLinkToken(token);
//     } catch (error) {
//       console.error('Error fetching link token:', error);
//       Alert.alert('Error', 'Failed to fetch link token');
//     }
//   }, []);

//   useEffect(() => {
//     createLinkToken();
//   }, []);

//   const handleOpenLink = async () => {
//     if (!linkToken) {
//       console.error('Link token is not available.');
//       return;
//     }

//     try {
//       const tokenConfig = { token: linkToken };
//       await create(tokenConfig);

//       const openProps = {
//         onSuccess: async (success: LinkSuccess) => {
//           try {
//             console.log(success.publicToken);
//             console.log(success.metadata.institution?.name);
//             console.log(success.metadata.institution);

//             const response = await onSuccess(success.publicToken, success.metadata.institution?.name, success.metadata.institution?.id, userData.accounts );
//             console.log(response.accessToken);
//             console.log(response.accounts);
//             setAccess_Token(response.accessToken);

//             const transactionData = await getTransactions({ accessToken: response.accessToken });
//             console.log(transactionData);

//             const profileData = await getProfileData();
//             setUserData(profileData);
            
//             console.log(userData.accounts)
//             // Calculate total balance
//             if (profileData.accounts.length == 0){
//               setTotalBalance(0);
//             } else{
//               const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
//               setTotalBalance(balanceSum);
//             }

//             Alert.alert('Success', 'Account linked successfully');
//           } catch (err) {
//             console.error('Error exchanging public token:', err);
//             Alert.alert('Error', 'Failed to retrieve transactions');
//           }
//         },
//         onExit: (linkExit: LinkExit) => {
//           console.log('Exit: ', linkExit);
//           dismissLink();
//         },
//         iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
//         logLevel: LinkLogLevel.ERROR,
//       };

//       open(openProps);
//     } catch (error) {
//       console.error('Error during Plaid link creation or opening:', error);
//       Alert.alert('Error', 'Unable to initiate Plaid Link.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#4caf50" />
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         <View style={styles.profileHeader}>
//           <View style={styles.headerBackground}>
//             <Image
//               source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/150' }}
//               style={styles.profileImage}
//             />
//           </View>
//           <View style={styles.nameContainer}>
//             <Text style={styles.profileName}>{userData.pk || 'username'}</Text>
//           </View>
//           {/* Display Total Balance */}
//           <Text style={styles.balanceText}>Total Balance: ${totalBalance.toFixed(2)}</Text>
//         </View>

//         {/* Account Options */}
//         <View style={styles.optionsContainer}>
//           <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleOpenLink}>
//             <Text style={styles.optionText}>Link your bank account</Text>
//           </TouchableOpacity>

//           {/* New "View Linked Accounts" Button */}
//           <TouchableOpacity
//             style={[styles.optionItem, styles.optionButton]}
//             onPress={() => router.push('/accounts')}
//           >
//             <Text style={styles.optionText}>View Linked Accounts</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.optionItem, styles.logoutButton]}>
//             <Text onPress={handleLogout} style={[styles.optionText, styles.logoutText]}>
//               Logout
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   profileHeader: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     backgroundColor: '#fff',
//     marginBottom: 20,
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   headerBackground: {
//     width: '100%',
//     height: 150,
//     backgroundColor: '#4caf50',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 4,
//     borderColor: '#fff',
//     marginTop: -60,
//   },
//   nameContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   profileName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   balanceText: {
//     fontSize: 18,
//     color: '#333',
//     marginTop: 10,
//   },
//   optionsContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   optionItem: {
//     paddingVertical: 18,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     alignItems: 'center',
//   },
//   optionButton: {
//     backgroundColor: '#e3f2fd',
//     borderRadius: 10,
//     marginVertical: 10,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   optionText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#333',
//   },
//   logoutButton: {
//     marginTop: 20,
//     borderRadius: 10,
//     backgroundColor: '#ffebee',
//   },
//   logoutText: {
//     color: '#f44336',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     paddingVertical: 15,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { router } from 'expo-router';
import { create, open, dismissLink, LinkSuccess, LinkExit, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';
import { fetchLinkToken, onSuccess, getProfileData, getTransactions } from '../apiService';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    pk: '',
    accounts: [],
    profilePhoto: '',
    username: '',
  });
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfileData();
        setUserData(profileData);

        // Calculate total balance
        const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
        setTotalBalance(balanceSum);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Fetch link token for Plaid
  const createLinkToken = useCallback(async () => {
    try {
      const token = await fetchLinkToken(); // No hardcoded userId
      setLinkToken(token);
    } catch (err) {
      console.error('Error fetching link token:', err);
      setError('Failed to fetch link token.');
    }
  }, []);

  useEffect(() => {
    createLinkToken();
  }, []);

  // Open Plaid Link
  const handleOpenLink = async () => {
    if (!linkToken) {
      console.error('Link token is not available.');
      Alert.alert('Error', 'Plaid link token is unavailable.');
      return;
    }

    try {
      await create({ token: linkToken });

      open({
        onSuccess: async (success: LinkSuccess) => {
          try {
            const response = await onSuccess(success.publicToken, success.metadata.institution?.name, success.metadata.institution?.id, userData.accounts);

            // Fetch updated profile data
            const profileData = await getProfileData();
            setUserData(profileData);

            // Update total balance
            const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
            setTotalBalance(balanceSum);

            Alert.alert('Success', 'Account linked successfully');
          } catch (err) {
            console.error('Error processing Plaid success callback:', err);
            Alert.alert('Error', 'Failed to retrieve transactions.');
          }
        },
        onExit: (linkExit: LinkExit) => {
          console.log('User exited Plaid Link:', linkExit);
          dismissLink();
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.ERROR,
      });
    } catch (err) {
      console.error('Error opening Plaid Link:', err);
      Alert.alert('Error', 'Unable to initiate Plaid Link.');
    }
  };

  // Image picker for profile photo
  const handleChoosePhoto = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
      } else {
        const source = response.assets ? response.assets[0].uri : null;
        if (source) {
          setUserData((prevData) => ({
            ...prevData,
            profilePhoto: source,
          }));
          Alert.alert('Success', 'Profile photo updated');
        }
      }
    });
  };

  // Logout handler
  const handleLogout = () => {
    setUserData({
      pk: '',
      accounts: [],
      profilePhoto: '',
      username: '',
    });
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleChoosePhoto}>
            <View style={styles.headerBackground}>
              <Image
                source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/150' }}
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{userData.username || 'Guest'}</Text>
          </View>
          <Text style={styles.balanceText}>Total Balance: ${totalBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={handleOpenLink}>
            <Text style={styles.optionText}>Link your bank account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.optionButton]} onPress={() => router.push('/accounts')}>
            <Text style={styles.optionText}>View Linked Accounts</Text>
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
    backgroundColor: '#f5f5f5',
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
    marginTop: -60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});