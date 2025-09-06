import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  UserCredential 
} from 'firebase/auth';
import { auth } from '../firebase-config'; // Assuming you have firebase-config.ts

interface AuthContextProps {
  currentUser: any | null;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({ 
  currentUser: null, 
  signup: () => Promise.reject(), 
  login: () => Promise.reject(), 
  logout: () => Promise.reject() 
}); 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signup = (email: string, password: string): Promise<UserCredential> => { 
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string): Promise<UserCredential> => { 
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};