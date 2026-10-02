import { describe, it, expect, beforeEach } from 'vitest';
import { authService, ROLE_PERMISSIONS } from '../authService';
import { UserRole } from '../../types/auth';

describe('AuthService & RBAC Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Role-Based Permission Matrix (ROLE_PERMISSIONS)', () => {
    it('grants full administrative rights to admin role', () => {
      const adminPerms = ROLE_PERMISSIONS.admin;
      expect(adminPerms.canEditCourse).toBe(true);
      expect(adminPerms.canPublishCourse).toBe(true);
      expect(adminPerms.canDeleteCourse).toBe(true);
      expect(adminPerms.canManageUsers).toBe(true);
      expect(adminPerms.canResetSystem).toBe(true);
      expect(adminPerms.canAccessAdminStudio).toBe(true);
    });

    it('grants authoring rights to instructor without destructive system rights', () => {
      const instructorPerms = ROLE_PERMISSIONS.instructor;
      expect(instructorPerms.canEditCourse).toBe(true);
      expect(instructorPerms.canPublishCourse).toBe(true);
      expect(instructorPerms.canAccessAdminStudio).toBe(true);
      expect(instructorPerms.canDeleteCourse).toBe(false);
      expect(instructorPerms.canManageUsers).toBe(false);
      expect(instructorPerms.canResetSystem).toBe(false);
    });

    it('restricts student to learning canvas and quiz taking', () => {
      const studentPerms = ROLE_PERMISSIONS.student;
      expect(studentPerms.canTakeQuiz).toBe(true);
      expect(studentPerms.canSubmitNotes).toBe(true);
      expect(studentPerms.canBookmark).toBe(true);
      expect(studentPerms.canEditCourse).toBe(false);
      expect(studentPerms.canAccessAdminStudio).toBe(false);
      expect(studentPerms.canManageUsers).toBe(false);
    });

    it('limits guest to read-only course browsing and quiz taking', () => {
      const guestPerms = ROLE_PERMISSIONS.guest;
      expect(guestPerms.canTakeQuiz).toBe(true);
      expect(guestPerms.canSubmitNotes).toBe(false);
      expect(guestPerms.canBookmark).toBe(false);
      expect(guestPerms.canEditCourse).toBe(false);
      expect(guestPerms.canAccessAdminStudio).toBe(false);
    });
  });

  describe('Session Management & Role Presets', () => {
    it('creates and persists a valid JWT session for role preset', () => {
      const session = authService.loginWithRolePreset('instructor');
      expect(session.user.role).toBe('instructor');
      expect(session.token).toBeDefined();
      expect(session.token.split('.').length).toBe(3); // Standard header.payload.signature format
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      const retrieved = authService.getSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.user.email).toBe(session.user.email);
      expect(retrieved?.user.role).toBe('instructor');
    });

    it('clears session upon logout', () => {
      authService.loginWithRolePreset('admin');
      expect(authService.getSession()).not.toBeNull();

      authService.clearSession();
      expect(authService.getSession()).toBeNull();
    });

    it('evaluates permissions dynamically with hasPermission', () => {
      const instructorSession = authService.loginWithRolePreset('instructor');
      expect(authService.hasPermission(instructorSession.user, 'canEditCourse')).toBe(true);
      expect(authService.hasPermission(instructorSession.user, 'canDeleteCourse')).toBe(false);
      expect(authService.hasPermission(null, 'canEditCourse')).toBe(false);
    });
  });

  describe('Credential and OAuth Login', () => {
    it('authenticates with credentials and automatically resolves admin/instructor roles from domain', async () => {
      const session = await authService.loginWithCredentials('admin@luminary.internal', 'securePass123');
      expect(session.user.role).toBe('admin');
      expect(session.user.email).toBe('admin@luminary.internal');
      expect(session.token).toBeDefined();
    });

    it('authenticates with OAuth provider and target role', async () => {
      const session = await authService.loginWithOAuth('supabase', 'instructor');
      expect(session.user.provider).toBe('supabase');
      expect(session.user.role).toBe('instructor');
      expect(session.token).toBeDefined();
    });
  });
});
