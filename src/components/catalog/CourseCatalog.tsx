import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowRight,
  Layers,
  Search,
  Filter,
  Award,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Course, UserProgress, AdminUser } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';
import { getCourseIcon } from '../../utils/icons';
import { useAuthStore } from '../../stores/useAuthStore';

interface CourseCatalogProps {
  courses: Course[];
  progress: UserProgress;
  adminUser: AdminUser | null;
  onSelectCourse: (courseId: string, topicId?: string) => void;
  onOpenCreateCourse: () => void;
  onOpenAdminLogin: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  progress,
  adminUser,
  onSelectCourse,
  onOpenCreateCourse,
  onOpenAdminLogin
}) => {
  const { permissions, openAuthModal } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchCat = selectedCategory === 'All' || course.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.tags.some(t => t.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;

    courses.forEach(course => {
      course.modules.forEach(m => {
        m.topics.forEach(t => {
          totalTopics++;
          if (progress.completedTopicIds.includes(t.id)) {
            completedTopics++;
          }
        });
      });
    });

    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { totalTopics, completedTopics, percent };
  }, [courses, progress]);

  return (
    <div className="min-h-screen pb-24 animate-fade-in">

      {/* Hero Section with Light Gradient Glow */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-200/70 dark:border-slate-800 bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent">

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-300/20 via-fuchsia-300/15 to-transparent dark:from-indigo-500/10 dark:via-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/60 shadow-xs mb-5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Minimalist Engineering & Knowledge Studio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.12]">
              Knowledge written in <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                your own words.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              A distraction-free learning ecosystem where every topic reads like a clean, high-impact engineering article. Auto-expanding navigation, live markdown editing, and subtle light gradients designed to stick in mind.
            </p>
          </div>

          {/* Metrics & Action Bar */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">

            <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Available Courses</p>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  {courses.length} Curated Series
                </h4>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Lessons</p>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  {stats.totalTopics} Chapters
                </h4>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your Progress</p>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stats.percent}%</span>
                </div>
                <div className="mt-1.5 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search & Create Buttons */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter courses..."
                className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {permissions.canEditCourse ? (
              <button
                onClick={onOpenCreateCourse}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/20 whitespace-nowrap cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Course</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('presets', 'canEditCourse')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Create Course</span>
              </button>
            )}
          </div>

        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const themeStyle = GRADIENT_THEMES[course.theme] || GRADIENT_THEMES['indigo-violet'];

            // Calculate progress for this specific course
            const allTopics = course.modules.flatMap(m => m.topics);
            const completedCount = allTopics.filter(t => progress.completedTopicIds.includes(t.id)).length;
            const coursePercent = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
            const firstTopicId = allTopics[0]?.id;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id, firstTopicId)}
                className={`group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${themeStyle.borderGlow}`}
              >
                {/* Top Subtle Gradient Header */}
                <div className={`p-6 bg-gradient-to-br ${themeStyle.cardHeader} border-b border-slate-100 dark:border-slate-800/80`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform">
                      {getCourseIcon(course.iconName, 'w-6 h-6')}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${themeStyle.badge}`}>
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-normal">
                    {course.subtitle}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Modules & Topics Info Pill */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        {course.modules.length} Modules &bull; {allTopics.length} Lessons
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {course.estimatedHours} hrs
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-600 dark:text-slate-400">
                        <span>{completedCount} of {allTopics.length} completed</span>
                        <span>{coursePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${themeStyle.progressBar} rounded-full transition-all duration-300`}
                          style={{ width: `${coursePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    {coursePercent === 100 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Complete &bull; Review</span>
                      </>
                    ) : coursePercent > 0 ? (
                      <>
                        <Zap className="w-4 h-4 text-indigo-500" />
                        <span>Continue Reading</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>Start Course</span>
                      </>
                    )}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}

          {/* Empty State / Create Course Promo Card */}
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-display">No courses found matching &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Try searching for a different keyword or create your own custom syllabus in your own words.
              </p>
              <button
                onClick={adminUser ? onOpenCreateCourse : onOpenAdminLogin}
                className="mt-5 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
