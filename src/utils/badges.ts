import { UserProgress, Course } from '../types';

export type MedalTier = 'gold' | 'silver' | 'bronze' | 'none';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  tier?: MedalTier;
  category: 'quiz' | 'completion' | 'streak' | 'milestone';
  earnedAt?: string;
}

export interface UserBadges {
  quizMedals: Record<string, MedalTier>; // topicId -> medal tier
  courseCompletionBadges: Record<string, { tier: MedalTier; earnedAt: string }>; // courseId -> { tier, earnedAt }
  milestoneBadges: string[]; // badge IDs earned
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

// Calculate medal tier based on quiz score percentage
export const calculateMedalTier = (score: number, total: number): MedalTier => {
  if (total === 0) return 'none';
  const percent = (score / total) * 100;
  if (percent >= 80) return 'gold';
  if (percent >= 50) return 'silver';
  return 'bronze';
};

// Get medal tier label
export const getMedalTierLabel = (tier: MedalTier): string => {
  switch (tier) {
    case 'gold': return 'Gold Medal';
    case 'silver': return 'Silver Medal';
    case 'bronze': return 'Bronze Medal';
    default: return 'No Medal';
  }
};

// Get medal tier color classes
export const getMedalTierColors = (tier: MedalTier): { bg: string; text: string; border: string; iconColor: string } => {
  switch (tier) {
    case 'gold':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-500'
      };
    case 'silver':
      return {
        bg: 'bg-slate-50 dark:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        iconColor: 'text-slate-400'
      };
    case 'bronze':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/60',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        iconColor: 'text-orange-500'
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-800/60',
        text: 'text-slate-500 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        iconColor: 'text-slate-300'
      };
  }
};

// Get medal emoji/icon representation
export const getMedalIcon = (tier: MedalTier): string => {
  switch (tier) {
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    default: return '';
  }
};

// Calculate all quiz medals from progress
export const calculateAllQuizMedals = (progress: UserProgress): Record<string, MedalTier> => {
  const medals: Record<string, MedalTier> = {};
  Object.entries(progress.quizResults || {}).forEach(([topicId, result]) => {
    medals[topicId] = calculateMedalTier(result.score, result.total);
  });
  return medals;
};

// Calculate course completion medals
export const calculateCourseMedals = (
  progress: UserProgress,
  courses: Course[]
): Record<string, { tier: MedalTier; earnedAt: string }> => {
  const medals: Record<string, { tier: MedalTier; earnedAt: string }> = {};

  courses.forEach(course => {
    const topicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
    if (topicIds.length === 0) return;

    const completedCount = topicIds.filter(id => progress.completedTopicIds.includes(id)).length;
    const percent = (completedCount / topicIds.length) * 100;

    if (percent === 100) {
      medals[course.id] = { tier: 'gold', earnedAt: new Date().toISOString() };
    } else if (percent >= 75) {
      medals[course.id] = { tier: 'silver', earnedAt: new Date().toISOString() };
    } else if (percent >= 50) {
      medals[course.id] = { tier: 'bronze', earnedAt: new Date().toISOString() };
    }
  });

  return medals;
};

