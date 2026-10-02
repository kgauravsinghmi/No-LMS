import { Course, Module, Topic, UserProgress, AdminUser } from '../../types';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface BackendConfig {
  mode: 'local' | 'rest' | 'supabase';
  apiBaseUrl?: string;
  authToken?: string;
  simulateLatencyMs?: number;
}

export interface ICourseApiService {
  // Course Lifecycle
  getCourses(): Promise<Course[]>;
  getCourseById(courseId: string): Promise<Course | null>;
  createCourse(courseData: Partial<Course>): Promise<Course>;
  updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course>;
  deleteCourse(courseId: string): Promise<boolean>;

  // Module Lifecycle
  createModule(courseId: string, moduleData: Partial<Module>): Promise<Module | null>;
  deleteModule(courseId: string, moduleId: string): Promise<boolean>;

  // Topic Lifecycle
  createTopic(courseId: string, moduleId: string, topicData: Partial<Topic>): Promise<Topic | null>;
  updateTopic(courseId: string, moduleId: string, topicId: string, topicData: Partial<Topic>): Promise<Topic | null>;
  deleteTopic(courseId: string, moduleId: string, topicId: string): Promise<boolean>;

  // User Progress & Engagement
  getUserProgress(): Promise<UserProgress>;
  saveUserProgress(progress: UserProgress): Promise<UserProgress>;
  toggleTopicCompleted(topicId: string): Promise<{ isCompleted: boolean; progress: UserProgress }>;
  toggleBookmark(topicId: string): Promise<{ isBookmarked: boolean; progress: UserProgress }>;
  saveNote(topicId: string, noteText: string): Promise<UserProgress>;
  saveQuizResult(topicId: string, score: number, total: number): Promise<UserProgress>;

  // Auth & Admin
  loginAdmin(username: string, pin: string): Promise<{ success: boolean; user?: AdminUser; message?: string }>;
  getAdminSession(): Promise<AdminUser | null>;
  logoutAdmin(): Promise<void>;

  // Export / Import
  exportDatabase(): Promise<string>;
  importDatabase(jsonString: string): Promise<{ success: boolean; message: string; courseCount?: number }>;
  resetToDefault(): Promise<void>;
}
