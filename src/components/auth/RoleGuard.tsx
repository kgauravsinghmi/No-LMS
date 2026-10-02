import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserPermissions, UserRole } from '../../types/auth';
import { ShieldAlert, ArrowRight, Lock, KeyRound } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: keyof UserPermissions;
  fallback?: React.ReactNode;
  silent?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  silent = false
}) => {
  const { user, permissions, openAuthModal } = useAuthStore();

  const isAllowedByRole = React.useMemo(() => {
    if (!requiredRole) return true;
    const currentRole = user?.role || 'guest';
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentRole);
    }
    return currentRole === requiredRole;
  }, [user?.role, requiredRole]);

  const isAllowedByPermission = React.useMemo(() => {
    if (!requiredPermission) return true;
    return !!permissions[requiredPermission];
  }, [permissions, requiredPermission]);

  const isAuthorized = isAllowedByRole && isAllowedByPermission;

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (silent) {
    return null;
  }

  // Friendly, polished RBAC elevation & security barrier
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-3">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Elevated Role Required</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">
        Access Restricted
      </h2>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
        This section requires{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-200">
          {requiredRole ? (Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole) : 'Admin / Instructor'}
        </span>{' '}
        privileges. Current active role:{' '}
        <span className="inline-block font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
          {user?.role || 'Guest'}
        </span>
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => openAuthModal('presets', requiredPermission)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Switch Role / Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
