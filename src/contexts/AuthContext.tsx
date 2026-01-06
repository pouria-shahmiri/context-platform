import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../services/firebase';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  apiKey: string;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  reauthenticate: () => Promise<void>;
  updateApiKey: (newKey: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user doc exists, if not create it
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          apiKey: '',
          createdAt: new Date().toISOString()
        });
      }
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in with Email:", error);
      setError(error.message);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Create user doc
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        apiKey: '',
        createdAt: new Date().toISOString()
      });
      
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing up with Email:", error);
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      setError(error.message);
      throw error;
    }
  };

  const updateUserPassword = async (password: string) => {
    setError(null);
    if (!auth.currentUser) throw new Error("No user logged in");
    try {
      await updatePassword(auth.currentUser, password);
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError(error.message);
      throw error;
    }
  };

  const reauthenticate = async () => {
    setError(null);
    if (!auth.currentUser) throw new Error("No user logged in");
    
    try {
        const providerId = auth.currentUser.providerData[0]?.providerId;
        
        // If user logged in with Google, re-auth with Google
        if (providerId === GoogleAuthProvider.PROVIDER_ID) {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(auth.currentUser, provider);
        } else {
            // For other providers (like email/password), we can't easily re-auth with popup without password.
            // But since this flow is mainly for Google users setting a password, we might be hitting this
            // if a user is technically "logged in" but session is old.
            // We'll throw specific error to let UI handle it.
            throw new Error("Please log out and log in again to verify your identity.");
        }
    } catch (error: any) {
        console.error("Error reauthenticating:", error);
        setError(error.message);
        throw error;
    }
  };

  const updateApiKey = async (newKey: string) => {
    if (!user) return;
    try {
        await setDoc(doc(db, 'users', user.uid), {
            apiKey: newKey
        }, { merge: true });
        setApiKey(newKey);
    } catch (error) {
        console.error("Error updating API key:", error);
        throw error;
    }
  };

  const logout = async () => {
    setApiKey('');
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch API key
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setApiKey(data.apiKey || data.api_key || '');
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
      } else {
        setApiKey('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    apiKey,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updateUserPassword,
    reauthenticate,
    updateApiKey,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
