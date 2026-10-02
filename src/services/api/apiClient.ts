import { Course, Module, Topic, UserProgress, AdminUser } from '../../types';
import { ICourseApiService, BackendConfig } from './types';
import { storageService } from '../storage';

class LocalAdapter implements ICourseApiService {
  private simulateLatency(ms: number = 0): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCourses(): Promise<Course[]> {
    await this.simulateLatency();
    return storageService.getCourses();
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    await this.simulateLatency();
    const course = storageService.getCourseById(courseId);
    return course || null;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    await this.simulateLatency();
    return storageService.createCourse(courseData);
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    await this.simulateLatency();
    storageService.updateCourse(courseId, courseData);
    const updated = storageService.getCourseById(courseId);
    if (!updated) throw new Error(`Course ${courseId} not found`);
    return updated;
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    await this.simulateLatency();
    storageService.deleteCourse(courseId);
    return true;
  }

  async createModule(courseId: string, moduleData: Partial<Module>): Promise<Module | null> {
    await this.simulateLatency();
    return storageService.createModule(courseId, moduleData);
  }

  async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
    await this.simulateLatency();
    storageService.deleteModule(courseId, moduleId);
    return true;
  }

  async createTopic(courseId: string, moduleId: string, topicData: Partial<Topic>): Promise<Topic | null> {
    await this.simulateLatency();
    return storageService.createTopic(courseId, moduleId, topicData);
  }

  async updateTopic(courseId: string, moduleId: string, topicId: string, topicData: Partial<Topic>): Promise<Topic | null> {
    await this.simulateLatency();
    storageService.updateTopic(courseId, moduleId, topicId, topicData);
    const course = storageService.getCourseById(courseId);
    const mod = course?.modules.find(m => m.id === moduleId);
    return mod?.topics.find(t => t.id === topicId) || null;
  }

  async deleteTopic(courseId: string, moduleId: string, topicId: string): Promise<boolean> {
    await this.simulateLatency();
    storageService.deleteTopic(courseId, moduleId, topicId);
    return true;
  }

  async getUserProgress(): Promise<UserProgress> {
    await this.simulateLatency();
    return storageService.getProgress();
  }

  async saveUserProgress(progress: UserProgress): Promise<UserProgress> {
    await this.simulateLatency();
    storageService.saveProgress(progress);
    return progress;
  }

  async toggleTopicCompleted(topicId: string): Promise<{ isCompleted: boolean; progress: UserProgress }> {
    await this.simulateLatency();
    const isCompleted = storageService.toggleTopicCompleted(topicId);
    const progress = storageService.getProgress();
    return { isCompleted, progress };
  }

  async toggleBookmark(topicId: string): Promise<{ isBookmarked: boolean; progress: UserProgress }> {
    await this.simulateLatency();
    const isBookmarked = storageService.toggleBookmark(topicId);
    const progress = storageService.getProgress();
    return { isBookmarked, progress };
  }

  async saveNote(topicId: string, noteText: string): Promise<UserProgress> {
    await this.simulateLatency();
    storageService.saveNote(topicId, noteText);
    return storageService.getProgress();
  }

  async saveQuizResult(topicId: string, score: number, total: number): Promise<UserProgress> {
    await this.simulateLatency();
    storageService.saveQuizResult(topicId, score, total);
    return storageService.getProgress();
  }

  async loginAdmin(username: string, pin: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    await this.simulateLatency();
    return storageService.loginAdmin(username, pin);
  }

  async getAdminSession(): Promise<AdminUser | null> {
    return storageService.getAdminSession();
  }

  async logoutAdmin(): Promise<void> {
    storageService.logoutAdmin();
  }

  async exportDatabase(): Promise<string> {
    return storageService.exportDatabaseJSON();
  }

  async importDatabase(jsonString: string): Promise<{ success: boolean; message: string; courseCount?: number }> {
    return storageService.importDatabaseJSON(jsonString);
  }

  async resetToDefault(): Promise<void> {
    storageService.resetToDefault();
  }
}

