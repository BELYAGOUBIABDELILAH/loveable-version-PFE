/**
 * AuthContext - Firebase Implementation
 * CityHealth - Healthcare Directory Platform
 * 
 * This context provides authentication state and methods using Firebase Auth.
 * Replaces the previous mock localStorage implementation.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  onAuthChange,
  getUserProfile,
  getUserRole,
  updateUserProfile,
} from '@/integrations/firebase/services/authService';
import { OFFLINE_MODE } from '@/config/app';
import type { UserRole } from '@/integrations/firebase/types';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'citizen' | 'provider' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'citizen' | 'provider') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Offline mode storage keys
const STORAGE_KEY = 'cityhealth_auth_user';
const USERS_KEY = 'cityhealth_users';

const getMockUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};


/**
 * Convert Firebase user to our User interface
 */
const firebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const role = await getUserRole(firebaseUser.uid) || 'citizen';
  const profile = await getUserProfile(firebaseUser.uid);
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: profile?.fullName || firebaseUser.displayName || 'User',
    avatar: profile?.avatarUrl || firebaseUser.photoURL || undefined,
    role: role as 'citizen' | 'provider' | 'admin',
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In offline mode, use localStorage
    if (OFFLINE_MODE) {
      const checkOfflineAuth = () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Offline auth check failed:', error);
        } finally {
          setIsLoading(false);
        }
      };
      checkOfflineAuth();
      return;
    }

    // In online mode, use Firebase Auth listener
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const appUser = await firebaseUserToUser(firebaseUser);
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (OFFLINE_MODE) {
        // Offline mode: use localStorage
        const users = getMockUsers();
        const foundUser = users.find(u => u.email === email);
        
        if (!foundUser) {
          throw new Error('Email ou mot de passe incorrect');
        }

        setUser(foundUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
        toast.success('Connexion réussie!');
      } else {
        // Online mode: use Firebase Auth
        const firebaseUser = await firebaseSignIn(email, password);
        const appUser = await firebaseUserToUser(firebaseUser);
        setUser(appUser);
        toast.success('Connexion réussie!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la connexion';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signup = async (email: string, password: string, name: string, role: 'citizen' | 'provider') => {
    setIsLoading(true);
    try {
      if (OFFLINE_MODE) {
        // Offline mode: use localStorage
        const users = getMockUsers();
        
        if (users.some(u => u.email === email)) {
          throw new Error('Un compte existe déjà avec cet email');
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveMockUsers(users);
        
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        toast.success('Compte créé avec succès!');
      } else {
        // Online mode: use Firebase Auth
        const firebaseUser = await firebaseSignUp(email, password, name, role as UserRole);
        const appUser = await firebaseUserToUser(firebaseUser);
        setUser(appUser);
        toast.success('Compte créé avec succès! Vérifiez votre email.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (OFFLINE_MODE) {
        // Offline mode: create mock Google user
        const mockGoogleUser: User = {
          id: crypto.randomUUID(),
          email: 'demo@gmail.com',
          name: 'Utilisateur Demo',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          role: 'citizen',
          createdAt: new Date().toISOString(),
        };

        const users = getMockUsers();
        const existingUser = users.find(u => u.email === mockGoogleUser.email);
        
        const finalUser = existingUser || mockGoogleUser;
        
        if (!existingUser) {
          users.push(mockGoogleUser);
          saveMockUsers(users);
        }

        setUser(finalUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
        toast.success('Connexion Google réussie!');
      } else {
        // Online mode: use Firebase Google Auth
        const firebaseUser = await firebaseSignInWithGoogle();
        const appUser = await firebaseUserToUser(firebaseUser);
        setUser(appUser);
        toast.success('Connexion Google réussie!');
      }
    } catch (error) {
      toast.error('Échec de la connexion Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (OFFLINE_MODE) {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        await firebaseSignOut();
        setUser(null);
      }
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Échec de la déconnexion');
      throw error;
    }
  };


  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      if (OFFLINE_MODE) {
        // Offline mode: update localStorage
        const updatedUser = { ...user, ...updates };
        const users = getMockUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index !== -1) {
          users[index] = updatedUser;
          saveMockUsers(users);
        }

        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
        // Online mode: update Firestore profile
        await updateUserProfile(user.id, {
          fullName: updates.name,
          avatarUrl: updates.avatar,
        });
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Échec de la mise à jour du profil');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
