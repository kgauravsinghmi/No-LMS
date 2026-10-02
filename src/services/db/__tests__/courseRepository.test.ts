import { describe, it, expect, beforeEach } from 'vitest';
import { courseRepository } from '../courseRepository';
import { INITIAL_COURSES } from '../../../data/initialCourses';

describe('CourseRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Local cache & retrieval', () => {
    it('returns INITIAL_COURSES when cache is empty', async () => {
      const courses = await courseRepository.getCourses();
      expect(courses.length).toBe(INITIAL_COURSES.length);
      expect(courses[0].id).toBe(INITIAL_COURSES[0].id);
    });

    it('retrieves a course synchronously by id', () => {
      const course = courseRepository.getCourseById(INITIAL_COURSES[0].id);
      expect(course).toBeDefined();
      expect(course?.title).toBe(INITIAL_COURSES[0].title);
    });
  });

  describe('saveCourse with optimistic concurrency', () => {
    it('increments version and updates timestamp on save', async () => {
      const baseCourse = INITIAL_COURSES[0];
      const updated = await courseRepository.saveCourse({
        ...baseCourse,
        title: 'Updated Distributed Systems Course',
        version: 1
      });

      expect(updated.title).toBe('Updated Distributed Systems Course');
      expect(updated.version).toBe(2);
      expect(updated.updatedAt).toBeDefined();

      const retrieved = courseRepository.getCourseById(baseCourse.id);
      expect(retrieved?.title).toBe('Updated Distributed Systems Course');
    });
  });

  describe('deleteCourse', () => {
    it('removes a course from local cache', async () => {
      const courseId = INITIAL_COURSES[0].id;
      await courseRepository.deleteCourse(courseId);

      const retrieved = courseRepository.getCourseById(courseId);
      expect(retrieved).toBeUndefined();
    });
  });
});
