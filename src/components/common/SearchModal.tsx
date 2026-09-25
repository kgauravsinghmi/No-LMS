import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Course } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSelectTopic: (courseId: string, topicId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSelectTopic
}) => {
  const [query, setQuery] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled by parent or opened
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: {
      courseId: string;
      courseTitle: string;
      moduleTitle: string;
      topicId: string;
      topicTitle: string;
      summary: string;
      readingTime: number;
      matchedIn: 'title' | 'summary' | 'content';
    }[] = [];

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          const inTitle = topic.title.toLowerCase().includes(q);
          const inSummary = (topic.summary || '').toLowerCase().includes(q);
          const inContent = topic.content.toLowerCase().includes(q);

          if (inTitle || inSummary || inContent) {
            results.push({
              courseId: course.id,
              courseTitle: course.title,
              moduleTitle: module.title,
              topicId: topic.id,
              topicTitle: topic.title,
              summary: topic.summary || topic.content.slice(0, 120) + '...',
              readingTime: topic.readingTimeMinutes,
              matchedIn: inTitle ? 'title' : inSummary ? 'summary' : 'content'
            });
          }
        });
      });
    });

    return results;
  }, [query, courses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10">

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, architecture, topics, code keywords..."
            className="flex-1 bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p>Type any keyword to search across all courses and articles</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>No matching lessons found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for broader terms like &ldquo;React&rdquo;, &ldquo;Cache&rdquo;, or &ldquo;Architecture&rdquo;</p>
            </div>
          ) : (
            searchResults.map(result => (
              <button
                key={`${result.courseId}-${result.topicId}`}
                onClick={() => {
                  onSelectTopic(result.courseId, result.topicId);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-colors flex items-start justify-between gap-4 group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <span className="truncate max-w-[200px]">{result.courseTitle}</span>
                    <span>&bull;</span>
                    <span className="text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{result.moduleTitle}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {result.topicTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {result.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-2 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span className="text-[11px] font-medium hidden sm:inline">{result.readingTime} min</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found</span>
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>to open</span>
          </div>
        </div>

      </div>
    </div>
  );
};
