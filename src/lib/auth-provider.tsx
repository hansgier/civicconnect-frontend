import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import apiClient from './api-client';
import { AuthContext, type AuthUser, type RegisterData } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = user?.email === 'guest@opts.local';

  // On mount: try to restore session via GET /api/auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await apiClient.get('/auth/me');
        const userData = {
          ...data.user,
          avatar: data.user.avatar ?? '',
          contributions: data.user.contributions ?? 0,
          joinedAt: data.user.joinedAt ?? data.user.createdAt ?? new Date().toISOString(),
        };
        setUser(userData);
      } catch {
        // No valid session — user is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const userData = {
      ...data.user,
      avatar: data.user.avatar ?? '',
      contributions: data.user.contributions ?? 0,
      joinedAt: data.user.joinedAt ?? data.user.createdAt ?? new Date().toISOString(),
    };
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<void> => {
    await apiClient.post('/auth/register', registerData);
    // Registration doesn't auto-login — user needs to verify email first
  }, []);

  const guestLogin = useCallback(async (): Promise<AuthUser> => {
    const { data } = await apiClient.post('/auth/guest');
    const userData = {
      ...data.user,
      avatar: data.user.avatar ?? '',
      contributions: data.user.contributions ?? 0,
      joinedAt: data.user.joinedAt ?? data.user.createdAt ?? new Date().toISOString(),
    };
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.delete('/auth/logout');
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        register,
        guestLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
