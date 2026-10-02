import { describe, it, expect } from 'vitest';
import {
  calculateMedalTier,
  getMedalTierLabel,
  getMedalTierColors,
  getMedalIcon,
  calculateAllQuizMedals,
  calculateCourseMedals,
  getUserBadges
} from '../badges';
import { UserProgress, Course } from '../../types';

describe('badges utility logic', () => {
  describe('calculateMedalTier', () => {
    it('returns none when total is 0', () => {
      expect(calculateMedalTier(0, 0)).toBe('none');
    });

    it('returns gold for >= 80% score', () => {
      expect(calculateMedalTier(8, 10)).toBe('gold');
      expect(calculateMedalTier(10, 10)).toBe('gold');
      expect(calculateMedalTier(4, 5)).toBe('gold');
    });

    it('returns silver for >= 50% and < 80% score', () => {
      expect(calculateMedalTier(5, 10)).toBe('silver');
      expect(calculateMedalTier(7, 10)).toBe('silver');
      expect(calculateMedalTier(3, 5)).toBe('silver');
    });

    it('returns bronze for < 50% score', () => {
      expect(calculateMedalTier(4, 10)).toBe('bronze');
      expect(calculateMedalTier(1, 10)).toBe('bronze');
      expect(calculateMedalTier(0, 5)).toBe('bronze');
    });
  });

  describe('getMedalTierLabel & getMedalIcon', () => {
    it('returns correct label and icon for gold tier', () => {
      expect(getMedalTierLabel('gold')).toBe('Gold Medal');
      expect(getMedalIcon('gold')).toBe('🥇');
    });

    it('returns correct label and icon for silver tier', () => {
      expect(getMedalTierLabel('silver')).toBe('Silver Medal');
      expect(getMedalIcon('silver')).toBe('🥈');
    });

    it('returns correct label and icon for bronze tier', () => {
      expect(getMedalTierLabel('bronze')).toBe('Bronze Medal');
      expect(getMedalIcon('bronze')).toBe('🥉');
    });

    it('returns fallback for none tier', () => {
      expect(getMedalTierLabel('none')).toBe('No Medal');
      expect(getMedalIcon('none')).toBe('');
    });
  });

  describe('getMedalTierColors', () => {
    it('returns styling tokens with amber palette for gold', () => {
      const colors = getMedalTierColors('gold');
      expect(colors.bg).toContain('amber');
      expect(colors.text).toContain('amber');
    });

    it('returns styling tokens with slate palette for silver', () => {
      const colors = getMedalTierColors('silver');
      expect(colors.bg).toContain('slate');
      expect(colors.text).toContain('slate');
    });

    it('returns styling tokens with orange palette for bronze', () => {
      const colors = getMedalTierColors('bronze');
      expect(colors.bg).toContain('orange');
      expect(colors.text).toContain('orange');
    });
  });

  describe('calculateAllQuizMedals', () => {
    it('maps user progress quiz results to medal tiers', () => {
      const mockProgress: UserProgress = {
        completedTopicIds: [],
        bookmarkedTopicIds: [],
        topicNotes: {},
        quizResults: {
          'topic-1': { score: 10, total: 10, timestamp: '2026-03-01' },
          'topic-2': { score: 6, total: 10, timestamp: '2026-03-01' },
          'topic-3': { score: 2, total: 10, timestamp: '2026-03-01' }
        }
      };

      const medals = calculateAllQuizMedals(mockProgress);
      expect(medals['topic-1']).toBe('gold');
      expect(medals['topic-2']).toBe('silver');
      expect(medals['topic-3']).toBe('bronze');
    });
  });

  describe('calculateCourseMedals', () => {
    const mockCourses: Course[] = [
      {
        id: 'c1',
        slug: 'c1',
        title: 'Course 1',
        subtitle: 'Sub',
        description: 'Desc',
        category: 'Cat',
        level: 'Beginner',
        estimatedHours: 2,
        author: 'Auth',
        theme: 'indigo-violet',
        iconName: 'Book',
        isPublished: true,
        tags: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        modules: [
          {
            id: 'm1',
            title: 'M1',
            description: 'D1',
            order: 1,
            topics: [
              { id: 't1', title: 'T1', slug: 't1', readingTimeMinutes: 5, order: 1, isPublished: true, summary: '', content: '', updatedAt: '' },
              { id: 't2', title: 'T2', slug: 't2', readingTimeMinutes: 5, order: 2, isPublished: true, summary: '', content: '', updatedAt: '' }
            ]
          }
        ]
      }
    ];

    it('awards gold medal for 100% course topic completion', () => {
      const progress: UserProgress = {
        completedTopicIds: ['t1', 't2'],
        bookmarkedTopicIds: [],
        topicNotes: {},
        quizResults: {}
      };

      const medals = calculateCourseMedals(progress, mockCourses);
      expect(medals['c1']?.tier).toBe('gold');
    });

    it('awards bronze medal for 50% completion', () => {
      const progress: UserProgress = {
        completedTopicIds: ['t1'],
        bookmarkedTopicIds: [],
        topicNotes: {},
        quizResults: {}
      };

      const medals = calculateCourseMedals(progress, mockCourses);
      expect(medals['c1']?.tier).toBe('bronze');
    });
  });

  describe('generateMilestoneBadges & getUserBadges', () => {
    it('awards milestone badges progressively based on actions', () => {
      const progress: UserProgress = {
        completedTopicIds: ['t1', 't2', 't3', 't4', 't5'],
        bookmarkedTopicIds: ['t1', 't2', 't3', 't4', 't5'],
        topicNotes: {
          't1': 'Great note',
          't2': 'Another note'
        },
        quizResults: {
          't1': { score: 5, total: 5, timestamp: '2026-03-01' }
        }
      };

      const badges = getUserBadges(progress, []);
      const badgeIds = badges.map(b => b.id);

      expect(badgeIds).toContain('first-step');
      expect(badgeIds).toContain('getting-started');
      expect(badgeIds).toContain('perfect-score');
      expect(badgeIds).toContain('gold-medalist');
      expect(badgeIds).toContain('note-taker');
      expect(badgeIds).toContain('bookworm');
    });
  });
});
