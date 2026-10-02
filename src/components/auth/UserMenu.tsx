import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { ROLE_PRESETS, UserRole } from '../../types/auth';
import {
  Shield,
  GraduationCap,
  Sparkles,
  Globe,
  ChevronDown,
  LogOut,
  UserCheck,
  KeyRound,
  Check,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, switchRole, logout, openAuthModal, permissions } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRole = user?.role || 'guest';
  const rolePreset = ROLE_PRESETS[currentRole];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Badge Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer text-left group"
        title="Manage User & Roles"
      >
        {/* Avatar or Role Icon */}
        <div className="relative">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold ${rolePreset.badgeClass}`}
            >
              {currentRole === 'admin' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : currentRole === 'instructor' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : currentRole === 'student' ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
            </div>
          )}
          {/* Status Dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white dark:ring-slate-900 ${
              isAuthenticated ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
        </div>

        {/* User / Role info */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[110px]">
            {user?.name || 'Guest Explorer'}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              currentRole === 'admin'
                ? 'text-rose-600 dark:text-rose-400'
                : currentRole === 'instructor'
                ? 'text-indigo-600 dark:text-indigo-400'
                : currentRole === 'student'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            {currentRole}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Profile Header */}
          <div className="p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {user?.name || 'Guest Explorer'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${rolePreset.badgeClass}`}
              >
                {currentRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || 'Public explorer mode'}
            </p>
            {user?.organization && (
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {user.organization}
              </p>
            )}
          </div>

          {/* Quick Role Switcher */}
          <div className="py-2 px-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Switch Persona</span>
              <SlidersHorizontal className="w-3 h-3" />
            </div>

            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {(['admin', 'instructor', 'student', 'guest'] as UserRole[]).map((r) => {
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {r === 'admin' ? (
                        <Shield className="w-3 h-3 text-rose-500" />
                      ) : r === 'instructor' ? (
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                      ) : r === 'student' ? (
                        <GraduationCap className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Globe className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{r}</span>
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Privileges Quick Summary */}
          <div className="py-2 px-2.5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl my-1">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span>Privileges</span>
              <span>Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Course Authoring</span>
              <span className={permissions.canEditCourse ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                {permissions.canEditCourse ? 'Enabled' : 'Restricted'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Studio</span>
              <span className={permissions.canAccessAdminStudio ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                {permissions.canAccessAdminStudio ? 'Enabled' : 'Restricted'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Learner Telemetry</span>
              <span className={permissions.canViewAnalytics ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                {permissions.canViewAnalytics ? 'Enabled' : 'Restricted'}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openAuthModal('credentials');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>JWT & SSO Federation...</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset to Guest Session</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
