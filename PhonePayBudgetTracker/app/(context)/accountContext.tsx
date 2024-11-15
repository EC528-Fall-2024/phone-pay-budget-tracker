import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Account {
  account_id: string;
  current_balance: number;
  iso_currency_code: string;
  credit_limit: number | null;
  mask: string;
  name: string;
  subtype: string;
  type: string;
}

interface AccountContextType {
  accounts: Account[];
  addAccounts: (accounts: Account[]) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

let accountIdCounter = 1;

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const addAccounts = (newAccounts: Account[]) => {
    setAccounts((prevAccounts) => [
        ...prevAccounts,
        ...newAccounts.map((account) => ({
            ...account,
            id: (accountIdCounter++).toString(),
        })),
    ]);
};

  return (
    <AccountContext.Provider value={{ accounts, addAccounts }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (!context) {
      throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
