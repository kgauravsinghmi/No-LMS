import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { ROLE_PRESETS, UserRole } from '../../types/auth';
import {
  X,
  Shield,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  Users,
  Globe,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalDefaultTab,
    closeAuthModal,
    user,
    loginWithPreset,
    loginWithCredentials,
    loginWithOAuth,
    requiredPermissionPrompt
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'presets' | 'credentials' | 'sso'>(authModalDefaultTab || 'presets');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync tab on open
  React.useEffect(() => {
    if (authModalDefaultTab) {
      setActiveTab(authModalDefaultTab);
    }
  }, [authModalDefaultTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handlePresetSelect = (role: UserRole) => {
    loginWithPreset(role);
    setSuccessNotice(`Switched to ${ROLE_PRESETS[role].label} profile`);
    setTimeout(() => {
      setSuccessNotice(null);
      closeAuthModal();
    }, 600);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await loginWithCredentials(email, password, selectedRole);
      setSuccessNotice(`Signed in successfully as ${email}`);
      setTimeout(() => {
        setSuccessNotice(null);
        closeAuthModal();
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'oauth2' | 'supabase', role: UserRole) => {
    setIsLoading(true);
    try {
      await loginWithOAuth(provider, role);
      setSuccessNotice(`Authenticated via ${provider === 'supabase' ? 'Supabase Auth' : 'OAuth2 Enterprise SSO'}`);
      setTimeout(() => {
        setSuccessNotice(null);
        closeAuthModal();
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Authentication & Access Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch user persona or sign in with enterprise credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Elevation alert if triggered by an action requiring permission */}
        {requiredPermissionPrompt && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Action requires <strong>{requiredPermissionPrompt}</strong> permission. Switch to <strong>Admin</strong> or <strong>Instructor</strong> below.
            </span>
          </div>
        )}

        {/* Success toast overlay */}
        {successNotice && (
          <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/40 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role Switcher (1-Click)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>JWT / Email Sign-In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sso')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sso'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SSO & Supabase</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: ROLE PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Select an active persona to experience role-specific privileges, authoring studio routes, and learner views:
              </p>

              {(Object.keys(ROLE_PRESETS) as UserRole[]).map((roleKey) => {
                const preset = ROLE_PRESETS[roleKey];
                const isActive = user?.role === roleKey;

                return (
                  <div
                    key={roleKey}
                    onClick={() => handlePresetSelect(roleKey)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${preset.badgeClass}`}
                      >
                        {roleKey === 'admin' ? (
                          <Shield className="w-5 h-5" />
                        ) : roleKey === 'instructor' ? (
                          <Sparkles className="w-5 h-5" />
                        ) : roleKey === 'student' ? (
                          <GraduationCap className="w-5 h-5" />
                        ) : (
                          <Globe className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {preset.label}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${preset.badgeClass}`}
                          >
                            {roleKey}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {preset.description}
                        </p>
                        <div className="text-[11px] font-mono text-slate-400">
                          {preset.demoUser.name} &bull; {preset.demoUser.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive ? 'Current' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CREDENTIALS SIGN-IN */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@luminary.internal or your email..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requested Role Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'instructor', 'student'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center capitalize ${
                        selectedRole === r
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with JWT Token'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SSO & SUPABASE AUTH */}
          {activeTab === 'sso' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect using external identity providers with JWT session federation:
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('supabase', 'instructor')}
                  disabled={isLoading}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Supabase Authentication
                      </div>
                      <div className="text-[11px] text-slate-400">
                        PostgreSQL Row Level Security (RLS) & Auth
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('oauth2', 'admin')}
                  disabled={isLoading}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                      🔒
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        OAuth 2.0 / OpenID Connect
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Enterprise Okta, Keycloak, or GitHub SAML SSO
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Role-Based Access Control (RBAC) Active</span>
          </span>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
