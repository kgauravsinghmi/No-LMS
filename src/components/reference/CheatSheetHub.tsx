import React, { useState, useMemo } from 'react';
import {
  Code,
  Copy,
  Check,
  Search,
  Zap,
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  Shield,
  Lightbulb,
  Tag
} from 'lucide-react';
import { INITIAL_CHEATSHEETS } from '../../data/initialCheatSheets';
import { CheatSheetItem } from '../../types';

export const CheatSheetHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    INITIAL_CHEATSHEETS.forEach(item => set.add(item.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return INITIAL_CHEATSHEETS.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keyRule.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.code.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">

      {/* Header Banner */}
      <section className="relative overflow-hidden pt-8 pb-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-indigo-50/20 to-transparent dark:from-slate-900 dark:via-slate-900/40 dark:to-transparent">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/60 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span>High-Signal Engineering Quick Reference</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Cheat Sheets & <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Patterns</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Production architectural invariants, mental models, and copy-ready syntax snippets curated for high-velocity full-stack engineering.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets, rules, keywords, tags (e.g. redis, startTransition, streams)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Snippets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing {filteredItems.length} curated patterns
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <FileCode className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching cheat sheets found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or switching category filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map(item => {
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Top Header Card */}
                  <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {item.category}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs font-mono font-medium text-slate-400">{item.language}</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Mental Model Banner */}
                    <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Core Mental Model: </span>
                        <span>{item.keyRule}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Area */}
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(item.code, item.id)}
                      className={`absolute right-4 top-4 z-10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 backdrop-blur-md'
                      }`}
                      title="Copy code snippet"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    <pre className="p-5 sm:p-6 bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto rounded-b-3xl">
                      <code>{item.code}</code>
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
