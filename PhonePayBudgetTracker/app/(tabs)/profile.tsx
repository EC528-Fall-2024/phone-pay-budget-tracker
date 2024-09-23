import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from "expo-router";
import { useUser } from '../(context)/UserContext'; // Import the useUser hook

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, setUserData } = useUser();

  const handleLogout = () => {
    setUserData(null);

    router.replace("/login");
  };
  // Mock user data
  //const userData = {
  //  name: 'John Doe',
  //  email: 'johndoe@example.com',
  //  profilePicture: 'https://via.placeholder.com/150', // Placeholder image URL
  //};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Picture */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionItem, styles.logoutButton]}>
            <Text onPress={handleLogout} style={[styles.optionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Ensure the background color is set
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  logoutText: {
    color: '#f44336',
    textAlign: 'center',
  },
});
