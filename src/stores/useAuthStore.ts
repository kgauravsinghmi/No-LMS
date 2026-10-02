import { create } from 'zustand';
import { AuthUser, UserPermissions, UserRole } from '../types/auth';
import { authService, ROLE_PERMISSIONS } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: UserPermissions;
  isAuthModalOpen: boolean;
  authModalDefaultTab: 'presets' | 'credentials' | 'sso';
  requiredPermissionPrompt?: keyof UserPermissions | null;

  // Actions
  loginWithPreset: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string, preferredRole?: UserRole) => Promise<void>;
  loginWithOAuth: (provider: 'oauth2' | 'supabase', targetRole?: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  openAuthModal: (tab?: 'presets' | 'credentials' | 'sso', requiredPermission?: keyof UserPermissions | null) => void;
  closeAuthModal: () => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
}

// Initialize from existing session if valid, or default to demo Instructor/Admin for developer ease
const initialSession = authService.getSession();
const defaultRole: UserRole = initialSession ? initialSession.user.role : 'admin';
const defaultUser: AuthUser | null = initialSession ? initialSession.user : authService.loginWithRolePreset('admin').user;
const defaultToken: string | null = initialSession ? initialSession.token : (authService.getSession()?.token || null);

export const useAuthStore = create<AuthState>((set, get) => ({
  user: defaultUser,
  token: defaultToken,
  isAuthenticated: !!defaultUser,
  permissions: ROLE_PERMISSIONS[defaultRole] || ROLE_PERMISSIONS.guest,
  isAuthModalOpen: false,
  authModalDefaultTab: 'presets',
  requiredPermissionPrompt: null,

  loginWithPreset: (role: UserRole) => {
    const session = authService.loginWithRolePreset(role);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      permissions: ROLE_PERMISSIONS[role],
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  loginWithCredentials: async (email: string, password: string, preferredRole?: UserRole) => {
    const session = await authService.loginWithCredentials(email, password, preferredRole);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      permissions: ROLE_PERMISSIONS[session.user.role],
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  loginWithOAuth: async (provider: 'oauth2' | 'supabase', targetRole: UserRole = 'student') => {
    const session = await authService.loginWithOAuth(provider, targetRole);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      permissions: ROLE_PERMISSIONS[session.user.role],
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  switchRole: (role: UserRole) => {
    const session = authService.loginWithRolePreset(role);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      permissions: ROLE_PERMISSIONS[role],
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  logout: () => {
    authService.clearSession();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: ROLE_PERMISSIONS.guest,
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  openAuthModal: (tab = 'presets', requiredPermission = null) => {
    set({
      isAuthModalOpen: true,
      authModalDefaultTab: tab,
      requiredPermissionPrompt: requiredPermission
    });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      requiredPermissionPrompt: null
    });
  },

  hasPermission: (permission: keyof UserPermissions) => {
    const { user } = get();
    return authService.hasPermission(user, permission);
  }
}));
