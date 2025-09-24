import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_CONFIG } from '../config/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = localStorage.getItem(AUTH_CONFIG.storageKeys.auth);
      const authTimestamp = localStorage.getItem(AUTH_CONFIG.storageKeys.timestamp);

      if (authStatus === 'true' && authTimestamp) {
        const timestamp = parseInt(authTimestamp, 10);
        const now = Date.now();

        // Check if the session is still valid
        if (now - timestamp < AUTH_CONFIG.sessionDuration) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear storage
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (password: string): boolean => {
    if (password === AUTH_CONFIG.password) {
      try {
        localStorage.setItem(AUTH_CONFIG.storageKeys.auth, 'true');
        localStorage.setItem(AUTH_CONFIG.storageKeys.timestamp, Date.now().toString());
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Error saving auth status:', error);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_CONFIG.storageKeys.auth);
      localStorage.removeItem(AUTH_CONFIG.storageKeys.timestamp);
    } catch (error) {
      console.error('Error clearing auth status:', error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};