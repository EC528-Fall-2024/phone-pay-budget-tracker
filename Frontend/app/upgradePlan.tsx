import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function UpgradePlanScreen() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('Free');

  const handleUpgrade = (plan: string) => {
    setCurrentPlan(plan);
    alert(`You have successfully selected the ${plan} plan.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Upgrade Your Plan</Text>
        <Text style={styles.currentPlan}>
          Current Plan: <Text style={styles.planName}>{currentPlan}</Text>
        </Text>

        <View style={styles.plansContainer}>
          {/* Free Plan */}
          <PlanOption
            planName="Free Plan"
            details={[
              '$0.00/month',
              'Link 1 account',
              'View transaction history',
              'Basic data analysis',
            ]}
            color="#dcedc8"
            onPress={() => handleUpgrade('Free')}
          />

          {/* Standard Plan */}
          <PlanOption
            planName="Standard Plan"
            details={[
              '$9.99/month',
              'Link up to 3 accounts',
              'View graphs and charts',
              'Full data analysis',
            ]}
            color="#e3f2fd"
            onPress={() => handleUpgrade('Standard')}
          />

          {/* Premium Plan */}
          <PlanOption
            planName="Premium Plan"
            details={[
              '$19.99/month',
              'Unlimited linked accounts',
              'AI financial suggestions',
              'Priority customer support',
            ]}
            color="#ffecb3"
            onPress={() => handleUpgrade('Premium')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const PlanOption = ({ planName, details, color, onPress }) => {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 15 }}>
      <TouchableOpacity
        style={[styles.planButton, { backgroundColor: color }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.planText}>{planName}</Text>
        <View style={styles.planDetailsContainer}>
          {details.map((detail, index) => (
            <Text key={index} style={styles.planDetail}>
              {detail}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  currentPlan: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  planName: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  plansContainer: {
    marginTop: 20,
  },
  planButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  planText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  planDetailsContainer: {
    alignItems: 'center',
  },
  planDetail: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
