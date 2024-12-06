import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Transaction {
  account_id: string;
  amount: number;
  authorized_date: string;
  iso_currency_code: string;
  logo_url: string;
  name: string;
  payment_channel: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransactions: (transactions: Transaction[]) => void;
  clearTransactions: () => void; // New function to clear transactions
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

let transactionIdCounter = 1;

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      ...newTransactions.map((transaction) => ({
        ...transaction,
        id: (transactionIdCounter++).toString(),
      })),
    ]);
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
