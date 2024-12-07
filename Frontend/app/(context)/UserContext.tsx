import React, { createContext, useContext, useState, ReactNode } from 'react';

<<<<<<<< HEAD:Frontend/app/(context)/UserContext.tsx
// Define user data structure
========
>>>>>>>> main:Android/PhonePayBudgetTracker/app/(context)/UserContext.tsx
interface User {
  uid: string;
  name: string;
  email: string;
<<<<<<<< HEAD:Frontend/app/(context)/UserContext.tsx
========
  country: string;
  phone: string;
>>>>>>>> main:Android/PhonePayBudgetTracker/app/(context)/UserContext.tsx
}

interface UserContextType {
  userData: User | null;
  setUserData: (user: User | null) => void;
  clearUserData: () => void; // Add a function to clear user data (e.g., on logout)
}

const UserContext = createContext<UserContextType | undefined>(undefined);

<<<<<<<< HEAD:Frontend/app/(context)/UserContext.tsx
// Wraps the app and provides user data to all components
========
>>>>>>>> main:Android/PhonePayBudgetTracker/app/(context)/UserContext.tsx
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<User | null>(null);

  // Function to clear user data (e.g., on logout)
  const clearUserData = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
