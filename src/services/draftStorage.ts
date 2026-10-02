import { Topic } from '../types';

export interface EditorDraft {
  courseId: string;
  moduleId: string;
  topicId: string;
  topicData: {
    title: string;
    slug: string;
    readingTimeMinutes: number;
    summary: string;
    content: string;
    keyTakeaways: string[];
    quiz?: Topic['quiz'];
  };
  savedAt: number;
}

const DRAFT_STORAGE_PREFIX = 'luminary_draft_v1_';
const INDEXED_DB_NAME = 'LuminaryLMS_Drafts_DB';
const INDEXED_DB_STORE = 'topic_drafts';

// IndexedDB Helper with LocalStorage Fallback
class IndexedDBDraftStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        try {
          const request = window.indexedDB.open(INDEXED_DB_NAME, 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
              db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'key' });
            }
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } catch (e) {
          reject(e);
        }
      });
    }
    return this.dbPromise;
  }

  async save(key: string, draft: EditorDraft): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
        const store = tx.objectStore(INDEXED_DB_STORE);
        const req = store.put({ key, ...draft });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage
      try {
        localStorage.setItem(DRAFT_STORAGE_PREFIX + key, JSON.stringify(draft));
      } catch (e) {
        console.warn('LocalStorage draft fallback save failed:', e);
      }
    }
  }

  async get(key: string): Promise<EditorDraft | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(INDEXED_DB_STORE, 'readonly');
        const store = tx.objectStore(INDEXED_DB_STORE);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result) {
            const { key: _k, ...draft } = req.result;
            resolve(draft as EditorDraft);
          } else {
            resolve(this.getFromLocalStorage(key));
          }
        };
        req.onerror = () => resolve(this.getFromLocalStorage(key));
      });
    } catch {
      return this.getFromLocalStorage(key);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      new Promise<void>((resolve) => {
        const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
        const store = tx.objectStore(INDEXED_DB_STORE);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // Ignore
    }
    try {
      localStorage.removeItem(DRAFT_STORAGE_PREFIX + key);
    } catch {
      // Ignore
    }
  }

  private getFromLocalStorage(key: string): EditorDraft | null {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

const idbStore = new IndexedDBDraftStore();

export const draftStorageService = {
  buildKey(courseId: string, moduleId: string, topicId: string): string {
    return `${courseId}_${moduleId}_${topicId}`;
  },

  async saveDraft(draft: EditorDraft): Promise<void> {
    const key = this.buildKey(draft.courseId, draft.moduleId, draft.topicId);
    // Also synchronously write to localStorage for instant recovery
    try {
      localStorage.setItem(DRAFT_STORAGE_PREFIX + key, JSON.stringify(draft));
    } catch {
      // Ignore
    }
    await idbStore.save(key, draft);
  },

  async getDraft(courseId: string, moduleId: string, topicId: string): Promise<EditorDraft | null> {
    const key = this.buildKey(courseId, moduleId, topicId);
    // Try localStorage first for instant read, then fallback to IndexedDB
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_PREFIX + key);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return await idbStore.get(key);
  },

  getDraftSync(courseId: string, moduleId: string, topicId: string): EditorDraft | null {
    const key = this.buildKey(courseId, moduleId, topicId);
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async clearDraft(courseId: string, moduleId: string, topicId: string): Promise<void> {
    const key = this.buildKey(courseId, moduleId, topicId);
    try {
      localStorage.removeItem(DRAFT_STORAGE_PREFIX + key);
    } catch {
      // Ignore
    }
    await idbStore.delete(key);
  },

  hasNewerDraft(courseId: string, moduleId: string, topicId: string, savedTopicUpdatedAt: string): boolean {
    const draft = this.getDraftSync(courseId, moduleId, topicId);
    if (!draft) return false;
    const topicUpdatedTime = new Date(savedTopicUpdatedAt || 0).getTime();
    return draft.savedAt > topicUpdatedTime;
  }
};
