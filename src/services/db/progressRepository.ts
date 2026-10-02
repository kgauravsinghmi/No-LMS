import { UserProgress } from '../../types';
import { dbClient } from './supabaseClient';

const STORAGE_KEYS = {
  PROGRESS: 'luminary_lms_progress_v1',
  PROGRESS_SYNC_QUEUE: 'luminary_lms_progress_queue_v1'
};

const DEFAULT_PROGRESS: UserProgress = {
  completedTopicIds: ['top-fs-101'],
  bookmarkedTopicIds: [],
  topicNotes: {},
  quizResults: {}
};

export class ProgressRepository {
  private memoryProgress: UserProgress | null = null;
  private isSyncing = false;

  constructor() {
    this.initLocalProgress();
  }

  private initLocalProgress(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (raw) {
        this.memoryProgress = JSON.parse(raw);
      } else {
        this.memoryProgress = DEFAULT_PROGRESS;
        this.persistLocal(DEFAULT_PROGRESS);
      }
    } catch {
      this.memoryProgress = DEFAULT_PROGRESS;
    }
  }

  private persistLocal(progress: UserProgress): void {
    this.memoryProgress = progress;
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      window.dispatchEvent(new Event('luminary_progress_updated'));
    } catch (e) {
      console.error('Failed to save progress locally', e);
    }
  }

  /**
   * Returns current user progress (cached locally for 0ms response)
   */
  public getProgress(): UserProgress {
    if (!this.memoryProgress) {
      this.initLocalProgress();
    }
    return this.memoryProgress || DEFAULT_PROGRESS;
  }

  /**
   * Saves progress both locally and remotely
   */
  public async saveProgress(progress: UserProgress, userId?: string): Promise<void> {
    this.persistLocal(progress);

    if (dbClient.isLiveDatabaseEnabled() && userId) {
      this.syncProgressToRemote(userId, progress).catch(err => {
        console.warn('Could not sync progress remotely, queued for retry:', err);
      });
    }
  }

  public toggleTopicCompleted(topicId: string, userId?: string): boolean {
    const current = this.getProgress();
    const isCompleted = current.completedTopicIds.includes(topicId);
    const updated: UserProgress = {
      ...current,
      completedTopicIds: isCompleted
        ? current.completedTopicIds.filter(id => id !== topicId)
        : [...current.completedTopicIds, topicId],
      lastActiveTopicId: topicId
    };

    this.saveProgress(updated, userId);
    return !isCompleted;
  }

  public toggleBookmark(topicId: string, userId?: string): boolean {
    const current = this.getProgress();
    const isBookmarked = current.bookmarkedTopicIds.includes(topicId);
    const updated: UserProgress = {
      ...current,
      bookmarkedTopicIds: isBookmarked
        ? current.bookmarkedTopicIds.filter(id => id !== topicId)
        : [...current.bookmarkedTopicIds, topicId]
    };

    this.saveProgress(updated, userId);
    return !isBookmarked;
  }

  public saveNote(topicId: string, noteText: string, userId?: string): void {
    const current = this.getProgress();
    const updated: UserProgress = {
      ...current,
      topicNotes: {
        ...current.topicNotes,
        [topicId]: noteText
      }
    };
    this.saveProgress(updated, userId);
  }

  public saveQuizResult(topicId: string, score: number, total: number, userId?: string): void {
    const current = this.getProgress();
    const updated: UserProgress = {
      ...current,
      quizResults: {
        ...current.quizResults,
        [topicId]: {
          score,
          total,
          timestamp: new Date().toISOString()
        }
      }
    };
    this.saveProgress(updated, userId);
  }

  /**
   * Syncs user progress to Supabase / REST table
   */
  private async syncProgressToRemote(userId: string, progress: UserProgress): Promise<void> {
    if (!dbClient.isLiveDatabaseEnabled() || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const { error } = await dbClient.restRequest('user_progress', {
        method: 'POST',
        body: {
          user_id: userId,
          progress_data: progress,
          updated_at: new Date().toISOString()
        },
        headers: {
          Prefer: 'resolution=merge-duplicates'
        }
      });

      if (error) throw error;
    } catch (err) {
      console.warn('Remote progress sync failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Hydrates progress from remote database for a given user
   */
  public async hydrateRemoteProgress(userId: string): Promise<UserProgress | null> {
    if (!dbClient.isLiveDatabaseEnabled() || !userId) return null;

    try {
      const { data, error } = await dbClient.restRequest<Array<{ progress_data: UserProgress }>>('user_progress', {
        method: 'GET',
        query: {
          user_id: `eq.${userId}`,
          select: 'progress_data'
        }
      });

      if (!error && data && data.length > 0 && data[0].progress_data) {
        const remoteProgress = data[0].progress_data;
        this.persistLocal(remoteProgress);
        return remoteProgress;
      }
    } catch (err) {
      console.warn('Failed to hydrate progress from remote:', err);
    }

    return null;
  }
}

export const progressRepository = new ProgressRepository();
