import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  BookOpen,
  Layers,
  FileText,
  Sparkles,
  Check,
  Eye,
  Code,
  List,
  AlertCircle,
  HelpCircle,
  Clock,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Palette,
  Layout
} from 'lucide-react';
import { Course, Module, Topic, QuizQuestion, GradientTheme, AdminUser } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';
import { AVAILABLE_ICONS, getCourseIcon } from '../../utils/icons';
import { storageService } from '../../services/storage';
import { MarkdownRenderer } from '../content/MarkdownRenderer';

interface AdminStudioProps {
  adminUser: AdminUser;
  courses: Course[];
  initialCourseId?: string;
  initialModuleId?: string;
  initialTopicId?: string;
  onCoursesUpdated: () => void;
  onNavigateToCourse: (courseId: string, topicId?: string) => void;
  onExitAdmin: () => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({
  adminUser,
  courses,
  initialCourseId,
  initialModuleId,
  initialTopicId,
  onCoursesUpdated,
  onNavigateToCourse,
  onExitAdmin
}) => {
  // Selected course
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    return initialCourseId || courses[0]?.id || '';
  });

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  // Selected topic for editing
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    if (initialModuleId) return initialModuleId;
    return courses[0]?.modules[0]?.id || '';
  });

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (initialTopicId) return initialTopicId;
    return courses[0]?.modules[0]?.topics[0]?.id || '';
  });

  // Modal / View State
  const [isCreatingCourse, setIsCreatingCourse] = useState<boolean>(courses.length === 0);
  const [activeEditorTab, setActiveEditorTab] = useState<'write' | 'preview' | 'quiz' | 'settings'>('write');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Course Form State (for creation or editing metadata)
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Architecture',
    iconName: 'Sparkles',
    theme: 'indigo-violet' as GradientTheme,
    estimatedHours: 4,
    tags: 'System Design, Architecture'
  });

  // Topic Form State
  const [topicForm, setTopicForm] = useState<{
    title: string;
    summary: string;
    readingTimeMinutes: number;
    content: string;
    keyTakeaways: string[];
    newTakeaway: string;
    quiz: QuizQuestion[];
  }>({
    title: '',
    summary: '',
    readingTimeMinutes: 5,
    content: '',
    keyTakeaways: [],
    newTakeaway: '',
    quiz: []
  });

  // New Module form
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddModuleInput, setShowAddModuleInput] = useState(false);

  // Sync selected topic when active topic changes
  useEffect(() => {
    if (selectedCourse) {
      let found = false;
      for (const m of selectedCourse.modules) {
        const top = m.topics.find(t => t.id === selectedTopicId);
        if (top) {
          setSelectedModuleId(m.id);
          setTopicForm({
            title: top.title,
            summary: top.summary || '',
            readingTimeMinutes: top.readingTimeMinutes,
            content: top.content,
            keyTakeaways: top.keyTakeaways || [],
            newTakeaway: '',
            quiz: top.quiz ? [...top.quiz] : []
          });
          found = true;
          break;
        }
      }

      // If not found, pick first available
      if (!found && selectedCourse.modules[0]?.topics[0]) {
        const firstM = selectedCourse.modules[0];
        const firstT = firstM.topics[0];
        setSelectedModuleId(firstM.id);
        setSelectedTopicId(firstT.id);
        setTopicForm({
          title: firstT.title,
          summary: firstT.summary || '',
          readingTimeMinutes: firstT.readingTimeMinutes,
          content: firstT.content,
          keyTakeaways: firstT.keyTakeaways || [],
          newTakeaway: '',
          quiz: firstT.quiz ? [...firstT.quiz] : []
        });
      }
    }
  }, [selectedCourse, selectedTopicId]);

  // Load course form if editing course
  useEffect(() => {
    if (selectedCourse) {
      setCourseForm({
        title: selectedCourse.title,
        subtitle: selectedCourse.subtitle,
        description: selectedCourse.description,
        category: selectedCourse.category,
        iconName: selectedCourse.iconName,
        theme: selectedCourse.theme,
        estimatedHours: selectedCourse.estimatedHours,
        tags: selectedCourse.tags.join(', ')
      });
    }
  }, [selectedCourse]);

  // Handle Saving Topic Content
  const handleSaveTopic = () => {
    if (!selectedCourseId || !selectedModuleId || !selectedTopicId) return;

    setSaveStatus('saving');

    // Estimate reading time from words if not manually set
    const words = topicForm.content.split(/\s+/).length;
    const estTime = Math.max(1, Math.ceil(words / 180));

    storageService.updateTopic(selectedCourseId, selectedModuleId, selectedTopicId, {
      title: topicForm.title,
      summary: topicForm.summary,
      readingTimeMinutes: topicForm.readingTimeMinutes || estTime,
      content: topicForm.content,
      keyTakeaways: topicForm.keyTakeaways,
      quiz: topicForm.quiz.length > 0 ? topicForm.quiz : undefined
    });

    onCoursesUpdated();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Handle Adding a New Topic
  const handleAddNewTopic = (moduleId: string) => {
    if (!selectedCourseId) return;
    const newTopic = storageService.createTopic(selectedCourseId, moduleId, {
      title: 'New Topic in Your Words',
      summary: 'Brief overview of what the reader will master in this lesson.',
      readingTimeMinutes: 4,
      content: `## Introduction\n\nExplain the foundational concept here in your own words. Write freely using clear, conversational engineering prose.\n\n> [!TIP]\n> Emphasize a practical production tip or rule of thumb here.\n\n### Key Concepts\n- Point 1\n- Point 2\n\n\`\`\`typescript\n// Example clean code snippet\nfunction solveProblem(): boolean {\n  return true;\n}\n\`\`\`\n`
    });

    if (newTopic) {
      onCoursesUpdated();
      setSelectedModuleId(moduleId);
      setSelectedTopicId(newTopic.id);
      setActiveEditorTab('write');
    }
  };

  // Handle Adding a New Module
  const handleAddNewModule = () => {
    if (!selectedCourseId || !newModuleName.trim()) return;
    const newMod = storageService.createModule(selectedCourseId, {
      title: newModuleName.trim(),
      description: 'Module overview',
      topics: []
    });

    if (newMod) {
      // Also automatically add a starter topic in that module
      const firstTopic = storageService.createTopic(selectedCourseId, newMod.id, {
        title: `${newModuleName.trim()} - Overview`,
        summary: 'Introductory lesson',
        readingTimeMinutes: 3,
        content: `## ${newModuleName.trim()}\n\nWelcome to this chapter. Write your notes and curriculum content here.\n`
      });

      onCoursesUpdated();
      setNewModuleName('');
      setShowAddModuleInput(false);
      setSelectedModuleId(newMod.id);
      if (firstTopic) setSelectedTopicId(firstTopic.id);
    }
  };

  // Handle Creating a Brand New Course
  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = courseForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const newCourse = storageService.createCourse({
      title: courseForm.title,
      subtitle: courseForm.subtitle,
      description: courseForm.description,
      category: courseForm.category,
      iconName: courseForm.iconName,
      theme: courseForm.theme,
      estimatedHours: courseForm.estimatedHours,
      tags: tagsArray,
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: Foundations',
          description: 'Getting started',
          order: 1,
          topics: [
            {
              id: `top-${Date.now()}`,
              title: 'Welcome & Core Principles',
              slug: 'welcome-core-principles',
              order: 1,
              isPublished: true,
              summary: 'An introductory overview crafted in your own words.',
              readingTimeMinutes: 3,
              content: `## Welcome to ${courseForm.title}\n\nThis course is authored to give you direct, high-signal knowledge.\n\n> [!NOTE]\n> Feel free to add more modules and topics from the Admin Studio at any time!\n`,
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ]
    });

    onCoursesUpdated();
    setIsCreatingCourse(false);
    setSelectedCourseId(newCourse.id);
    setSelectedModuleId(newCourse.modules[0].id);
    setSelectedTopicId(newCourse.modules[0].topics[0].id);
  };

  // Delete Course
  const handleDeleteCourse = () => {
    if (!selectedCourse) return;
    if (confirm(`Are you sure you want to permanently delete "${selectedCourse.title}"?`)) {
      storageService.deleteCourse(selectedCourse.id);
      onCoursesUpdated();
      setSelectedCourseId(courses[0]?.id || '');
    }
  };

  // Delete Topic
  const handleDeleteTopic = (moduleId: string, topicId: string) => {
    if (!selectedCourseId) return;
    if (confirm('Delete this lesson topic?')) {
      storageService.deleteTopic(selectedCourseId, moduleId, topicId);
      onCoursesUpdated();
    }
  };

  // Formatting helpers for Markdown toolbar
  const insertMarkdownText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = topicForm.content.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const newContent = topicForm.content.substring(0, start) + replacement + topicForm.content.substring(end);
    setTopicForm(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // Takeaway helpers
  const handleAddTakeaway = () => {
    if (!topicForm.newTakeaway.trim()) return;
    setTopicForm(prev => ({
      ...prev,
      keyTakeaways: [...prev.keyTakeaways, prev.newTakeaway.trim()],
      newTakeaway: ''
    }));
  };

  const handleRemoveTakeaway = (idx: number) => {
    setTopicForm(prev => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== idx)
    }));
  };

  // Quiz helpers
  const handleAddQuizQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: 'What is the primary architectural benefit of this concept?',
      options: [
        'Reduced latency and predictable throughput',
        'Increased overhead and complex dependencies',
        'Slower query execution',
        'Manual cache invalidation requirement'
      ],
      correctAnswer: 0,
      explanation: 'Clear, predictable data flow minimizes bottlenecks and keeps services decoupled.'
    };
    setTopicForm(prev => ({
      ...prev,
      quiz: [...prev.quiz, newQ]
    }));
  };

  const handleUpdateQuizQuestion = (index: number, updated: QuizQuestion) => {
    setTopicForm(prev => {
      const copy = [...prev.quiz];
      copy[index] = updated;
      return { ...prev, quiz: copy };
    });
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setTopicForm(prev => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index)
    }));
  };

  const currentTheme = selectedCourse ? (GRADIENT_THEMES[selectedCourse.theme] || GRADIENT_THEMES['indigo-violet']) : GRADIENT_THEMES['indigo-violet'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors">

      {/* Top Admin Studio Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Studio Badge & Course Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Creator Studio</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {adminUser.username}
                </span>
              </h2>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Select Course Dropdown */}
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="hidden sm:block text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreatingCourse(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Course</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">

          {selectedCourse && (
            <button
              onClick={() => onNavigateToCourse(selectedCourse.id, selectedTopicId)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Course</span>
            </button>
          )}

          <button
            onClick={handleSaveTopic}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : saveStatus === 'saving' ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Topic</span>
              </>
            )}
          </button>

          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Studio View */}
      {isCreatingCourse ? (
        /* Create New Course View */
        <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                  Create New Course Syllabus
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Craft an entirely new curriculum written in your own words.
                </p>
              </div>
              {courses.length > 0 && (
                <button
                  onClick={() => setIsCreatingCourse(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems & Modern Resiliency"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  placeholder="e.g. A deep dive into consensus, replication, and fault tolerance"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Course Description & Objectives
                </label>
                <textarea
                  rows={3}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Describe what learners will experience and why these concepts matter..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                    placeholder="Architecture"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Estimated Time (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.estimatedHours}
                    onChange={(e) => setCourseForm({ ...courseForm, estimatedHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Search Tags
                  </label>
                  <input
                    type="text"
                    value={courseForm.tags}
                    onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>

              {/* Gradient Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Select Light Accent Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(GRADIENT_THEMES) as GradientTheme[]).map(themeKey => {
                    const theme = GRADIENT_THEMES[themeKey];
                    const isSelected = courseForm.theme === themeKey;
                    return (
                      <button
                        type="button"
                        key={themeKey}
                        onClick={() => setCourseForm({ ...courseForm, theme: themeKey })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/40'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-4 rounded-lg bg-gradient-to-r ${theme.pill} mb-2`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block capitalize">
                          {themeKey.replace('-', ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Course Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map(iconItem => {
                    const iconKey = iconItem.name;
                    const isSelected = courseForm.iconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setCourseForm({ ...courseForm, iconName: iconKey })}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                        title={iconItem.label || iconKey}
                      >
                        {getCourseIcon(iconKey, 'w-5 h-5')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Create & Start Authoring
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : selectedCourse ? (
        /* Workspace with Dynamic Outline Sidebar and Rich Editor */
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* LEFT SIDEBAR: Dynamic Curriculum Structure Builder */}
          <aside className="w-80 shrink-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 shadow-xs flex flex-col justify-between max-h-[calc(100vh-6.5rem)] sticky top-20 overflow-y-auto">
            <div>

              {/* Course Title Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    {getCourseIcon(selectedCourse.iconName, 'w-4 h-4')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                      {selectedCourse.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Module & Topic Tree */}
              <div className="space-y-4">
                {selectedCourse.modules.map((module, modIdx) => (
                  <div key={module.id} className="space-y-1">

                    {/* Module Title */}
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          {modIdx + 1}
                        </span>
                        <span className="truncate">{module.title}</span>
                      </div>
                      <button
                        onClick={() => handleAddNewTopic(module.id)}
                        className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="Add Topic to this Module"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Topics List */}
                    <div className="pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 py-1">
                      {module.topics.map(topic => {
                        const isSelected = topic.id === selectedTopicId;
                        return (
                          <div
                            key={topic.id}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all group ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border-l-2 border-indigo-600'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setSelectedModuleId(module.id);
                                setSelectedTopicId(topic.id);
                              }}
                              className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{topic.title}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteTopic(module.id, topic.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Module Input / Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {showAddModuleInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      placeholder="Module name (e.g. Module 3: Advanced Topics)"
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNewModule}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                      >
                        Add Module
                      </button>
                      <button
                        onClick={() => setShowAddModuleInput(false)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddModuleInput(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Module</span>
                  </button>
                )}
              </div>

            </div>

            {/* Delete Course Link */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleDeleteCourse}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete This Course</span>
              </button>
            </div>
          </aside>

          {/* RIGHT: Main Content Editor & Split Preview Studio */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Topic Metadata Bar */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    placeholder="Enter lesson title..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Estimated Reading Time (Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={topicForm.readingTimeMinutes}
                    onChange={(e) => setTopicForm({ ...topicForm, readingTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Summary / Lead Paragraph
                </label>
                <input
                  type="text"
                  value={topicForm.summary}
                  onChange={(e) => setTopicForm({ ...topicForm, summary: e.target.value })}
                  placeholder="One sentence summary of key insights..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveEditorTab('write')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeEditorTab === 'write'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Write Content (Markdown)
                </button>
                <button
                  onClick={() => setActiveEditorTab('preview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeEditorTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Live Preview
                </button>
                <button
                  onClick={() => setActiveEditorTab('quiz')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeEditorTab === 'quiz'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Knowledge Quiz ({topicForm.quiz.length})</span>
                </button>
                <button
                  onClick={() => setActiveEditorTab('settings')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeEditorTab === 'settings'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Takeaways ({topicForm.keyTakeaways.length})</span>
                </button>
              </div>

            </div>

            {/* TAB 1: Markdown Writing Canvas */}
            {activeEditorTab === 'write' && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">

                {/* Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs">
                  <button
                    onClick={() => insertMarkdownText('## ', '\n', 'Section Heading')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-bold"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => insertMarkdownText('### ', '\n', 'Sub Heading')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-bold"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => insertMarkdownText('**', '**', 'bold text')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => insertMarkdownText('*', '*', 'italic text')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 italic"
                  >
                    I
                  </button>
                  <button
                    onClick={() => insertMarkdownText('`', '`', 'code')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-mono"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    onClick={() => insertMarkdownText('```typescript\n', '\n```', '// Your code here')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100"
                  >
                    Code Block
                  </button>
                  <button
                    onClick={() => insertMarkdownText('> [!TIP]\n> ', '\n', 'Write high-value insight here')}
                    className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                  >
                    + Tip Callout
                  </button>
                  <button
                    onClick={() => insertMarkdownText('> [!NOTE]\n> ', '\n', 'Write important note here')}
                    className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                  >
                    + Note Callout
                  </button>
                  <button
                    onClick={() => insertMarkdownText('> [!WARNING]\n> ', '\n', 'Write critical pitfall to avoid')}
                    className="px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold"
                  >
                    + Warning Callout
                  </button>
                </div>

                {/* Text Area */}
                <textarea
                  id="markdown-editor"
                  value={topicForm.content}
                  onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                  placeholder="Write your lesson content in your own words using Markdown..."
                  rows={22}
                  className="w-full p-6 text-sm font-mono text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none resize-none leading-relaxed"
                />

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{topicForm.content.split(/\s+/).filter(Boolean).length} words &bull; ~{Math.max(1, Math.ceil(topicForm.content.split(/\s+/).filter(Boolean).length / 180))} min read</span>
                  <span>Markdown & Callouts supported</span>
                </div>
              </div>
            )}

            {/* TAB 2: Live Preview */}
            {activeEditorTab === 'preview' && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${currentTheme.badge}`}>
                    {topicForm.title || 'Topic Preview'}
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-3">
                    {topicForm.title}
                  </h1>
                  {topicForm.summary && (
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      {topicForm.summary}
                    </p>
                  )}
                </div>

                <MarkdownRenderer
                  content={topicForm.content}
                  quiz={topicForm.quiz}
                  topicId={selectedTopicId}
                />
              </div>
            )}

            {/* TAB 3: Interactive Quiz Builder */}
            {activeEditorTab === 'quiz' && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                      Interactive Knowledge Check Quiz
                    </h3>
                    <p className="text-xs text-slate-500">
                      Test the reader&rsquo;s retention with multi-choice questions.
                    </p>
                  </div>
                  <button
                    onClick={handleAddQuizQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {topicForm.quiz.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No quiz questions yet. Click &ldquo;Add Question&rdquo; to build interactive checks.</p>
                  </div>
                ) : (
                  topicForm.quiz.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Question #{qIdx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveQuizQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuizQuestion(qIdx, { ...q, question: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        placeholder="Type question here..."
                      />

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Options (Select the radio button for the correct answer)
                        </label>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => handleUpdateQuizQuestion(qIdx, { ...q, correctAnswer: optIdx })}
                              className="text-indigo-600"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuizQuestion(qIdx, { ...q, options: newOpts });
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Explanation (shown upon completing the quiz)
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuizQuestion(qIdx, { ...q, explanation: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                          placeholder="Why this answer is correct..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: Key Takeaways */}
            {activeEditorTab === 'settings' && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                    Core Lesson Takeaways
                  </h3>
                  <p className="text-xs text-slate-500">
                    Highlighted summary points displayed at the top of the lesson article.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topicForm.newTakeaway}
                    onChange={(e) => setTopicForm({ ...topicForm, newTakeaway: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTakeaway()}
                    placeholder="Type a core takeaway (e.g. Always decouple write paths using queues)..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    onClick={handleAddTakeaway}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Add Point
                  </button>
                </div>

                <div className="space-y-2">
                  {topicForm.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{takeaway}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTakeaway(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

        </div>
      ) : null}

    </div>
  );
};
