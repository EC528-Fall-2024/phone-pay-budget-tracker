import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Transaction {
  account_id: string;
  amount: number;
  authorized_date: string;
  iso_currency_code: string;
  logo_url: string;
  name: string;
  payment_channel: string;
  category: string;
  id?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransactions: (transactions: Transaction[]) => void;
  clearTransactions: () => void; 
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

let transactionIdCounter = 1;

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions((prevTransactions) => {
      const combinedTransactions = [
        ...prevTransactions,
        ...newTransactions.map((transaction) => ({
          ...transaction,
          id: transaction.id || `txn_${transactionIdCounter++}`,
        })),
      ];
      const uniqueTransactions = Array.from(
        new Map(
          combinedTransactions.map((t) => [`${t.account_id}-${t.authorized_date}`, t])
        ).values()
      );
      uniqueTransactions.sort(
        (a, b) => new Date(a.authorized_date).getTime() - new Date(b.authorized_date).getTime()
      );
      return uniqueTransactions;
    });
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransactions, clearTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};
