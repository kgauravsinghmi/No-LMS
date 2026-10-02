import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../storage';
import { INITIAL_COURSES } from '../../data/initialCourses';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Course management', () => {
    it('returns INITIAL_COURSES if storage is empty', () => {
      const courses = storageService.getCourses();
      expect(courses.length).toBe(INITIAL_COURSES.length);
      expect(courses[0].id).toBe(INITIAL_COURSES[0].id);
    });

    it('saves and retrieves updated courses', () => {
      const customCourse = {
        ...INITIAL_COURSES[0],
        id: 'test-course-id',
        title: 'Custom Test Course'
      };

      storageService.saveCourses([customCourse]);
      const retrieved = storageService.getCourses();

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].title).toBe('Custom Test Course');
    });

    it('creates a new course with default modules and topic template', () => {
      const created = storageService.createCourse({
        title: 'New Architecture Course',
        description: 'Deep dive into microservices'
      });

      expect(created.id).toContain('course-');
      expect(created.title).toBe('New Architecture Course');
      expect(created.modules.length).toBeGreaterThan(0);
      expect(storageService.getCourseById(created.id)).toBeDefined();
    });

    it('updates an existing course by id', () => {
      const created = storageService.createCourse({ title: 'Before Update' });
      storageService.updateCourse(created.id, { title: 'After Update' });

      const updated = storageService.getCourseById(created.id);
      expect(updated?.title).toBe('After Update');
    });

    it('deletes a course from storage', () => {
      const created = storageService.createCourse({ title: 'To Be Deleted' });
      expect(storageService.getCourseById(created.id)).toBeDefined();

      storageService.deleteCourse(created.id);
      expect(storageService.getCourseById(created.id)).toBeUndefined();
    });
  });

  describe('Module & Topic management', () => {
    it('creates and deletes modules in a course', () => {
      const course = storageService.createCourse({ title: 'Module Test Course' });
      const mod = storageService.createModule(course.id, { title: 'Advanced Patterns' });

      expect(mod).toBeDefined();
      expect(mod?.title).toBe('Advanced Patterns');

      let updatedCourse = storageService.getCourseById(course.id);
      expect(updatedCourse?.modules.some(m => m.id === mod?.id)).toBe(true);

      if (mod) {
        storageService.deleteModule(course.id, mod.id);
        updatedCourse = storageService.getCourseById(course.id);
        expect(updatedCourse?.modules.some(m => m.id === mod.id)).toBe(false);
      }
    });

    it('creates, updates, and deletes topics within a module', () => {
      const course = storageService.createCourse({ title: 'Topic Test Course' });
      const moduleId = course.modules[0].id;

      const topic = storageService.createTopic(course.id, moduleId, {
        title: 'Event Sourcing Basics',
        readingTimeMinutes: 7
      });

      expect(topic).toBeDefined();
      expect(topic?.title).toBe('Event Sourcing Basics');

      if (topic) {
        storageService.updateTopic(course.id, moduleId, topic.id, { readingTimeMinutes: 10 });
        let updatedCourse = storageService.getCourseById(course.id);
        let foundTopic = updatedCourse?.modules[0].topics.find(t => t.id === topic.id);
        expect(foundTopic?.readingTimeMinutes).toBe(10);

        storageService.deleteTopic(course.id, moduleId, topic.id);
        updatedCourse = storageService.getCourseById(course.id);
        foundTopic = updatedCourse?.modules[0].topics.find(t => t.id === topic.id);
        expect(foundTopic).toBeUndefined();
      }
    });
  });

  describe('User Progress & Gamification state', () => {
    it('toggles topic completed state accurately', () => {
      const topicId = 'sample-topic-123';
      const firstToggle = storageService.toggleTopicCompleted(topicId);
      expect(firstToggle).toBe(true);
      expect(storageService.getProgress().completedTopicIds).toContain(topicId);

      const secondToggle = storageService.toggleTopicCompleted(topicId);
      expect(secondToggle).toBe(false);
      expect(storageService.getProgress().completedTopicIds).not.toContain(topicId);
    });

    it('toggles topic bookmarks and persists notes', () => {
      const topicId = 'sample-topic-bookmark';
      storageService.toggleBookmark(topicId);
      expect(storageService.getProgress().bookmarkedTopicIds).toContain(topicId);

      storageService.saveNote(topicId, 'Study note regarding distributed locks.');
      expect(storageService.getProgress().topicNotes[topicId]).toBe('Study note regarding distributed locks.');
    });

    it('records quiz results with scores and timestamps', () => {
      const topicId = 'sample-quiz-topic';
      storageService.saveQuizResult(topicId, 9, 10);

      const progress = storageService.getProgress();
      expect(progress.quizResults[topicId].score).toBe(9);
      expect(progress.quizResults[topicId].total).toBe(10);
      expect(progress.quizResults[topicId].timestamp).toBeDefined();
    });
  });

  describe('Database Export & Import JSON', () => {
    it('exports database state and imports valid JSON correctly', () => {
      const exportedJson = storageService.exportDatabaseJSON();
      expect(typeof exportedJson).toBe('string');

      const parsed = JSON.parse(exportedJson);
      expect(parsed.version).toBe('1.0.0');
      expect(Array.isArray(parsed.courses)).toBe(true);

      const importResult = storageService.importDatabaseJSON(exportedJson);
      expect(importResult.success).toBe(true);
    });

    it('rejects invalid JSON during import', () => {
      const invalidJson = JSON.stringify({ invalid: true });
      const importResult = storageService.importDatabaseJSON(invalidJson);
      expect(importResult.success).toBe(false);
    });
  });
});