class RestApiAdapter implements ICourseApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const adminSession = storageService.getAdminSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (adminSession?.token) {
      headers['Authorization'] = `Bearer ${adminSession.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }

  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/api/courses');
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    return this.request<Course | null>(`/api/courses/${courseId}`);
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    return this.request<Course>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    return this.request<Course>(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    await this.request<{ success: boolean }>(`/api/courses/${courseId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async createModule(courseId: string, moduleData: Partial<Module>): Promise<Module | null> {
    return this.request<Module>(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
    await this.request<{ success: boolean }>(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async createTopic(courseId: string, moduleId: string, topicData: Partial<Topic>): Promise<Topic | null> {
    return this.request<Topic>(`/api/courses/${courseId}/modules/${moduleId}/topics`, {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async updateTopic(courseId: string, moduleId: string, topicId: string, topicData: Partial<Topic>): Promise<Topic | null> {
    return this.request<Topic>(`/api/courses/${courseId}/modules/${moduleId}/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
  }

  async deleteTopic(courseId: string, moduleId: string, topicId: string): Promise<boolean> {
    await this.request<{ success: boolean }>(`/api/courses/${courseId}/modules/${moduleId}/topics/${topicId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async getUserProgress(): Promise<UserProgress> {
    return this.request<UserProgress>('/api/progress');
  }

  async saveUserProgress(progress: UserProgress): Promise<UserProgress> {
    return this.request<UserProgress>('/api/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  async toggleTopicCompleted(topicId: string): Promise<{ isCompleted: boolean; progress: UserProgress }> {
    return this.request<{ isCompleted: boolean; progress: UserProgress }>(`/api/progress/toggle-topic`, {
      method: 'POST',
      body: JSON.stringify({ topicId }),
    });
  }

  async toggleBookmark(topicId: string): Promise<{ isBookmarked: boolean; progress: UserProgress }> {
    return this.request<{ isBookmarked: boolean; progress: UserProgress }>(`/api/progress/toggle-bookmark`, {
      method: 'POST',
      body: JSON.stringify({ topicId }),
    });
  }

  async saveNote(topicId: string, noteText: string): Promise<UserProgress> {
    return this.request<UserProgress>(`/api/progress/note`, {
      method: 'POST',
      body: JSON.stringify({ topicId, noteText }),
    });
  }

  async saveQuizResult(topicId: string, score: number, total: number): Promise<UserProgress> {
    return this.request<UserProgress>(`/api/progress/quiz`, {
      method: 'POST',
      body: JSON.stringify({ topicId, score, total }),
    });
  }

  async loginAdmin(username: string, pin: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    return this.request<{ success: boolean; user?: AdminUser; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, pin }),
    });
  }

  async getAdminSession(): Promise<AdminUser | null> {
    return storageService.getAdminSession();
  }

  async logoutAdmin(): Promise<void> {
    storageService.logoutAdmin();
  }

  async exportDatabase(): Promise<string> {
    const data = await this.request<any>('/api/database/export');
    return JSON.stringify(data, null, 2);
  }

  async importDatabase(jsonString: string): Promise<{ success: boolean; message: string; courseCount?: number }> {
    return this.request<{ success: boolean; message: string; courseCount?: number }>('/api/database/import', {
      method: 'POST',
      body: jsonString,
    });
  }

  async resetToDefault(): Promise<void> {
    await this.request('/api/database/reset', { method: 'POST' });
  }
}

class ApiServiceManager {
  private currentAdapter: ICourseApiService;
  private config: BackendConfig;

  constructor() {
    // Check environment variables
    const apiBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL;
    const mode = (apiBaseUrl ? 'rest' : 'local') as BackendConfig['mode'];

    this.config = {
      mode,
      apiBaseUrl: apiBaseUrl || '',
    };

    if (mode === 'rest' && apiBaseUrl) {
      this.currentAdapter = new RestApiAdapter(apiBaseUrl);
    } else {
      this.currentAdapter = new LocalAdapter();
    }
  }

  getAdapter(): ICourseApiService {
    return this.currentAdapter;
  }

  configure(config: Partial<BackendConfig>) {
    this.config = { ...this.config, ...config };
    if (this.config.mode === 'rest' && this.config.apiBaseUrl) {
      this.currentAdapter = new RestApiAdapter(this.config.apiBaseUrl);
    } else {
      this.currentAdapter = new LocalAdapter();
    }
  }

  getConfig(): BackendConfig {
    return { ...this.config };
  }
}

export const apiServiceManager = new ApiServiceManager();
export const courseApi: ICourseApiService = new Proxy({} as ICourseApiService, {
  get(_target, prop: keyof ICourseApiService) {
    const adapter = apiServiceManager.getAdapter();
    const value = adapter[prop];
    return typeof value === 'function' ? value.bind(adapter) : value;
  },
});
