export type UserRole = 'admin' | 'instructor' | 'student' | 'guest';

export type AuthProvider = 'local' | 'jwt' | 'oauth2' | 'supabase';

export type SocialProvider = 'google' | 'github' | 'discord' | 'apple';

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  title?: string;
  organization?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface IdPConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isOAuthEnabled: boolean;
  providers: SocialProvider[];
}

export interface OAuthSession {
  accessToken: string;
  refreshToken?: string;
  provider: SocialProvider | AuthProvider;
  expiresIn?: number;
  user: AuthUser;
}

export interface UserPermissions {
  canEditCourse: boolean;
  canPublishCourse: boolean;
  canDeleteCourse: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canExportDatabase: boolean;
  canImportDatabase: boolean;
  canResetSystem: boolean;
  canTakeQuiz: boolean;
  canSubmitNotes: boolean;
  canBookmark: boolean;
  canAccessAdminStudio: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  provider: AuthProvider;
  title?: string;
  organization?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

export interface RolePreset {
  role: UserRole;
  label: string;
  description: string;
  badgeClass: string;
  demoUser: AuthUser;
}

export const ROLE_PRESETS: Record<UserRole, RolePreset> = {
  admin: {
    role: 'admin',
    label: 'Platform Admin',
    description: 'Full administrative rights: Course creation, catalog orchestration, system backups, and learner telemetry.',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    demoUser: {
      id: 'usr-admin-01',
      name: 'Elena Rostova',
      email: 'admin@luminary.internal',
      role: 'admin',
      provider: 'jwt',
      title: 'Chief Learning Architect',
      organization: 'Luminary Core Team',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      createdAt: '2025-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString()
    }
  },
  instructor: {
    role: 'instructor',
    label: 'Course Instructor',
    description: 'Curriculum author: Create & edit modules, design interactive quizzes, structure mindmaps, and monitor student metrics.',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    demoUser: {
      id: 'usr-inst-01',
      name: 'Marcus Vance',
      email: 'marcus.vance@luminary.internal',
      role: 'instructor',
      provider: 'jwt',
      title: 'Principal Systems Instructor',
      organization: 'Distributed Computing Guild',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      createdAt: '2025-02-15T00:00:00.000Z',
      lastLoginAt: new Date().toISOString()
    }
  },
  student: {
    role: 'student',
    label: 'Learner / Student',
    description: 'Active learner: Access reading canvas, earn mastery badges, track topic progress, take quizzes, and save private notes.',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    demoUser: {
      id: 'usr-stud-01',
      name: 'Aria Chen',
      email: 'aria.chen@university.edu',
      role: 'student',
      provider: 'jwt',
      title: 'Senior Engineering Student',
      organization: 'CS Honours Lab',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      createdAt: '2025-03-10T00:00:00.000Z',
      lastLoginAt: new Date().toISOString()
    }
  },
  guest: {
    role: 'guest',
    label: 'Guest Explorer',
    description: 'Anonymous visitor: Browse course catalog and public previews. Progress is stored temporarily in local memory.',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    demoUser: {
      id: 'usr-guest-01',
      name: 'Guest Explorer',
      email: 'guest@luminary.public',
      role: 'guest',
      provider: 'local',
      title: 'Public Viewer',
      organization: 'Open Web',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }
};
