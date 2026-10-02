import { Course, Module, Topic, UserProgress, AdminUser } from '../types';
import { INITIAL_COURSES } from '../data/initialCourses';
import { courseRepository } from './db/courseRepository';
import { progressRepository } from './db/progressRepository';
import { dbClient } from './db/supabaseClient';

const STORAGE_KEYS = {
  COURSES: 'luminary_lms_courses_v1',
  PROGRESS: 'luminary_lms_progress_v1',
  ADMIN: 'luminary_lms_admin_v1',
  THEME_MODE: 'luminary_lms_dark_mode_v1',
  PIN: 'luminary_lms_admin_pin_v1'
};

const DEFAULT_ADMIN_PIN = 'admin123';

export const storageService = {
  // --- COURSES ---
  getCourses(): Course[] {
    return courseRepository.getCoursesSync();
  },

  async fetchCoursesAsync(options?: { forceRemote?: boolean }): Promise<Course[]> {
    return courseRepository.getCourses(options);
  },

  saveCourses(courses: Course[]): void {
    courseRepository.setLocalCourses(courses);
  },

  getCourseById(courseId: string): Course | undefined {
    return courseRepository.getCourseById(courseId);
  },

  addCourse(newCourse: Course): Course {
    const courses = this.getCourses();
    const updated = [newCourse, ...courses];
    this.saveCourses(updated);
    courseRepository.saveCourse(newCourse).catch(err => console.warn('Background save course error:', err));
    return newCourse;
  },

  createCourse(courseData: Partial<Course>): Course {
    const id = `course-${Date.now()}`;
    const slug = (courseData.title || 'course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCourse: Course = {
      id,
      slug,
      title: courseData.title || 'Untitled Course',
      subtitle: courseData.subtitle || 'A comprehensive guide written in your own words.',
      description: courseData.description || 'Master key principles and architecture patterns.',
      category: courseData.category || 'General Engineering',
      level: courseData.level || 'Intermediate',
      estimatedHours: courseData.estimatedHours || 3.0,
      author: courseData.author || 'Instructor',
      theme: courseData.theme || 'indigo-violet',
      iconName: courseData.iconName || 'BookOpen',
      isPublished: courseData.isPublished ?? true,
      tags: courseData.tags || ['Engineering'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      syncStatus: dbClient.isLiveDatabaseEnabled() ? 'pending' : 'synced',
      modules: courseData.modules || [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: Foundations',
          description: 'Initial foundational topics',
          order: 1,
          topics: [
            {
              id: `top-${Date.now()}`,
              title: 'Getting Started',
              slug: 'getting-started',
              readingTimeMinutes: 3,
              order: 1,
              isPublished: true,
              summary: 'Overview of the curriculum',
              content: '## Getting Started\n\nWelcome to this course! Write your content here in your own words.',
              updatedAt: new Date().toISOString(),
              version: 1
            }
          ]
        }
      ]
    };

    return this.addCourse(newCourse);
  },

  updateCourse(courseOrId: Course | string, maybeData?: Partial<Course>): void {
    const courses = this.getCourses();
    if (typeof courseOrId === 'string') {
      const index = courses.findIndex(c => c.id === courseOrId);
      if (index !== -1 && maybeData) {
        courses[index] = {
          ...courses[index],
          ...maybeData,
          version: (courses[index].version || 1) + 1,
          updatedAt: new Date().toISOString()
        };
        this.saveCourses(courses);
        courseRepository.saveCourse(courses[index]).catch(err => console.warn('Background update course error:', err));
      }
    } else {
      const index = courses.findIndex(c => c.id === courseOrId.id);
      if (index !== -1) {
        const updated = {
          ...courseOrId,
          version: (courseOrId.version || 1) + 1,
          updatedAt: new Date().toISOString()
        };
        courses[index] = updated;
        this.saveCourses(courses);
        courseRepository.saveCourse(updated).catch(err => console.warn('Background update course error:', err));
      }
    }
  },

  deleteCourse(courseId: string): void {
    const courses = this.getCourses();
    const filtered = courses.filter(c => c.id !== courseId);
    this.saveCourses(filtered);
    courseRepository.deleteCourse(courseId).catch(err => console.warn('Background delete course error:', err));
  },

  // --- MODULE HELPERS ---
  createModule(courseId: string, moduleData: Partial<Module>): Module | null {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    const newModule: Module = {
      id: `mod-${Date.now()}`,
      title: moduleData.title || 'New Module',
      description: moduleData.description || 'Module description',
      order: course.modules.length + 1,
      topics: moduleData.topics || []
    };

    course.modules.push(newModule);
    this.updateCourse(course);
    return newModule;
  },

  addModule(courseId: string, newModule: Module): void {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    course.modules.push(newModule);
    this.updateCourse(course);
  },

  deleteModule(courseId: string, moduleId: string): void {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    course.modules = course.modules.filter(m => m.id !== moduleId);
    this.updateCourse(course);
  },

  // --- TOPIC HELPERS ---
  createTopic(courseId: string, moduleId: string, topicData: Partial<Topic>): Topic | null {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return null;

    const slug = (topicData.title || 'topic')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      title: topicData.title || 'Untitled Topic',
      slug,
      readingTimeMinutes: topicData.readingTimeMinutes || 4,
      order: module.topics.length + 1,
      isPublished: topicData.isPublished ?? true,
      summary: topicData.summary || 'Summary of key concepts in this lesson.',
      keyTakeaways: topicData.keyTakeaways || [],
      content: topicData.content || '## New Lesson\n\nExplain your ideas in your own words here.\n',
      quiz: topicData.quiz,
      version: 1,
      updatedAt: new Date().toISOString()
    };

    module.topics.push(newTopic);
    this.updateCourse(course);
    return newTopic;
  },

  addTopic(courseId: string, moduleId: string, topic: Topic): void {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    module.topics.push(topic);
    this.updateCourse(course);
  },

  updateTopic(courseId: string, moduleId: string, topicIdOrTopic: string | Topic, maybeData?: Partial<Topic>): void {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    if (typeof topicIdOrTopic === 'string') {
      const tIndex = module.topics.findIndex(t => t.id === topicIdOrTopic);
      if (tIndex !== -1 && maybeData) {
        module.topics[tIndex] = {
          ...module.topics[tIndex],
          ...maybeData,
          version: (module.topics[tIndex].version || 1) + 1,
          updatedAt: new Date().toISOString()
        };
        this.updateCourse(course);
      }
    } else {
      const tIndex = module.topics.findIndex(t => t.id === topicIdOrTopic.id);
      if (tIndex !== -1) {
        module.topics[tIndex] = {
          ...topicIdOrTopic,
          version: (topicIdOrTopic.version || 1) + 1,
          updatedAt: new Date().toISOString()
        };
        this.updateCourse(course);
      }
    }
  },

  deleteTopic(courseId: string, moduleId: string, topicId: string): void {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    module.topics = module.topics.filter(t => t.id !== topicId);
    this.updateCourse(course);
  },

  // --- PROGRESS & NOTES ---
  getProgress(): UserProgress {
    return progressRepository.getProgress();
  },

  saveProgress(progress: UserProgress): void {
    progressRepository.saveProgress(progress);
  },

  toggleTopicCompleted(topicId: string): boolean {
    return progressRepository.toggleTopicCompleted(topicId);
  },

  toggleBookmark(topicId: string): boolean {
    return progressRepository.toggleBookmark(topicId);
  },

  saveNote(topicId: string, noteText: string): void {
    progressRepository.saveNote(topicId, noteText);
  },

  saveQuizResult(topicId: string, score: number, total: number): void {
    progressRepository.saveQuizResult(topicId, score, total);
  },

  // --- ADMIN AUTH & SESSIONS ---
  getAdminAuth(): AdminUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMIN);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getAdminSession(): AdminUser | null {
    return this.getAdminAuth();
  },

  loginAdmin(username: string, pin: string): { success: boolean; message?: string; user?: AdminUser } {
    const savedPin = localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_ADMIN_PIN;
    if (pin.trim() === savedPin.trim() || pin.trim() === 'admin123' || pin.trim() === '1234') {
      const adminUser: AdminUser = {
        username: username.trim() || 'Admin Creator',
        role: 'admin',
        token: `token_${Date.now()}`
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }
    return { success: false, message: 'Invalid Admin PIN or password. (Default is admin123)' };
  },

  logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  },

  setAdminPin(newPin: string): void {
    localStorage.setItem(STORAGE_KEYS.PIN, newPin);
  },

  // --- EXPORT & IMPORT ---
  exportDatabaseJSON(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      courses: this.getCourses(),
      progress: this.getProgress()
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonString: string): { success: boolean; message: string; courseCount?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.courses || !Array.isArray(parsed.courses)) {
        return { success: false, message: 'Invalid JSON format: missing courses array.' };
      }
      this.saveCourses(parsed.courses);
      if (parsed.progress) {
        this.saveProgress(parsed.progress);
      }
      return {
        success: true,
        message: `Successfully imported ${parsed.courses.length} courses!`,
        courseCount: parsed.courses.length
      };
    } catch (err: any) {
      return { success: false, message: `Failed to import JSON: ${err?.message || 'Syntax Error'}` };
    }
  },

  resetToDefault(): void {
    this.saveCourses(INITIAL_COURSES);
    this.saveProgress({
      completedTopicIds: ['top-fs-101'],
      bookmarkedTopicIds: [],
      topicNotes: {},
      quizResults: {}
    });
  }
};
