import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  FileText,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Trash2,
  ExternalLink,
  Search,
  Check,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Course, UserProgress } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';
import { getCourseIcon } from '../../utils/icons';
import { storageService } from '../../services/storage';

interface LearningHubProps {
  courses: Course[];
  progress: UserProgress;
  onSelectCourse: (courseId: string, topicId?: string) => void;
  onNavigateToCatalog: () => void;
  onOpenCertificate: (course: Course) => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  courses,
  progress,
  onSelectCourse,
  onNavigateToCatalog,
  onOpenCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'notes' | 'quizzes'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect all topics with their parent course and module metadata
  const allTopicsIndex = useMemo(() => {
    return courses.flatMap(course =>
      course.modules.flatMap(module =>
        module.topics.map(topic => ({
          ...topic,
          courseId: course.id,
          courseTitle: course.title,
          courseTheme: course.theme,
          courseIcon: course.iconName,
          courseCategory: course.category,
          moduleId: module.id,
          moduleTitle: module.title
        }))
      )
    );
  }, [courses]);

  // Aggregate Metrics
  const totalTopicsCount = allTopicsIndex.length;
  const completedTopicsCount = progress.completedTopicIds.length;
  const overallPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
  const notesCount = Object.keys(progress.topicNotes || {}).filter(k => progress.topicNotes[k]?.trim()).length;
  const bookmarksCount = progress.bookmarkedTopicIds?.length || 0;
  const quizCount = Object.keys(progress.quizResults || {}).length;

  // Calculate completed courses
  const completedCourses = useMemo(() => {
    return courses.filter(course => {
      const topicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
      if (topicIds.length === 0) return false;
      return topicIds.every(id => progress.completedTopicIds.includes(id));
    });
  }, [courses, progress.completedTopicIds]);

  // Find last active topic or next recommended topic
  const resumeTopic = useMemo(() => {
    if (progress.lastActiveCourseId && progress.lastActiveTopicId) {
      const found = allTopicsIndex.find(
        t => t.courseId === progress.lastActiveCourseId && t.id === progress.lastActiveTopicId
      );
      if (found) return found;
    }
    // Fallback: first non-completed topic
    return allTopicsIndex.find(t => !progress.completedTopicIds.includes(t.id)) || allTopicsIndex[0];
  }, [allTopicsIndex, progress]);

  // Bookmarked Topics
  const bookmarkedTopics = useMemo(() => {
    return allTopicsIndex.filter(t => progress.bookmarkedTopicIds.includes(t.id));
  }, [allTopicsIndex, progress.bookmarkedTopicIds]);

  // Saved Notes List
  const savedNotesList = useMemo(() => {
    return Object.entries(progress.topicNotes || {})
      .filter(([_, note]) => note && note.trim().length > 0)
      .map(([topicId, note]) => {
        const topic = allTopicsIndex.find(t => t.id === topicId);
        return {
          topicId,
          note,
          topic
        };
      });
  }, [progress.topicNotes, allTopicsIndex]);

