export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';

export type GradientTheme =
  | 'indigo-violet'
  | 'violet-fuchsia'
  | 'cyan-blue'
  | 'emerald-teal'
  | 'amber-orange'
  | 'rose-pink'
  | 'slate-zinc';

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'offline';

export interface EditorInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  readingTimeMinutes: number;
  order: number;
  isPublished: boolean;
  keyTakeaways?: string[];
  quiz?: QuizQuestion[];
  resources?: { title: string; url: string }[];
  updatedAt: string;
  // Optimistic locking & sync attributes
  version?: number;
  revisionHash?: string;
  lastEditedBy?: EditorInfo;
  syncStatus?: SyncStatus;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  topics: Topic[];
  version?: number;
  revisionHash?: string;
  lastEditedBy?: EditorInfo;
  syncStatus?: SyncStatus;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: DifficultyLevel;
  estimatedHours: number;
  author: string;
  theme: GradientTheme;
  iconName: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  version?: number;
  revisionHash?: string;
  lastEditedBy?: EditorInfo;
  syncStatus?: SyncStatus;
}

export interface UserProgress {
  completedTopicIds: string[];
  bookmarkedTopicIds: string[];
  topicNotes: Record<string, string>; // topicId -> note text
  quizResults: Record<string, { score: number; total: number; timestamp: string }>; // topicId -> score
  lastActiveTopicId?: string;
  lastActiveCourseId?: string;
}

export interface AdminUser {
  username: string;
  role: 'admin' | 'creator' | 'editor';
  token: string;
}

export interface CheatSheetItem {
  id: string;
  title: string;
  category: string;
  language: string;
  description: string;
  code: string;
  keyRule: string;
  tags: string[];
}

export type ViewMode = 'catalog' | 'reader' | 'admin' | 'certificate' | 'learning-hub' | 'reference';
