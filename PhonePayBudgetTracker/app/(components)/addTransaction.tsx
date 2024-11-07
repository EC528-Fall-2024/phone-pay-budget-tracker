import React, { useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { format } from 'date-fns'; // for date formatting

const BillAddScreen: React.FC = () => {
  const [isOutcome, setIsOutcome] = useState(true);
  const [amount, setAmount] = useState('0.00');
  const [remarkInput, setRemarkInput] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // For controlling date picker visibility

  const navigation = useNavigation(); // for navigation

  // Handle date picker selection
  const onChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Hide the date picker after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Show the date picker based on platform
  const showPicker = () => {
    setShowDatePicker(true);
  };

  // Handle amount calculation (similar to calcMoney in Java)
  const calcAmount = (num: number) => {
    if (amount === '0.00' && num === 0) return;
    setAmount(prevAmount => {
      let newAmount = parseFloat(prevAmount) + num;
      return newAmount.toFixed(2);
    });
  };

  // Handle submission (similar to doCommit in Java)
  const handleSubmit = () => {
    if (amount === '0.00') {
      Alert.alert('Error', 'Amount cannot be 0.');
      return;
    }
    
    // Prepare the submitted bill data
    const billData = {
      isOutcome,
      amount,
      remark: remarkInput,
      date,
    };
  
    // Pass the data and navigate back to the MonthList screen
    router.replace('/showList');
  };
  

  return (
    <View style={styles.container}>
      {/* Income/Outcome toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={isOutcome ? styles.activeButton : styles.button} onPress={() => setIsOutcome(true)}>
          <Text style={styles.buttonText}>Spending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={!isOutcome ? styles.activeButton : styles.button} onPress={() => setIsOutcome(false)}>
          <Text style={styles.buttonText}>Income</Text>
        </TouchableOpacity>
      </View>

      {/* Date picker */}
      <TouchableOpacity onPress={showPicker} style={styles.datePicker}>
        <Text>{format(date, 'yyyy-MM-dd')}</Text>
      </TouchableOpacity>

      {/* Show DateTimePicker when needed */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}

      {/* Amount Input */}
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.amountInput}
        placeholder="Enter amount"
      />

      {/* Remarks input */}
      <TextInput
        value={remarkInput}
        onChangeText={setRemarkInput}
        style={styles.remarkInput}
        placeholder="Comment"
      />

      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  activeButton: {
    padding: 10,
    backgroundColor: '#694fad',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  datePicker: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  amountInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  remarkInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#694fad',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BillAddScreen;
