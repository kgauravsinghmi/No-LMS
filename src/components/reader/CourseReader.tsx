import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  PenSquare,
  ArrowLeft,
  ArrowUp,
  Clock,
  Check,
  AlignLeft,
  Search,
  Edit3,
  Award,
  Minus,
  Plus,
  Type,
  Copy,
  Download,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, UserProgress, AdminUser } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';
import { getCourseIcon } from '../../utils/icons';
import { MarkdownRenderer } from '../content/MarkdownRenderer';
import { storageService } from '../../services/storage';
import { calculateMedalTier, getMedalTierLabel, getMedalTierColors, getMedalIcon } from '../../utils/badges';

interface CourseReaderProps {
  course: Course;
  initialTopicId?: string;
  progress: UserProgress;
  adminUser: AdminUser | null;
  onBackToCatalog: () => void;
  onOpenAdminEditTopic?: (courseId: string, moduleId: string, topicId: string) => void;
  onProgressUpdate: (newProg: UserProgress) => void;
  onOpenCertificate?: (course: Course) => void;
}

export const CourseReader: React.FC<CourseReaderProps> = ({
  course,
  initialTopicId,
  progress,
  adminUser,
  onBackToCatalog,
  onOpenAdminEditTopic,
  onProgressUpdate,
  onOpenCertificate
}) => {
  // Find initial topic or first topic
  const allTopics = useMemo(() => {
    return course.modules.flatMap(m => m.topics.map(t => ({ ...t, moduleId: m.id, moduleTitle: m.title })));
  }, [course]);

  const [activeTopicId, setActiveTopicId] = useState<string>(() => {
    if (initialTopicId && allTopics.some(t => t.id === initialTopicId)) {
      return initialTopicId;
    }
    return allTopics[0]?.id || '';
  });

  // Track expanded modules in sidebar
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    course.modules.forEach(m => {
      map[m.id] = true; // All open by default
    });
    return map;
  });

  // Reader UI settings with persistent font scale
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>(() => {
    try {
      const saved = localStorage.getItem('luminary_reader_font_size');
      if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') return saved;
    } catch {
      // fallback
    }
    return 'base';
  });

  const handleSetFontSize = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSize(size);
    try {
      localStorage.setItem('luminary_reader_font_size', size);
    } catch {
      // ignore
    }
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xl') handleSetFontSize('lg');
    else if (fontSize === 'lg') handleSetFontSize('base');
    else if (fontSize === 'base') handleSetFontSize('sm');
  };

  const increaseFontSize = () => {
    if (fontSize === 'sm') handleSetFontSize('base');
    else if (fontSize === 'base') handleSetFontSize('lg');
    else if (fontSize === 'lg') handleSetFontSize('xl');
  };

  const fontSizeLabels: Record<'sm' | 'base' | 'lg' | 'xl', { label: string; pct: string; desc: string }> = {
    sm: { label: 'A-', pct: '90%', desc: 'Compact' },
    base: { label: 'A', pct: '100%', desc: 'Standard' },
    lg: { label: 'A+', pct: '115%', desc: 'Large' },
    xl: { label: 'A++', pct: '130%', desc: 'Extra Large' }
  };

  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const articleTopRef = useRef<HTMLDivElement>(null);

  // Current active topic & module info
  const activeTopicInfo = useMemo(() => {
    for (const mod of course.modules) {
      const top = mod.topics.find(t => t.id === activeTopicId);
      if (top) {
        return { topic: top, module: mod };
      }
    }
    return null;
  }, [course, activeTopicId]);

  const wordsCount = useMemo(() => {
    if (!activeTopicInfo?.topic?.content) return 0;
    return activeTopicInfo.topic.content.trim().split(/\s+/).filter(Boolean).length;
  }, [activeTopicInfo]);

  // Sync note when active topic changes
  useEffect(() => {
    if (activeTopicId) {
      setNoteContent(progress.topicNotes[activeTopicId] || '');
      setReadingProgress(0);
      articleTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTopicId]);

  // ScrollSpy and Reading Progress calculation
  useEffect(() => {
    const handleScroll = () => {
      if (!articleTopRef.current) return;
      const articleEl = articleTopRef.current;
      const windowHeight = window.innerHeight;
      const totalHeight = articleEl.offsetHeight;
      const scrolled = window.scrollY - (articleEl.offsetTop - 120);
      const maxScroll = totalHeight - windowHeight + 200;

      if (maxScroll <= 0) {
        setReadingProgress(100);
      } else {
        const calculated = Math.min(100, Math.max(0, Math.round((scrolled / maxScroll) * 100)));
        setReadingProgress(calculated);
      }

      // Scrollspy active heading
      if (headings.length > 0) {
        const headingElements = headings
          .map(h => ({ id: h.id, el: document.getElementById(h.id) }))
          .filter(item => item.el !== null) as { id: string; el: HTMLElement }[];

        const scrollPosition = window.scrollY + 180;
        let currentActive = headings[0]?.id || '';

        for (const item of headingElements) {
          if (item.el.offsetTop <= scrollPosition) {
            currentActive = item.id;
          }
        }
        setActiveHeadingId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, activeTopicId]);

  const themeStyle = GRADIENT_THEMES[course.theme] || GRADIENT_THEMES['indigo-violet'];

  // Calculate course completion
  const completedCount = allTopics.filter(t => progress.completedTopicIds.includes(t.id)).length;
  const coursePercent = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  const isCourseFullyCompleted = allTopics.length > 0 && completedCount === allTopics.length;

  // Next / Previous navigation
  const currentIndex = allTopics.findIndex(t => t.id === activeTopicId);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const isCurrentTopicCompleted = activeTopicId ? progress.completedTopicIds.includes(activeTopicId) : false;
  const isCurrentTopicBookmarked = activeTopicId ? progress.bookmarkedTopicIds.includes(activeTopicId) : false;

  const handleToggleCompleted = () => {
    if (!activeTopicId) return;
    const isNowCompleted = storageService.toggleTopicCompleted(activeTopicId);

    // If completed and triggered, shoot celebratory confetti
    if (isNowCompleted) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
      });
    }

    onProgressUpdate(storageService.getProgress());
  };

  const handleCompleteAndNext = () => {
    if (activeTopicId && !isCurrentTopicCompleted) {
      storageService.toggleTopicCompleted(activeTopicId);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
      });
      onProgressUpdate(storageService.getProgress());
    }
    if (nextTopic) {
      setActiveTopicId(nextTopic.id);
    }
  };

  const handleScrollToHeading = (headingId: string) => {
    const target = document.getElementById(headingId);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveHeadingId(headingId);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = () => {
    if (!activeTopicId) return;
    storageService.toggleBookmark(activeTopicId);
    onProgressUpdate(storageService.getProgress());
  };

  const handleSaveNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteContent(text);
    if (activeTopicId) {
      storageService.saveNote(activeTopicId, text);
      onProgressUpdate(storageService.getProgress());
    }
  };

  const handleQuizSubmit = (score: number, total: number) => {
    if (activeTopicId) {
      storageService.saveQuizResult(activeTopicId, score, total);
      onProgressUpdate(storageService.getProgress());

      const medalTier = calculateMedalTier(score, total);
      const isPerfect = score === total;

      // Celebrate based on medal tier
      if (medalTier !== 'none') {
        const confettiColors: Record<string, string[]> = {
          gold: ['#f59e0b', '#fbbf24', '#fde047', '#6366f1'],
          silver: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#6366f1'],
          bronze: ['#ea580c', '#f97316', '#fb923c', '#6366f1']
        };

        confetti({
          particleCount: isPerfect ? 120 : (medalTier === 'gold' ? 100 : medalTier === 'silver' ? 80 : 60),
          spread: isPerfect ? 90 : 70,
          origin: { y: 0.6 },
          colors: confettiColors[medalTier] || ['#10b981', '#6366f1', '#f59e0b']
        });
      } else if (!isPerfect) {
        // Still celebrate completion
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
        });
      }
    }
  };

  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  const handleCopyCurrentNote = () => {
    if (!noteContent.trim()) return;
    navigator.clipboard.writeText(noteContent);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleExportCurrentNote = () => {
    if (!noteContent.trim() || !activeTopicInfo) return;
    const title = activeTopicInfo.topic.title;
    const courseTitle = course.title;
    const text = `# ${title}\nCourse: ${courseTitle}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n${noteContent}\n`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-note.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] dark:bg-[#0B0F19] transition-colors">

      {/* Top Sticky Breadcrumb & Reading Progress Bar */}
      <div className="sticky top-16 z-30 w-full backdrop-blur-lg bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Courses</span>
          </button>
          <span>/</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-none">
            {course.title}
          </span>
          {activeTopicInfo && (
            <>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[180px] sm:max-w-none">
                {activeTopicInfo.topic.title}
              </span>
            </>
          )}
        </div>

        {/* Action Controls in Sub-Header */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Reading progress badge */}
          {readingProgress > 0 && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{readingProgress}% read</span>
            </span>
          )}

          {/* Admin Edit Topic Button */}
          {adminUser && activeTopicInfo && onOpenAdminEditTopic && (
            <button
              onClick={() => onOpenAdminEditTopic(course.id, activeTopicInfo.module.id, activeTopicInfo.topic.id)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              title="Edit this topic in Admin Studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Lesson</span>
            </button>
          )}

          {/* Notes Drawer Toggle */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              showNotesDrawer || (activeTopicId && progress.topicNotes[activeTopicId])
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Font Size Adjuster (- and + Stepper & Presets) */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize === 'sm'}
              className="p-1.5 sm:px-2 sm:py-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700/80"
              title="Decrease font size (-)"
              aria-label="Decrease font size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 select-none">
              <Type className="w-3 h-3 text-indigo-500" />
              <span>{fontSizeLabels[fontSize].pct}</span>
            </div>

            <div className="hidden md:flex items-center border-l border-slate-200 dark:border-slate-700/80">
              {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleSetFontSize(size)}
                  className={`px-2 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    fontSize === size
                      ? 'bg-indigo-600 text-white shadow-inner'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={`${fontSizeLabels[size].desc} (${fontSizeLabels[size].pct})`}
                >
                  {fontSizeLabels[size].label}
                </button>
              ))}
            </div>

            <button
              onClick={increaseFontSize}
              disabled={fontSize === 'xl'}
              className="p-1.5 sm:px-2 sm:py-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700/80"
              title="Increase font size (+)"
              aria-label="Increase font size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zen / Focus Mode Toggle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isZenMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isZenMode ? 'Exit Zen Reading Mode' : 'Enter Zen Reading Mode'}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

        </div>

        {/* Real-time Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200/40 dark:bg-slate-800/60 overflow-hidden">
          <div
            className={`h-full ${themeStyle.progressBar} transition-all duration-150 ease-out`}
            style={{ width: `${readingProgress}%` }}
          />
        </div>

      </div>

      {/* Main Reader Layout - Expanded Desktop/Laptop Canvas */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
        <div className="flex gap-8 items-start relative">

          {/* LEFT SIDEBAR: Dynamic Course & Topic Navigation (Hides in Zen Mode) */}
          {!isZenMode && (
            <aside className="w-80 shrink-0 hidden lg:block sticky top-28 max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 shadow-xs">

              {/* Course Title Card */}
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${themeStyle.cardHeader} border border-slate-100 dark:border-slate-800/80 mb-4`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-xs">
                    {getCourseIcon(course.iconName, 'w-4 h-4')}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${themeStyle.badge}`}>
                    {course.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {course.title}
                </h3>

                {/* Course Overall Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span>Course Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{coursePercent}%</span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${themeStyle.progressBar} rounded-full transition-all duration-300`}
                      style={{ width: `${coursePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Topic Filter Search */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter curriculum..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Modules & Topics Tree */}
              <div className="space-y-4">
                {course.modules.map((module, modIdx) => {
                  const filteredTopics = module.topics.filter(t =>
                    !sidebarSearch ||
                    t.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                    (t.summary || '').toLowerCase().includes(sidebarSearch.toLowerCase())
                  );

                  if (sidebarSearch && filteredTopics.length === 0) return null;

                  const isExpanded = expandedModules[module.id] !== false;

                  return (
                    <div key={module.id} className="space-y-1">
                      {/* Module Header Accordion */}
                      <button
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !isExpanded }))}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center">
                            {modIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {module.title}
                          </span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Topics List (Dynamically increases when added!) */}
                      {isExpanded && (
                        <div className="space-y-1 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5 py-1">
                          {filteredTopics.map((topic) => {
                            const isActive = topic.id === activeTopicId;
                            const isCompleted = progress.completedTopicIds.includes(topic.id);

                            return (
                              <button
                                key={topic.id}
                                onClick={() => setActiveTopicId(topic.id)}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 group cursor-pointer ${
                                  isActive
                                    ? `${themeStyle.activeBg} ${themeStyle.activeBorder} border-l-2 font-bold shadow-xs`
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`} />
                                )}

                                <div className="flex-1 min-w-0">
                                  <p className="truncate">{topic.title}</p>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                                    {topic.readingTimeMinutes} min read
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </aside>
          )}

          {/* CENTER: Main Blog-Style Course Content */}
          <main className={`flex-1 min-w-0 transition-all ${isZenMode ? 'max-w-4xl lg:max-w-5xl mx-auto' : ''}`}>

            {activeTopicInfo ? (
              <article ref={articleTopRef} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xs">

                {/* Topic Header */}
                <header className="border-b border-slate-100 dark:border-slate-800/80 pb-8 mb-8">

                  {/* Category Pill & Reading Time */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeStyle.badge}`}>
                        {activeTopicInfo.module.title}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {activeTopicInfo.topic.readingTimeMinutes} min read &bull; {wordsCount} words
                      </span>
                    </div>

                    {/* Bookmark & Mark Completed Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleBookmark}
                        className={`p-2 rounded-xl border transition-colors ${
                          isCurrentTopicBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={isCurrentTopicBookmarked ? 'Bookmarked' : 'Bookmark this topic'}
                      >
                        {isCurrentTopicBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={handleToggleCompleted}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                          isCurrentTopicCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isCurrentTopicCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span>{isCurrentTopicCompleted ? 'Completed' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-tight">
                    {activeTopicInfo.topic.title}
                  </h1>

                  {activeTopicInfo.topic.summary && (
                    <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {activeTopicInfo.topic.summary}
                    </p>
                  )}

                  {/* Key Takeaways Highlight Box */}
                  {activeTopicInfo.topic.keyTakeaways && activeTopicInfo.topic.keyTakeaways.length > 0 && (
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-pink-50/20 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-900/40">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Core Takeaways</span>
                      </div>
                      <ul className="space-y-2">
                        {activeTopicInfo.topic.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </header>

                {/* Markdown Body Content */}
                <div className="py-2">
                  <MarkdownRenderer
                    content={activeTopicInfo.topic.content}
                    fontSize={fontSize}
                    onHeadingsExtracted={setHeadings}
                    quiz={activeTopicInfo.topic.quiz}
                    topicId={activeTopicInfo.topic.id}
                    onQuizSubmit={handleQuizSubmit}
                    savedQuizScore={progress.quizResults[activeTopicInfo.topic.id]}
                  />
                </div>

                {/* Bottom In-Lesson Context Stepper & Actions */}
                <footer className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">

                  {/* Quick Action Bar: Completion & Advance */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToggleCompleted}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isCurrentTopicCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-500'
                        }`}
                        title={isCurrentTopicCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {isCurrentTopicCompleted ? 'Lesson Completed!' : 'Mark Lesson as Done'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isCurrentTopicCompleted ? 'Keep going to maintain your learning streak.' : 'Track your progress and earn completion certificate.'}
                        </p>
                      </div>
                    </div>

                    {nextTopic && (
                      <button
                        onClick={handleCompleteAndNext}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{!isCurrentTopicCompleted ? 'Complete & Next Lesson' : 'Next Lesson'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Previous / Next Lesson Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Previous Topic */}
                    {prevTopic ? (
                      <button
                        onClick={() => setActiveTopicId(prevTopic.id)}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-left transition-all group flex items-center gap-3 cursor-pointer shadow-xs"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-colors shrink-0">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                            Previous Lesson
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate mt-0.5">
                            {prevTopic.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {prevTopic.readingTimeMinutes} min read
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    {/* Next Topic */}
                    {nextTopic ? (
                      <button
                        onClick={() => setActiveTopicId(nextTopic.id)}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-right transition-all group flex items-center justify-end gap-3 cursor-pointer shadow-xs"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                            Next Lesson
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate mt-0.5">
                            {nextTopic.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {nextTopic.readingTimeMinutes} min read
                          </span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-colors shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center sm:justify-end gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          Final Lesson of Track!
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Course Completion & Certificate Claim CTA Banner */}
                  {isCourseFullyCompleted && onOpenCertificate && (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-violet-500/15 border border-amber-300/80 dark:border-amber-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              Track 100% Completed!
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            You completed all {allTopics.length} topics in this course. Claim and print your personalized certificate of mastery.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCertificate(course)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 shrink-0"
                      >
                        <Award className="w-4 h-4" />
                        <span>Claim Certificate</span>
                      </button>
                    </div>
                  )}

                </footer>

              </article>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>Select a topic from the sidebar to begin reading.</p>
              </div>
            )}

          </main>

          {/* RIGHT SIDEBAR: Scrollspy TOC & Scratchpad (Hides in Zen mode) */}
          {!isZenMode && (
            <aside className="w-64 shrink-0 hidden xl:block sticky top-28 space-y-6">

              {/* Enhanced Scrollspy Table of Contents "On this page" */}
              {headings.length > 0 && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
                      <span>On This Page</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {readingProgress}%
                    </span>
                  </div>

                  {/* Reading Progress Mini Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mb-3 overflow-hidden">
                    <div
                      className={`h-full ${themeStyle.progressBar} transition-all duration-200`}
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>

                  <nav className="space-y-1 text-xs max-h-[320px] overflow-y-auto pr-1">
                    {headings.map(h => {
                      const isActive = activeHeadingId === h.id;
                      let indentClass = 'pl-2 text-xs';
                      if (h.level === 3) indentClass = 'pl-4 text-[11.5px]';
                      else if (h.level === 4) indentClass = 'pl-6 text-[11px]';
                      else if (h.level === 5) indentClass = 'pl-7 text-[10.5px]';
                      else if (h.level >= 6) indentClass = 'pl-8 text-[10px]';

                      return (
                        <button
                          key={h.id}
                          onClick={() => handleScrollToHeading(h.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold border-l-2 border-indigo-600 dark:border-indigo-400 pl-2.5'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 font-normal'
                          } ${indentClass}`}
                        >
                          <span className="truncate">{h.text}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </nav>

                  {/* Quick Back to Top Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleScrollToTop}
                      className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>Back to top</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Notes Scratchpad Box */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <PenSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Study Notes</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-saves</span>
                </div>
                <textarea
                  value={noteContent}
                  onChange={handleSaveNote}
                  placeholder="Jot down personal takeaways or thoughts on this lesson..."
                  rows={6}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
                {/* Copy & Export Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleCopyCurrentNote}
                    disabled={!noteContent.trim()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      noteContent.trim()
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                    title="Copy note to clipboard"
                  >
                    {copiedNote ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNote ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleExportCurrentNote}
                    disabled={!noteContent.trim() || !activeTopicInfo}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      noteContent.trim() && activeTopicInfo
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800'
                        : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                    title="Export note as Markdown (.md)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

            </aside>
          )}

        </div>
      </div>

      {/* Floating Notes Drawer on Mobile/Tablet */}
      {showNotesDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Lesson Notes</h3>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Notes are saved locally for <strong className="text-slate-700 dark:text-slate-300">{activeTopicInfo?.topic.title}</strong>
            </p>
            <textarea
              value={noteContent}
              onChange={handleSaveNote}
              placeholder="Type your notes in your own words..."
              className="w-full h-80 text-sm p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {/* Copy & Export Actions in Mobile Drawer */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCopyCurrentNote}
                disabled={!noteContent.trim()}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  noteContent.trim()
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                title="Copy note to clipboard"
              >
                {copiedNote ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNote ? 'Copied!' : 'Copy Note'}</span>
              </button>
              <button
                onClick={handleExportCurrentNote}
                disabled={!noteContent.trim() || !activeTopicInfo}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  noteContent.trim() && activeTopicInfo
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                title="Export note as Markdown (.md)"
              >
                <Download className="w-4 h-4" />
                <span>Export .md</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowNotesDrawer(false)}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      )}

    </div>
  );
};
