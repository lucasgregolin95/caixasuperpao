import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserResponse, UserRole } from '@superbom/shared';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('superbom_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<UserResponse>('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário logado:', error);
      // O interceptor do api.ts se encarrega de limpar e redirecionar se o token falhar de vez
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: loggedUser } = response.data;

      localStorage.setItem('superbom_access_token', accessToken);
      localStorage.setItem('superbom_refresh_token', refreshToken);
      setUser(loggedUser);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('superbom_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      // Ignora erro no logout do backend
    } finally {
      localStorage.removeItem('superbom_access_token');
      localStorage.removeItem('superbom_refresh_token');
      setUser(null);
      setIsLoading(false);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
