import { Course, Module, Topic, SyncStatus } from '../../types';
import { INITIAL_COURSES } from '../../data/initialCourses';
import { dbClient } from './supabaseClient';

const STORAGE_KEYS = {
  COURSES_CACHE: 'luminary_lms_courses_v1',
  OFFLINE_QUEUE: 'luminary_lms_offline_queue_v1',
  LAST_SYNC: 'luminary_lms_last_sync_v1'
};

export interface OfflineMutation {
  id: string;
  type: 'upsert_course' | 'delete_course' | 'update_topic';
  payload: any;
  timestamp: string;
  retryCount: number;
}

export class CourseRepository {
  private memoryCache: Course[] | null = null;
  private isSyncing = false;

  constructor() {
    this.initLocalCache();
  }

  private initLocalCache(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSES_CACHE);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
      } else {
        this.memoryCache = INITIAL_COURSES;
        this.persistToCache(INITIAL_COURSES);
      }
    } catch (e) {
      console.warn('Failed to read courses cache from localStorage', e);
      this.memoryCache = INITIAL_COURSES;
    }
  }

  private persistToCache(courses: Course[]): void {
    this.memoryCache = courses;
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES_CACHE, JSON.stringify(courses));
      window.dispatchEvent(new Event('luminary_courses_updated'));
    } catch (e) {
      console.error('Failed to write courses to localStorage', e);
    }
  }

  /**
   * Retrieves all courses: returns cached data immediately, then triggers remote revalidation.
   */
  public async getCourses(options: { forceRemote?: boolean } = {}): Promise<Course[]> {
    if (this.memoryCache && !options.forceRemote) {
      // Trigger background sync if remote database is active
      if (dbClient.isLiveDatabaseEnabled()) {
        this.syncWithRemote().catch(err => console.warn('Background sync error:', err));
      }
      return [...this.memoryCache];
    }

    if (dbClient.isLiveDatabaseEnabled()) {
      const remoteCourses = await this.fetchRemoteCourses();
      if (remoteCourses && remoteCourses.length > 0) {
        this.persistToCache(remoteCourses);
        return remoteCourses;
      }
    }

    return this.memoryCache || INITIAL_COURSES;
  }

  public setLocalCourses(courses: Course[]): void {
    this.persistToCache(courses);
  }

  /**
   * Synchronous local getter for instant render
   */
  public getCoursesSync(): Course[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSES_CACHE);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
        return [...(this.memoryCache || INITIAL_COURSES)];
      }
    } catch {
      // fallback
    }
    this.memoryCache = INITIAL_COURSES;
    this.persistToCache(INITIAL_COURSES);
    return [...INITIAL_COURSES];
  }

  public getCourseById(courseId: string): Course | undefined {
    const courses = this.getCoursesSync();
    return courses.find(c => c.id === courseId || c.slug === courseId);
  }

  /**
   * Saves or updates a course with optimistic concurrency and offline fallback
   */
  public async saveCourse(course: Course): Promise<Course> {
    const currentCourses = this.getCoursesSync();
    const existingIndex = currentCourses.findIndex(c => c.id === course.id);

    const updatedCourse: Course = {
      ...course,
      version: (course.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      syncStatus: dbClient.isLiveDatabaseEnabled() ? 'pending' : 'synced'
    };

    let updatedList: Course[];
    if (existingIndex !== -1) {
      updatedList = [...currentCourses];
      updatedList[existingIndex] = updatedCourse;
    } else {
      updatedList = [updatedCourse, ...currentCourses];
    }

    // Save locally first
    this.persistToCache(updatedList);

    // Save remotely if live database is enabled
    if (dbClient.isLiveDatabaseEnabled()) {
      try {
        const { error } = await dbClient.restRequest('courses', {
          method: 'POST',
          body: {
            id: updatedCourse.id,
            slug: updatedCourse.slug,
            title: updatedCourse.title,
            data: updatedCourse,
            updated_at: updatedCourse.updatedAt,
            version: updatedCourse.version
          },
          headers: {
            Prefer: 'resolution=merge-duplicates'
          }
        });

        if (error) throw error;

        updatedCourse.syncStatus = 'synced';
        this.updateLocalCourseStatus(updatedCourse.id, 'synced');
      } catch (err) {
        console.warn('Remote course save failed, queuing offline mutation:', err);
        updatedCourse.syncStatus = 'offline';
        this.updateLocalCourseStatus(updatedCourse.id, 'offline');
        this.enqueueOfflineMutation({
          id: `mut-${Date.now()}`,
          type: 'upsert_course',
          payload: updatedCourse,
          timestamp: new Date().toISOString(),
          retryCount: 0
        });
      }
    }

    return updatedCourse;
  }

  /**
   * Deletes a course locally and remotely
   */
  public async deleteCourse(courseId: string): Promise<void> {
    const current = this.getCoursesSync();
    const filtered = current.filter(c => c.id !== courseId);
    this.persistToCache(filtered);

    if (dbClient.isLiveDatabaseEnabled()) {
      try {
        const { error } = await dbClient.restRequest(`courses?id=eq.${courseId}`, {
          method: 'DELETE'
        });
        if (error) throw error;
      } catch (err) {
        console.warn('Remote course delete failed, queuing offline mutation:', err);
        this.enqueueOfflineMutation({
          id: `mut-${Date.now()}`,
          type: 'delete_course',
          payload: { courseId },
          timestamp: new Date().toISOString(),
          retryCount: 0
        });
      }
    }
  }

  /**
   * Fetches courses from remote Supabase / REST table
   */
  private async fetchRemoteCourses(): Promise<Course[] | null> {
    const { data, error } = await dbClient.restRequest<Array<{ id: string; data: Course }>>('courses', {
      method: 'GET',
      query: { select: 'id,data,updated_at' }
    });

    if (error || !data) {
      return null;
    }

    return data.map(item => item.data);
  }

  /**
   * Synchronizes local cache with remote changes
   */
  public async syncWithRemote(): Promise<void> {
    if (this.isSyncing || !dbClient.isLiveDatabaseEnabled()) return;
    this.isSyncing = true;

    try {
      // Replay offline queue first
      await this.processOfflineQueue();

      // Fetch fresh remote courses
      const remote = await this.fetchRemoteCourses();
      if (remote && remote.length > 0) {
        this.persistToCache(remote);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
    } catch (e) {
      console.warn('Background course sync encountered an issue:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private updateLocalCourseStatus(courseId: string, status: SyncStatus): void {
    if (!this.memoryCache) return;
    const idx = this.memoryCache.findIndex(c => c.id === courseId);
    if (idx !== -1) {
      this.memoryCache[idx].syncStatus = status;
      this.persistToCache([...this.memoryCache]);
    }
  }

  // --- Offline Queue Handling ---
  private getOfflineQueue(): OfflineMutation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineQueue(queue: OfflineMutation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  private enqueueOfflineMutation(mutation: OfflineMutation): void {
    const queue = this.getOfflineQueue();
    queue.push(mutation);
    this.saveOfflineQueue(queue);
  }

  public async processOfflineQueue(): Promise<{ processed: number; failed: number }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    const remainingQueue: OfflineMutation[] = [];
    let processed = 0;
    let failed = 0;

    for (const mutation of queue) {
      try {
        if (mutation.type === 'upsert_course') {
          const course = mutation.payload as Course;
          const { error } = await dbClient.restRequest('courses', {
            method: 'POST',
            body: {
              id: course.id,
              slug: course.slug,
              title: course.title,
              data: course,
              updated_at: course.updatedAt,
              version: course.version
            },
            headers: { Prefer: 'resolution=merge-duplicates' }
          });
          if (error) throw error;
        } else if (mutation.type === 'delete_course') {
          const { error } = await dbClient.restRequest(`courses?id=eq.${mutation.payload.courseId}`, {
            method: 'DELETE'
          });
          if (error) throw error;
        }
        processed++;
      } catch (err) {
        failed++;
        if (mutation.retryCount < 5) {
          remainingQueue.push({ ...mutation, retryCount: mutation.retryCount + 1 });
        }
      }
    }

    this.saveOfflineQueue(remainingQueue);
    return { processed, failed };
  }
}

export const courseRepository = new CourseRepository();
