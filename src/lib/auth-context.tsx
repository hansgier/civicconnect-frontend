import { createContext, useContext } from 'react';

// The user shape returned by GET /api/auth/me and POST /api/auth/login
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BARANGAY' | 'ASSISTANT_ADMIN' | 'CITIZEN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  barangayId: string | null;
  emailVerified: boolean;
  avatar: string;
  contributions: number;
  joinedAt: string;
  createdAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  barangayId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<void>;
  guestLogin: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
