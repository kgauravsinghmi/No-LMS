import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import { authService } from '../../services/authService';

describe('useAuthStore (Zustand Auth State)', () => {
  beforeEach(() => {
    localStorage.clear();
    authService.clearSession();
    useAuthStore.getState().logout();
  });

  it('initializes in guest mode after explicit logout', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.permissions.canEditCourse).toBe(false);
  });

  it('updates state when switching role with loginWithPreset / switchRole', () => {
    useAuthStore.getState().switchRole('student');
    let state = useAuthStore.getState();
    expect(state.user?.role).toBe('student');
    expect(state.isAuthenticated).toBe(true);
    expect(state.permissions.canTakeQuiz).toBe(true);
    expect(state.permissions.canEditCourse).toBe(false);

    useAuthStore.getState().switchRole('admin');
    state = useAuthStore.getState();
    expect(state.user?.role).toBe('admin');
    expect(state.permissions.canEditCourse).toBe(true);
    expect(state.permissions.canResetSystem).toBe(true);
  });

  it('manages modal visibility and required permission prompts', () => {
    useAuthStore.getState().openAuthModal('credentials', 'canEditCourse');
    let state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalDefaultTab).toBe('credentials');
    expect(state.requiredPermissionPrompt).toBe('canEditCourse');

    useAuthStore.getState().closeAuthModal();
    state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(false);
    expect(state.requiredPermissionPrompt).toBeNull();
  });

  it('verifies dynamic permissions with hasPermission helper', () => {
    useAuthStore.getState().switchRole('instructor');
    expect(useAuthStore.getState().hasPermission('canEditCourse')).toBe(true);
    expect(useAuthStore.getState().hasPermission('canDeleteCourse')).toBe(false);
  });
});