// Generate milestone badges based on achievements
export const generateMilestoneBadges = (
  progress: UserProgress,
  courses: Course[]
): Badge[] => {
  const badges: Badge[] = [];
  const completedCount = progress.completedTopicIds.length;
  const notesCount = Object.keys(progress.topicNotes || {}).filter(k => progress.topicNotes[k]?.trim()).length;
  const quizCount = Object.keys(progress.quizResults || {}).length;

  // Topic completion milestones
  if (completedCount >= 1) badges.push({ id: 'first-step', name: 'First Steps', description: 'Completed your first topic', icon: 'Award', category: 'milestone' });
  if (completedCount >= 5) badges.push({ id: 'getting-started', name: 'Getting Started', description: 'Completed 5 topics', icon: 'Sparkles', category: 'milestone' });
  if (completedCount >= 10) badges.push({ id: 'dedicated-learner', name: 'Dedicated Learner', description: 'Completed 10 topics', icon: 'Zap', category: 'milestone' });
  if (completedCount >= 25) badges.push({ id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Completed 25 topics', icon: 'Brain', category: 'milestone' });
  if (completedCount >= 50) badges.push({ id: 'master-learner', name: 'Master Learner', description: 'Completed 50 topics', icon: 'Award', category: 'milestone' });

  // Course completion milestones
  const completedCourses = courses.filter(course => {
    const topicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
    return topicIds.length > 0 && topicIds.every(id => progress.completedTopicIds.includes(id));
  });

  if (completedCourses.length >= 1) badges.push({ id: 'first-course', name: 'Course Finisher', description: 'Completed your first course', icon: 'BookOpen', category: 'completion' });
  if (completedCourses.length >= 3) badges.push({ id: 'course-collector', name: 'Course Collector', description: 'Completed 3 courses', icon: 'FileText', category: 'completion' });
  if (completedCourses.length >= 5) badges.push({ id: 'polyglot', name: 'Polyglot', description: 'Completed 5 courses', icon: 'BookOpen', category: 'completion' });

  // Quiz mastery milestones
  const perfectQuizzes = Object.entries(progress.quizResults || {}).filter(([_, r]) => r.score === r.total).length;
  if (perfectQuizzes >= 1) badges.push({ id: 'perfect-score', name: 'Perfect Score', description: 'Achieved 100% on a quiz', icon: 'CheckCircle2', category: 'quiz' });
  if (perfectQuizzes >= 5) badges.push({ id: 'quiz-master', name: 'Quiz Master', description: 'Achieved 100% on 5 quizzes', icon: 'Brain', category: 'quiz' });
  if (perfectQuizzes >= 10) badges.push({ id: 'unstoppable', name: 'Unstoppable', description: 'Achieved 100% on 10 quizzes', icon: 'Zap', category: 'quiz' });

  // Gold medal milestones
  const goldMedals = Object.values(calculateAllQuizMedals(progress)).filter(t => t === 'gold').length;
  if (goldMedals >= 1) badges.push({ id: 'gold-medalist', name: 'Gold Medalist', description: 'Earned your first Gold medal', icon: 'Award', category: 'quiz' });
  if (goldMedals >= 5) badges.push({ id: 'gold-collector', name: 'Gold Collector', description: 'Earned 5 Gold medals', icon: 'Sparkles', category: 'quiz' });
  if (goldMedals >= 10) badges.push({ id: 'golden-legend', name: 'Golden Legend', description: 'Earned 10 Gold medals', icon: 'Zap', category: 'quiz' });

  // Notes milestones
  if (notesCount >= 1) badges.push({ id: 'note-taker', name: 'Note Taker', description: 'Wrote your first study note', icon: 'FileText', category: 'milestone' });
  if (notesCount >= 10) badges.push({ id: 'diligent-scribe', name: 'Diligent Scribe', description: 'Wrote notes on 10 topics', icon: 'PenSquare', category: 'milestone' });
  if (notesCount >= 25) badges.push({ id: 'knowledge-architect', name: 'Knowledge Architect', description: 'Wrote notes on 25 topics', icon: 'Brain', category: 'milestone' });

  // Bookmark milestones
  const bookmarkCount = progress.bookmarkedTopicIds?.length || 0;
  if (bookmarkCount >= 5) badges.push({ id: 'bookworm', name: 'Bookworm', description: 'Bookmarked 5 topics', icon: 'Bookmark', category: 'milestone' });
  if (bookmarkCount >= 20) badges.push({ id: 'curator', name: 'Curator', description: 'Bookmarked 20 topics', icon: 'Bookmark', category: 'milestone' });

  return badges;
};

// Get all earned badges for a user
export const getUserBadges = (progress: UserProgress, courses: Course[]): Badge[] => {
  return generateMilestoneBadges(progress, courses);
};

// Calculate streak (simplified - based on last active date)
export const calculateStreak = (progress: UserProgress): { current: number; longest: number } => {
  // This is a simplified streak calculation
  // In a real app, you'd track daily activity
  return { current: 0, longest: 0 };
};