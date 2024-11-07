import React, { createContext, useContext, useState, ReactNode } from 'react';

// user data structure
interface User {
  name: string;
  email: string;
  profilePicture: string;
  //phone: string;
  //role: boolean; //(admin)
  //bio: string;
  //county: string;
}

// Define the shape of the context
interface UserContextType {
  userData: User | null;
  setUserData: (user: User | null) => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Wrapps app and provides user data to all components
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<User | null>(null); 

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
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
