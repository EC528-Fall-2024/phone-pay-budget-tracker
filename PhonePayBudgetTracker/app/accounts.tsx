// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { getProfileData } from './apiService';  // Adjust your API import as needed

// export default function AccountsScreen() {
//   const navigation = useNavigation();

//   const [userData, setUserData] = useState({
//     pk: '',
//     accounts: [],
//     profilePhoto: '',
//     email: '',
//   });
//   const [loading, setLoading] = useState(true);

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

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         {/* Back Button */}
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backButtonText}>← Back</Text>
//         </TouchableOpacity>

//         <Text style={styles.header}>Linked Accounts</Text>

//         {/* Display each account */}
//         {userData.accounts.map((account, index) => (
//           <View key={index} style={styles.accountCard}>
//             <View style={styles.accountHeader}>
//               <Image
//                 source={{ uri: userData.profilePhoto || 'https://via.placeholder.com/40' }}
//                 style={styles.accountImage}
//               />
//               <View>
//                 <Text style={styles.accountName}>{account.Name}</Text>
//                 <Text style={styles.bankName}>{account.Bank}</Text>
//               </View>
//             </View>
//             <View style={styles.accountDetails}>
//               <Text style={styles.detailText}>Type: {account.Name}</Text>
//               <Text style={styles.detailText}>Account Ending: {account.Mask}</Text>
//               <Text style={styles.balanceText}>Balance: ${account.Balance.toFixed(2)}</Text>
//             </View>
//           </View>
//         ))}
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
//   backButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: '#e3f2fd',
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//     marginBottom: 20,
//   },
//   backButtonText: {
//     fontSize: 16,
//     color: '#4caf50',
//     fontWeight: 'bold',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   accountCard: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   accountHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   accountImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 15,
//   },
//   accountName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   bankName: {
//     fontSize: 14,
//     color: '#666',
//   },
//   accountDetails: {
//     paddingTop: 10,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   balanceText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#4caf50',
//     marginTop: 10,
//   },
// });


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProfileData } from './apiService';

export default function AccountsScreen() {
  const navigation = useNavigation();

  const [userData, setUserData] = useState({
    pk: '',
    accounts: [],
    profilePhoto: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfileData();
        setUserData(profileData);
        console.log(profileData.accounts)
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Linked Accounts</Text>

        {/* Display each account */}
        {userData.accounts.map((account, index) => (
          <View key={index} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <Image
                source={{ uri: account.Logo ? `data:image/png;base64,${account.Logo}` : 'https://via.placeholder.com/40' }}
                style={styles.accountImage}
              />
              <View>
                <Text style={styles.accountName}>{account.Name}</Text>
                <Text style={styles.bankName}>{account.Bank}</Text>
              </View>
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.detailText}>Type: {account.Name}</Text>
              <Text style={styles.detailText}>Account Ending: {account.Mask}</Text>
              <Text style={styles.balanceText}>Balance: ${account.Balance.toFixed(2)}</Text>
            </View>
          </View>
        ))}
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
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bankName: {
    fontSize: 14,
    color: '#666',
  },
  accountDetails: {
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 10,
  },
});

