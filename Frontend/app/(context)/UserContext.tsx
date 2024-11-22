import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define user data structure
interface User {
  name: string;
  email: string;
}

// Define the shape of the context
interface UserContextType {
  userData: User | null;
  setUserData: (user: User | null) => void;
  clearUserData: () => void; // Add a function to clear user data (e.g., on logout)
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Wraps the app and provides user data to all components
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

// Hook to use user data
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
