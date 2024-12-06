import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FAQsScreen() {
  const router = useRouter();

  const faqs = [
    {
      question: 'How do I link my bank account?',
      answer: 'To link your bank account, go to your profile and tap on "Link a Bank Account". Follow the on-screen instructions to securely connect your bank.',
    },
    {
      question: 'How is my data secured?',
      answer: 'We prioritize your privacy and security. All your data is encrypted and securely stored. For more details, visit our Privacy Policy.',
    },
    {
      question: 'How can I reset my password?',
      answer: 'To reset your password, go to the login screen and tap on "Forgot Password". Follow the instructions sent to your registered email.',
    },
    // Add more FAQs as needed
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
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
  faqItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4caf50',
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
});
