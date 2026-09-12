const fs = require('fs');

const authContextCode = `
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('tradepro_auth_token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: \`Bearer \${token}\` }
          });
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('tradepro_auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('tradepro_auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem('tradepro_auth_token');
    if (token) {
      try {
        await axios.post('/api/auth/logout', {}, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('tradepro_auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
`;

fs.writeFileSync('src/contexts/AuthContext.tsx', authContextCode);
