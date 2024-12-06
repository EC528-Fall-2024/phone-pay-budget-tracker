import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { router } from 'expo-router';
import {
  create,
  open,
  dismissLink,
  LinkSuccess,
  LinkExit,
  LinkIOSPresentationStyle,
  LinkLogLevel,
} from 'react-native-plaid-link-sdk';
import { fetchLinkToken, onSuccess, getProfileData, getTransactions, setProfileData } from '../apiService';

export default function ProfileScreen() {
  type Account = {
    accountID: string;
    Bank: string;
    Mask: string;
    accessToken: string;
    Balance: number;
    Logo: string;
    Name: string;
  };

  type UserData = {
    pk: string;
    accounts: Account[];
    profilePhoto: string;
    email: string;
  };
  
  const [userData, setUserData] = useState<UserData>({
    pk: '',
    accounts: [],
    profilePhoto: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState(null);
  const [access_Token, setAccess_Token] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfileData();
        setUserData(profileData);

        // Calculate total balance
        const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
        setTotalBalance(balanceSum);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = () => {
    setUserData({
      pk: '',
      accounts: [],
      profilePhoto: '',
      email: '',
    });
    router.replace('/login');
  };

  const createLinkToken = useCallback(async () => {
    try {
      const token = await fetchLinkToken('custom_mahoney');
      setLinkToken(token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      Alert.alert('Error', 'Failed to fetch link token');
    }
  }, []);

  useEffect(() => {
    createLinkToken();
  }, []);

  const handleOpenLink = async () => {
    if (!linkToken) {
      console.error('Link token is not available.');
      return;
    }

    try {
      const tokenConfig = { token: linkToken };
      await create(tokenConfig);

      const openProps = {
        onSuccess: async (success: LinkSuccess) => {
          try {
            const response = await onSuccess(success.publicToken, success.metadata.institution?.name, success.metadata.institution?.id, userData.accounts, userData.email, userData.profilePhoto);
            setAccess_Token(response.accessToken);

            const profileData = await getProfileData();
            setUserData(profileData);

            const transactionData = await getTransactions({ accessToken: response.accessToken });

            const balanceSum = profileData.accounts.reduce((sum, account) => sum + (account.Balance || 0), 0);
            setTotalBalance(balanceSum);

            Alert.alert('Success', 'Account linked successfully');
          } catch (err) {
            console.error('Error exchanging public token:', err);
            Alert.alert('Error', 'Failed to retrieve transactions');
          }
        },
        onExit: (linkExit: LinkExit) => {
          dismissLink();
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.ERROR,
      };

      open(openProps);
    } catch (error) {
      console.error('Error during Plaid link creation or opening:', error);
      Alert.alert('Error', 'Unable to initiate Plaid Link.');
    }
  };

  const handleChoosePhoto = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else {
        const source = response.assets ? response.assets[0].uri : null;
        if (source) {
          try {
            await setProfileData({ pk: userData.pk, accounts: userData.accounts, email: userData.email, profilePhoto: source }); // Save the photo to the database
            setUserData((prevData) => ({
              ...prevData,
              profilePhoto: source,
            }));
            Alert.alert('Success', 'Profile photo updated');
          } catch (error) {
            console.error('Error saving profile photo:', error);
            Alert.alert('Error', 'Failed to update profile photo');
          }
        }
      }
    });
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
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleChoosePhoto}>
            <Image source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={styles.profileName}>{userData.pk || 'Guest'}</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>${totalBalance.toFixed(2)}</Text>
        </View>

        {/* <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          {userData.accounts.length ? (
            userData.accounts.map((account, index) => (
              <View key={index} style={styles.accountItem}>
                <Text style={styles.accountName}>{account.Name}</Text>
                <Text style={styles.accountBalance}>${account.Balance.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAccountsText}>No linked accounts</Text>
          )}
        </View> */}



        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/upgradePlan')}>
            <Text style={styles.optionText}>Upgrade Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={handleOpenLink}>
            <Text style={styles.optionText}>Link a Bank Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/accounts')}>
            <Text style={styles.optionText}>View All Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/faqs')}>
            <Text style={styles.optionText}>FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/privacyPolicy')}>
            <Text style={styles.optionText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/contactUs')}>
            <Text style={styles.optionText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
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
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderColor: '#4caf50',
    borderWidth: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    backgroundColor: '#4caf50',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  accountsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  accountName: {
    fontSize: 16,
    color: '#333',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  noAccountsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ffebee',
  },
  logoutText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
