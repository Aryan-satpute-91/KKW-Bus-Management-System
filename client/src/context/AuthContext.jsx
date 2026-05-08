import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { authAPI } from '../services/api';
import { AuthContext } from './AuthContextValue';
import { auth } from '../services/firebase';

const getSavedUser = () => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  if (!token || !savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const loading = false;

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    localStorage.setItem('token', token);
    const res = await authAPI.getMe();
    const { user } = res.data;
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
