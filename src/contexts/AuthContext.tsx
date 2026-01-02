import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  apiKey: string;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
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

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error signing up:", error);
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message);
      throw error;
    }
  };

  const updateApiKey = async (newKey: string) => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('users')
            .update({ api_key: newKey })
            .eq('id', user.id);
            
        if (error) throw error;
        setApiKey(newKey);
    } catch (error) {
        console.error("Error updating API key:", error);
        throw error;
    }
  };

  const logout = async () => {
    setApiKey('');
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch extra user data like API Key
        try {
            const { data, error } = await supabase
                .from('users')
                .select('api_key')
                .eq('id', currentUser.id)
                .single();
            
            if (data) {
                setApiKey(data.api_key || '');
            }
        } catch (e) {
            console.error("Error fetching user data", e);
        }
      } else {
        setApiKey('');
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    apiKey,
    loading,
    error,
    signUp,
    signIn,
    updateApiKey,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