  // Quizzes Completed
  const completedQuizzesList = useMemo(() => {
    return Object.entries(progress.quizResults || {}).map(([topicId, result]) => {
      const topic = allTopicsIndex.find(t => t.id === topicId);
      return {
        topicId,
        score: result.score,
        total: result.total,
        timestamp: result.timestamp,
        topic
      };
    });
  }, [progress.quizResults, allTopicsIndex]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">

      {/* Top Banner */}
      <section className="relative overflow-hidden pt-8 pb-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-indigo-50/20 to-transparent dark:from-slate-900 dark:via-slate-900/40 dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Personal Learning Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                My Learning <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
                Track your study trajectory, resume where you left off, and revisit saved notes and bookmarked topics.
              </p>
            </div>

            {/* Quick Resume CTA Card */}
            {resumeTopic && (
              <div className="shrink-0 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/80 shadow-md shadow-indigo-500/5 max-w-sm w-full backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Up Next / Resume</span>
                  </span>
                  <span>{resumeTopic.readingTimeMinutes} min read</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {resumeTopic.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {resumeTopic.courseTitle}
                </p>
                <button
                  onClick={() => onSelectCourse(resumeTopic.courseId, resumeTopic.id)}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Continue Reading</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Total Progress</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {overallPercent}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {completedTopicsCount} of {totalTopicsCount} topics finished
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Study Notes</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {notesCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Topics with personalized notes
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Bookmarks</span>
                <Bookmark className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {bookmarksCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Saved for quick reference
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs font-semibold">Certificates</span>
                <Award className="w-4 h-4 text-fuchsia-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {completedCourses.length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {courses.length - completedCourses.length} courses remaining
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Course Trajectory ({courses.length})
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarksCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes Notebook ({notesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quizzes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Quizzes & Mastery ({quizCount})</span>
            </button>
          </div>

          <button
            onClick={onNavigateToCatalog}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Explore All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TAB 1: OVERVIEW & COURSE TRAJECTORY */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Curriculum Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const themeStyle = GRADIENT_THEMES[course.theme] || GRADIENT_THEMES['indigo-violet'];
                const courseTopics = course.modules.flatMap(m => m.topics);
                const completedInCourse = courseTopics.filter(t => progress.completedTopicIds.includes(t.id)).length;
                const percent = courseTopics.length > 0 ? Math.round((completedInCourse / courseTopics.length) * 100) : 0;
                const isComplete = percent === 100;

                return (
                  <div
                    key={course.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
                            {getCourseIcon(course.iconName, 'w-4 h-4')}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${themeStyle.badge}`}>
                            {course.category}
                          </span>
                        </div>
                        {isComplete && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <Award className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">
                        {course.subtitle}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>{completedInCourse} / {courseTopics.length} topics</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percent}%</span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full ${themeStyle.progressBar} rounded-full transition-all duration-300`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectCourse(course.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Open Reader</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {isComplete && (
                          <button
                            onClick={() => onOpenCertificate(course)}
                            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Verified Certificate"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Certificate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKMARKS */}
        {activeTab === 'bookmarks' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bookmarked Lessons</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {bookmarkedTopics.length} bookmarked
              </span>
            </div>

            {bookmarkedTopics.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookmarked topics yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  While reading any topic, click the bookmark icon to save high-value concepts for instant recall here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedTopics.map(topic => {
                  const isCompleted = progress.completedTopicIds.includes(topic.id);
                  return (
                    <div
                      key={topic.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {topic.courseTitle}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[10px] text-slate-400">{topic.moduleTitle}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {topic.summary}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topic.readingTimeMinutes} min read
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectCourse(topic.courseId, topic.id)}
                        className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Jump</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTES NOTEBOOK */}
        {activeTab === 'notes' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Study Notes</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {savedNotesList.length} notes saved
              </span>
            </div>

            {savedNotesList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No study notes recorded</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Click "Notes" in the reader toolbar to write your own architectural takeaways, mental models, and reminders.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedNotesList.map(({ topicId, note, topic }) => (
                  <div
                    key={topicId}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {topic?.courseTitle || 'Course Lesson'}
                        </span>
                        {topic && (
                          <button
                            onClick={() => onSelectCourse(topic.courseId, topic.id)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Topic</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                        {topic?.title || `Topic ${topicId}`}
                      </h3>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                        {note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUIZZES & MASTERY */}
        {activeTab === 'quizzes' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Attempts & Concept Mastery</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {completedQuizzesList.length} assessments taken
              </span>
            </div>

            {completedQuizzesList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <Brain className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No quiz submissions yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Take the knowledge check quizzes at the end of topics to test your retention and score mastery!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedQuizzesList.map(({ topicId, score, total, timestamp, topic }) => {
                  const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;
                  const isPerfect = score === total;

                  return (
                    <div
                      key={topicId}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {topic?.courseTitle || 'Curriculum'}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {topic?.title || `Topic ${topicId}`}
                        </h3>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-base font-extrabold ${isPerfect ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {score}/{total}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {scorePercent}% score
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
