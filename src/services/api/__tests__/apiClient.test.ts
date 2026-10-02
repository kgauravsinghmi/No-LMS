import { describe, it, expect, beforeEach } from 'vitest';
import { courseApi, apiServiceManager } from '../apiClient';
import { storageService } from '../../storage';

describe('courseApi & Pluggable Backend Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    // Ensure default local adapter mode
    apiServiceManager.configure({ mode: 'local', apiBaseUrl: '' });
  });

  describe('Local Adapter lifecycle through courseApi Proxy', () => {
    it('retrieves initial courses through courseApi', async () => {
      const courses = await courseApi.getCourses();
      expect(courses.length).toBeGreaterThan(0);
      expect(courses[0].id).toBeDefined();
    });

    it('creates and fetches course by id via proxy', async () => {
      const created = await courseApi.createCourse({
        title: 'Proxy Test Course',
        description: 'Testing proxy dispatch',
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Proxy Test Course');

      const fetched = await courseApi.getCourseById(created.id);
      expect(fetched?.title).toBe('Proxy Test Course');
    });

    it('updates course details', async () => {
      const created = await courseApi.createCourse({ title: 'Before' });
      const updated = await courseApi.updateCourse(created.id, { title: 'After' });

      expect(updated.title).toBe('After');
      const fetched = await courseApi.getCourseById(created.id);
      expect(fetched?.title).toBe('After');
    });

    it('deletes course cleanly', async () => {
      const created = await courseApi.createCourse({ title: 'To Delete' });
      const success = await courseApi.deleteCourse(created.id);
      expect(success).toBe(true);

      const fetched = await courseApi.getCourseById(created.id);
      expect(fetched).toBeNull();
    });

    it('handles module and topic additions', async () => {
      const courses = await courseApi.getCourses();
      const courseId = courses[0].id;

      const newModule = await courseApi.createModule(courseId, {
        title: 'New Architecture Module',
      });
      expect(newModule?.title).toBe('New Architecture Module');

      if (newModule) {
        const newTopic = await courseApi.createTopic(courseId, newModule.id, {
          title: 'New Topic Spec',
          content: '# New Topic Content',
        });
        expect(newTopic?.title).toBe('New Topic Spec');
      }
    });

    it('handles user progress tracking and optimistic operations', async () => {
      const initialProgress = await courseApi.getUserProgress();
      expect(initialProgress).toBeDefined();
      expect(Array.isArray(initialProgress.completedTopicIds)).toBe(true);

      // Toggle topic completion
      const testTopicId = 't-topic-1';
      const { isCompleted, progress } = await courseApi.toggleTopicCompleted(testTopicId);
      expect(isCompleted).toBe(true);
      expect(progress.completedTopicIds).toContain(testTopicId);

      // Toggle bookmark
      const bookmarkResult = await courseApi.toggleBookmark(testTopicId);
      expect(bookmarkResult.isBookmarked).toBe(true);
      expect(bookmarkResult.progress.bookmarkedTopicIds).toContain(testTopicId);

      // Save note
      const updatedWithNote = await courseApi.saveNote(testTopicId, 'Key study note');
      expect(updatedWithNote.topicNotes[testTopicId]).toBe('Key study note');

      // Save quiz result
      const quizProgress = await courseApi.saveQuizResult(testTopicId, 4, 5);
      expect(quizProgress.quizResults[testTopicId].score).toBe(4);
      expect(quizProgress.quizResults[testTopicId].total).toBe(5);
    });
  });

  describe('apiServiceManager runtime adapter configuration', () => {
    it('switches between adapters and preserves config', () => {
      expect(apiServiceManager.getConfig().mode).toBe('local');

      apiServiceManager.configure({ mode: 'rest', apiBaseUrl: 'https://api.luminary.internal' });
      expect(apiServiceManager.getConfig().mode).toBe('rest');
      expect(apiServiceManager.getConfig().apiBaseUrl).toBe('https://api.luminary.internal');

      // Switch back to local
      apiServiceManager.configure({ mode: 'local' });
      expect(apiServiceManager.getConfig().mode).toBe('local');
    });
  });
});
