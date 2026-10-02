import { describe, it, expect, beforeEach } from 'vitest';
import { idpService } from '../idpService';

describe('IdPService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Password Strength & Validation', () => {
    it('evaluates weak passwords correctly', () => {
      const weak = idpService.validatePasswordStrength('123');
      expect(weak.score).toBeLessThanOrEqual(1);
      expect(weak.isValid).toBe(false);
      expect(weak.feedback.length).toBeGreaterThan(0);
    });

    it('evaluates strong multi-entropy passwords correctly', () => {
      const strong = idpService.validatePasswordStrength('Luminary!2026Secure');
      expect(strong.score).toBeGreaterThanOrEqual(3);
      expect(strong.isValid).toBe(true);
      expect(strong.label === 'Strong' || strong.label === 'Excellent').toBe(true);
    });
  });

  describe('Email format validation', () => {
    it('validates standard email addresses', () => {
      expect(idpService.validateEmail('instructor@luminary.internal')).toBe(true);
      expect(idpService.validateEmail('learner.jane+ai@domain.co.uk')).toBe(true);
    });

    it('rejects malformed email addresses', () => {
      expect(idpService.validateEmail('plainaddress')).toBe(false);
      expect(idpService.validateEmail('@missingusername.com')).toBe(false);
      expect(idpService.validateEmail('user@.com')).toBe(false);
    });
  });

  describe('User Registration & Authentication Fallback', () => {
    it('registers a new user and generates a valid session with JWT', async () => {
      const session = await idpService.signUp({
        name: 'Elena Rostova',
        email: 'elena.rostova@luminary.internal',
        password: 'Password123!',
        role: 'instructor',
        title: 'Lead Architect'
      });

      expect(session).toBeDefined();
      expect(session.user.name).toBe('Elena Rostova');
      expect(session.user.email).toBe('elena.rostova@luminary.internal');
      expect(session.user.role).toBe('instructor');
      expect(session.token).toBeDefined();
      expect(session.token.split('.').length).toBe(3); // Standard 3-part JWT
    });

    it('authenticates an existing registered user with password', async () => {
      await idpService.signUp({
        name: 'Devon Miles',
        email: 'devon.miles@luminary.internal',
        password: 'Password123!',
        role: 'student'
      });

      const loginSession = await idpService.signIn({
        email: 'devon.miles@luminary.internal',
        password: 'Password123!'
      });

      expect(loginSession.user.email).toBe('devon.miles@luminary.internal');
      expect(loginSession.user.name).toBe('Devon Miles');
      expect(loginSession.token).toBeDefined();
    });

    it('authenticates via OAuth simulation', async () => {
      const githubSession = await idpService.signInWithOAuth('github', 'instructor');
      expect(githubSession.user.provider).toBe('oauth2');
      expect(githubSession.user.role).toBe('instructor');
      expect(githubSession.user.organization).toContain('GITHUB');
    });

    it('clears stored session upon signOut', async () => {
      await idpService.signIn({
        email: 'admin@luminary.internal',
        password: 'AdminPassword123!'
      });

      idpService.signOut();
      expect(localStorage.getItem('luminary_auth_session_v1')).toBeNull();
    });
  });
});
