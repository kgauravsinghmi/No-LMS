import { AuthSession, AuthUser, ROLE_PRESETS, UserPermissions, UserRole, SignUpCredentials, SignInCredentials, SocialProvider } from '../types/auth';
import { idpService } from './auth/idpService';

const AUTH_STORAGE_KEY = 'luminary_auth_session_v1';

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canEditCourse: true,
    canPublishCourse: true,
    canDeleteCourse: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canExportDatabase: true,
    canImportDatabase: true,
    canResetSystem: true,
    canTakeQuiz: true,
    canSubmitNotes: true,
    canBookmark: true,
    canAccessAdminStudio: true
  },
  instructor: {
    canEditCourse: true,
    canPublishCourse: true,
    canDeleteCourse: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canExportDatabase: true,
    canImportDatabase: false,
    canResetSystem: false,
    canTakeQuiz: true,
    canSubmitNotes: true,
    canBookmark: true,
    canAccessAdminStudio: true
  },
  student: {
    canEditCourse: false,
    canPublishCourse: false,
    canDeleteCourse: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canExportDatabase: false,
    canImportDatabase: false,
    canResetSystem: false,
    canTakeQuiz: true,
    canSubmitNotes: true,
    canBookmark: true,
    canAccessAdminStudio: false
  },
  guest: {
    canEditCourse: false,
    canPublishCourse: false,
    canDeleteCourse: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canExportDatabase: false,
    canImportDatabase: false,
    canResetSystem: false,
    canTakeQuiz: true,
    canSubmitNotes: false,
    canBookmark: false,
    canAccessAdminStudio: false
  }
};

/**
 * Generates a mock signed JWT token with standard payload encoding.
 */
function createMockJwtToken(user: AuthUser, expiresInMs = 7 * 24 * 60 * 60 * 1000): { token: string; expiresAt: number } {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const expiresAt = Date.now() + expiresInMs;
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iss: 'luminary-lms-auth',
      exp: Math.floor(expiresAt / 1000)
    })
  );
  const signature = btoa(`sig_${user.id}_${expiresAt}`);
  return {
    token: `${header}.${payload}.${signature}`,
    expiresAt
  };
}

class AuthService {
  /**
   * Retrieves the current stored session if valid and not expired.
   */
  public getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Persists an authenticated session to storage.
   */
  public saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist auth session:', e);
    }
  }

  /**
   * Clears the current session.
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      idpService.signOut();
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  }

  /**
   * Checks if a user has a specific permission.
   */
  public hasPermission(user: AuthUser | null | undefined, permission: keyof UserPermissions): boolean {
    const role: UserRole = user?.role || 'guest';
    return !!ROLE_PERMISSIONS[role]?.[permission];
  }

  /**
   * Returns all active permissions for a given role.
   */
  public getPermissions(role: UserRole): UserPermissions {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest;
  }

  /**
   * Instant Login with standard pre-configured role presets (Admin, Instructor, Student, Guest).
   */
  public loginWithRolePreset(role: UserRole): AuthSession {
    const preset = ROLE_PRESETS[role];
    const user: AuthUser = {
      ...preset.demoUser,
      lastLoginAt: new Date().toISOString()
    };
    const { token, expiresAt } = createMockJwtToken(user);
    const session: AuthSession = { token, user, expiresAt };
    this.saveSession(session);
    return session;
  }

  /**
   * Real user sign-up via Identity Provider
   */
  public async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    const session = await idpService.signUp(credentials);
    this.saveSession(session);
    return session;
  }

  /**
   * Real user sign-in via Identity Provider
   */
  public async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    const session = await idpService.signIn(credentials);
    this.saveSession(session);
    return session;
  }

  /**
   * Standard Email & Password Authentication (Supports mock demo and enterprise SSO credentials).
   */
  public async loginWithCredentials(email: string, password?: string, preferredRole?: UserRole): Promise<AuthSession> {
    if (password && password.length >= 6) {
      try {
        return await this.signIn({ email, password });
      } catch {
        // Fallback to demo credential resolution
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    let role: UserRole = preferredRole || 'student';

    if (cleanEmail.includes('admin') || cleanEmail === 'admin@luminary.internal') {
      role = 'admin';
    } else if (cleanEmail.includes('instructor') || cleanEmail.includes('faculty') || cleanEmail === 'instructor@luminary.internal') {
      role = 'instructor';
    }

    const preset = ROLE_PRESETS[role];
    const user: AuthUser = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || preset.demoUser.name,
      email: cleanEmail,
      role,
      provider: 'jwt',
      title: role === 'admin' ? 'Administrator' : role === 'instructor' ? 'Curriculum Author' : 'Platform Learner',
      organization: 'Luminary Academy',
      avatarUrl: preset.demoUser.avatarUrl,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const { token, expiresAt } = createMockJwtToken(user);
    const session: AuthSession = { token, user, expiresAt };
    this.saveSession(session);
    return session;
  }

  /**
   * OAuth2 / Social / Supabase Sign-in Provider Integration
   */
  public async loginWithOAuth(provider: SocialProvider | 'oauth2' | 'supabase', targetRole: UserRole = 'student'): Promise<AuthSession> {
    if (provider === 'google' || provider === 'github' || provider === 'discord' || provider === 'apple') {
      const session = await idpService.signInWithOAuth(provider, targetRole);
      this.saveSession(session);
      return session;
    }

    const preset = ROLE_PRESETS[targetRole];
    const user: AuthUser = {
      ...preset.demoUser,
      id: `${provider}-usr-${Math.random().toString(36).substring(2, 8)}`,
      provider: provider === 'supabase' ? 'supabase' : 'oauth2',
      lastLoginAt: new Date().toISOString()
    };

    const { token, expiresAt } = createMockJwtToken(user);
    const session: AuthSession = { token, user, expiresAt };
    this.saveSession(session);
    return session;
  }
}

export const authService = new AuthService();
