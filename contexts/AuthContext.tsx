import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  gamesPlayed: number;
  totalScore: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || '',
          gamesPlayed: 0,
          totalScore: 0,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      setUser({
        id: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        email: firebaseUser.email || '',
        gamesPlayed: 0,
        totalScore: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username });
      }
      // Firestore'a kullanıcı ekle
      await setDoc(doc(db, "users", firebaseUser.uid), {
        id: firebaseUser.uid,
        username,
        email: firebaseUser.email || '',
        gamesPlayed: 0,
        totalScore: 0,
      });
      setUser({
        id: firebaseUser.uid,
        username,
        email: firebaseUser.email || '',
        gamesPlayed: 0,
        totalScore: 0,
      });
      console.log('Kullanıcı başarıyla kaydedildi:', firebaseUser);
    } catch (error: any) {
      console.log('Kayıt hatası:', error.message || error);
      throw new Error(error.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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