// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';

// export default function ContactUsScreen() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');

//   const handleSubmit = () => {
//     // Here you can handle the form submission, e.g., send data to your backend
//     if (!name || !email || !message) {
//       Alert.alert('Error', 'Please fill out all fields.');
//       return;
//     }

//     // Example: Send data to an API
//     // fetch('https://your-api-endpoint.com/contact', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //   },
//     //   body: JSON.stringify({ name, email, message }),
//     // })
//     //   .then(response => response.json())
//     //   .then(data => {
//     //     Alert.alert('Success', 'Your message has been sent.');
//     //     setName('');
//     //     setEmail('');
//     //     setMessage('');
//     //   })
//     //   .catch(error => {
//     //     console.error(error);
//     //     Alert.alert('Error', 'Failed to send your message.');
//     //   });

//     // For now, we'll just show a success alert
//     Alert.alert('Success', 'Your message has been sent.');
//     setName('');
//     setEmail('');
//     setMessage('');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>Contact Us</Text>
        
//         <Text style={styles.label}>Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Your Name"
//           value={name}
//           onChangeText={setName}
//         />

//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="your.email@example.com"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <Text style={styles.label}>Message</Text>
//         <TextInput
//           style={[styles.input, styles.textArea]}
//           placeholder="Your message..."
//           value={message}
//           onChangeText={setMessage}
//           multiline
//           numberOfLines={4}
//         />

//         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//           <Text style={styles.submitButtonText}>Send Message</Text>
//         </TouchableOpacity>
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
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#333',
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 5,
//     color: '#333',
//   },
//   input: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     fontSize: 16,
//     borderColor: '#ddd',
//     borderWidth: 1,
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top', // For Android to align text at the top
//   },
//   submitButton: {
//     backgroundColor: '#4caf50',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContactUsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    Alert.alert('Success', 'Your message has been sent.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Contact Us</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Send Message</Text>
        </TouchableOpacity>
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
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

