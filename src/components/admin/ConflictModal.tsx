import React, { useState } from 'react';
import {
  AlertTriangle,
  GitMerge,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  User,
  Clock,
  FileText,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useConflictStore } from '../../stores/useConflictStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { MergeStrategy } from '../../types/conflict';

export const ConflictModal: React.FC = () => {
  const {
    isOpen,
    conflictData,
    selectedStrategy,
    manualMergedContent,
    closeConflictModal,
    setSelectedStrategy,
    setManualMergedContent,
    resolveConflict
  } = useConflictStore();

  const { user } = useAuthStore();
  const [activeViewTab, setActiveViewTab] = useState<'diff' | 'editor'>('diff');

  if (!isOpen || !conflictData) return null;

  const { localEntity, remoteEntity, lastEditedBy, conflictingFields, diffChunks } = conflictData;

  const handleConfirmResolution = () => {
    resolveConflict({
      id: user?.id || 'editor-local',
      name: user?.name || 'Local Author',
      email: user?.email,
      role: user?.role
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 dark:border-amber-900/40 bg-amber-500/10 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Simultaneous Edit Conflict Detected
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Optimistic Concurrency
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Another author updated <span className="font-semibold text-slate-900 dark:text-white">"{remoteEntity.title}"</span> while you were drafting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeConflictModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <User className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">
              Server Modified By:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {lastEditedBy?.name || 'Remote Collaborator'} ({lastEditedBy?.role || 'Instructor'})
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Layers className="w-4 h-4 text-purple-500 shrink-0" />
            <span>
              Conflicting Fields:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {conflictingFields.join(', ') || 'Content & Checksum'}
              </strong>
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveViewTab('diff')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeViewTab === 'diff'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Side-by-Side Diff View
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('editor')}
              className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                activeViewTab === 'editor'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Manual Merge Editor
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" />
            <span>Added</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500 ml-2" />
            <span>Removed</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500 ml-2" />
            <span>Modified</span>
          </div>
        </div>

        {/* Main Diff / Editor Canvas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeViewTab === 'diff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Server Version */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                    Latest Server Version (v{remoteEntity.version || 1})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    {remoteEntity.revisionHash || 'rev_remote'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {remoteEntity.title}
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    {remoteEntity.summary}
                  </div>
                </div>

                <div className="flex-1 font-mono text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto space-y-1">
                  {(diffChunks || []).map((chunk, idx) => (
                    <div
                      key={idx}
                      className={`px-1.5 py-0.5 rounded leading-relaxed break-all ${
                        chunk.type === 'removed'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-l-2 border-rose-500'
                          : chunk.type === 'modified'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-l-2 border-amber-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 select-none mr-2 font-mono">
                        {chunk.lineNumber}
                      </span>
                      {chunk.remoteContent || <span className="text-slate-400 italic">(empty)</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Local Draft */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    Your Local Draft (Unsaved)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    {localEntity.revisionHash || 'rev_local'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {localEntity.title}
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    {localEntity.summary}
                  </div>
                </div>

                <div className="flex-1 font-mono text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto space-y-1">
                  {(diffChunks || []).map((chunk, idx) => (
                    <div
                      key={idx}
                      className={`px-1.5 py-0.5 rounded leading-relaxed break-all ${
                        chunk.type === 'added'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500'
                          : chunk.type === 'modified'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-l-2 border-amber-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 select-none mr-2 font-mono">
                        {chunk.lineNumber}
                      </span>
                      {chunk.localContent || <span className="text-slate-400 italic">(empty)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeViewTab === 'editor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Manual Unified Content Editor
                </span>
                <span className="text-slate-500 text-[11px]">
                  Edit below to synthesize both versions before committing
                </span>
              </div>

              <textarea
                value={manualMergedContent}
                onChange={(e) => setManualMergedContent(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-2xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Compose the final resolved Markdown content..."
              />
            </div>
          )}

          {/* Strategy Selection Radio Group */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Select Resolution Strategy:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Keep Local */}
              <button
                type="button"
                onClick={() => setSelectedStrategy('keep-local')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStrategy === 'keep-local'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedStrategy === 'keep-local' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                  }`}>
                    {selectedStrategy === 'keep-local' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Overwrite with My Local Draft
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug pl-5.5">
                  Discard server changes and increment version with your current draft.
                </p>
              </button>

              {/* Keep Remote */}
              <button
                type="button"
                onClick={() => setSelectedStrategy('keep-remote')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStrategy === 'keep-remote'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedStrategy === 'keep-remote' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                  }`}>
                    {selectedStrategy === 'keep-remote' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Accept Latest Server Version
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug pl-5.5">
                  Discard your local edits and adopt the server's changes verbatim.
                </p>
              </button>

              {/* Manual Merge */}
              <button
                type="button"
                onClick={() => setSelectedStrategy('manual-merge')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedStrategy === 'manual-merge'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedStrategy === 'manual-merge' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                  }`}>
                    {selectedStrategy === 'manual-merge' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Apply Intelligent Merge
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug pl-5.5">
                  Save synthesized content from the Manual Merge Editor tab.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={closeConflictModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel Resolution
          </button>

          <button
            type="button"
            onClick={handleConfirmResolution}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Selected Strategy &amp; Commit Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
};
