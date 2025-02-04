export type UserRole = 'client' | 'agent' | 'inspector' | 'admin' | 'va' | 'vendor' | 'wholesaler';

export interface AuthUser {
  id: string;
  email?: string;
  role?: UserRole;
  user_metadata?: {
    role?: UserRole;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}