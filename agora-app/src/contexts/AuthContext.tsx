import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { apiClient } from '../services/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  uid: string;
  email: string;
  name?: string;
  role: 'admin' | 'fan';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleAuthChange(session.user);
      } else {
        await AsyncStorage.removeItem('auth_token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleAuthChange(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (token) {
        await AsyncStorage.setItem('auth_token', token);
        
        // Buscar dados do usuário da API
        try {
          const meResponse = await apiClient.getMe();
          setUser(meResponse.user);
        } catch (apiError) {
          // Se a API falhar, usar dados do Supabase
          console.warn('API error, using Supabase user data:', apiError);
          setUser({
            uid: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
            role: 'fan', // Default role
          });
        }
      }
    } catch (error) {
      console.error('Error handling auth change:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      const token = data.session.access_token;
      await AsyncStorage.setItem('auth_token', token);
      
      // Buscar dados do usuário da API
      try {
        const loginResponse = await apiClient.login(token);
        setUser(loginResponse.user);
      } catch (apiError) {
        // Se a API falhar, usar dados do Supabase
        const userData = data.user;
        setUser({
          uid: userData.id,
          email: userData.email || '',
          name: userData.user_metadata?.name || userData.user_metadata?.full_name,
          role: 'fan',
        });
      }
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          full_name: name || '',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      const token = data.session.access_token;
      await AsyncStorage.setItem('auth_token', token);
      
      // O usuário será configurado pelo listener onAuthStateChange
      if (data.user) {
        await handleAuthChange(data.user);
      }
    } else {
      // Email de confirmação enviado
      throw new Error('Por favor, verifique seu email para confirmar sua conta.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



