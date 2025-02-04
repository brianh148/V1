import { create } from 'zustand';
import { AuthState, AuthUser } from '../types/auth';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Generate stable UUIDs for testing that match the regex pattern
const TEST_USERS: Record<string, AuthUser> = {
  admin: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    role: 'admin'
  },
  client: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'client@example.com',
    role: 'client'
  },
  agent: {
    id: '123e4567-e89b-12d3-a456-426614174003',
    email: 'agent@example.com',
    role: 'agent'
  },
  inspector: {
    id: '123e4567-e89b-12d3-a456-426614174004',
    email: 'inspector@example.com',
    role: 'inspector'
  },
  vendor: {
    id: '123e4567-e89b-12d3-a456-426614174005',
    email: 'vendor@example.com',
    role: 'vendor'
  },
  wholesaler: {
    id: '123e4567-e89b-12d3-a456-426614174006',
    email: 'wholesaler@example.com',
    role: 'wholesaler'
  },
  va: {
    id: '123e4567-e89b-12d3-a456-426614174007',
    email: 'va@example.com',
    role: 'va'
  }
};

// Validate UUID helper function
const isValidUUID = (id: string): boolean => {
  return UUID_REGEX.test(id);
};

// Get test user by role
const getTestUser = (role: string): AuthUser => {
  const defaultUser = TEST_USERS.client;
  const user = TEST_USERS[role.toLowerCase() as keyof typeof TEST_USERS];
  return user || defaultUser;
};

export const useAuthStore = create<AuthState>((set) => ({
  // Start with wholesaler user by default for testing
  user: TEST_USERS.wholesaler,
  loading: false,
  initialized: true,
  setUser: (user: AuthUser | null) => {
    // If user is null, set to default wholesaler
    if (!user) {
      set({ user: TEST_USERS.wholesaler, loading: false, initialized: true });
      return;
    }

    // Ensure user has valid UUID
    if (!user.id || !isValidUUID(user.id)) {
      // Get test user by role or default to wholesaler
      const testUser = getTestUser(user.role || 'wholesaler');
      set({ user: testUser, loading: false, initialized: true });
      return;
    }

    set({ user, loading: false, initialized: true });
  },
  signIn: async (email: string, password: string) => {
    // Get role from email prefix or default to wholesaler
    const role = email.split('@')[0] || 'wholesaler';
    const testUser = getTestUser(role);
    set({ user: testUser, loading: false, initialized: true });
  },
  signOut: async () => {
    // Reset to wholesaler user
    set({ user: TEST_USERS.wholesaler, loading: false, initialized: true });
  },
  initialize: async () => {
    // Initialize with wholesaler user
    set({ user: TEST_USERS.wholesaler, loading: false, initialized: true });
  }
}));

// Initialize auth state
useAuthStore.getState().initialize();