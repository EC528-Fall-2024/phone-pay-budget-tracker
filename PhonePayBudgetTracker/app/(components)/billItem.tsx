import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Transaction = {
    id: number;
    name: string;
    amount: number;
    date: string;
  };

interface BillItemProps {
    transaction: Transaction;
}

const BillItem: React.FC<BillItemProps> = ({ transaction }) => {
    return (
        <View style={styles.billItem}>
        <Text style={styles.billText}>{transaction.name} - ${transaction.amount.toFixed(2)}</Text>
        <Text style={styles.billDate}>{new Date(transaction.date).toLocaleDateString()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    billItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    billText: {
        fontSize: 16,
    },
    billDate: {
        color: '#777',
    },
});

export default BillItem;
  