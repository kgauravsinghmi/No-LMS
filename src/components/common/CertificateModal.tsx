import React, { useState } from 'react';
import { Award, X, Printer, Sparkles, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Course, UserProgress } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  progress: UserProgress;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  course,
  progress
}) => {
  const [learnerName, setLearnerName] = useState('Senior Full-Stack Engineer');
  const [isEditingName, setIsEditingName] = useState(false);

  if (!isOpen) return null;

  const allTopics = course.modules.flatMap(m => m.topics);
  const completedCount = allTopics.filter(t => progress.completedTopicIds.includes(t.id)).length;
  const themeStyle = GRADIENT_THEMES[course.theme] || GRADIENT_THEMES['indigo-violet'];
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 p-6 sm:p-10 print:border-none print:shadow-none print:rounded-none print:p-8">

        {/* Close and Print Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verified Certificate of Completion
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Frame */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-2 border-indigo-100 dark:border-slate-800 shadow-inner overflow-hidden text-center">

          {/* Subtle Ambient Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-r from-indigo-400/20 via-fuchsia-400/20 to-amber-400/20 blur-3xl pointer-events-none" />

          {/* Certificate Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mx-auto mb-6">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Certificate of Completion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
              Luminary Knowledge Studio
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            This is to certify that
          </p>

          {/* Learner Name with click-to-edit */}
          <div className="my-4">
            {isEditingName ? (
              <input
                type="text"
                value={learnerName}
                autoFocus
                onBlur={() => setIsEditingName(false)}
                onChange={(e) => setLearnerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center border-b-2 border-indigo-500 bg-transparent focus:outline-none"
              />
            ) : (
              <h3
                onClick={() => setIsEditingName(true)}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display cursor-pointer hover:text-indigo-600 transition-colors inline-block"
                title="Click to change your name"
              >
                {learnerName}
              </h3>
            )}
            <p className="text-[11px] text-slate-400 mt-1 print:hidden">
              (Click name to customize before printing)
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
            has successfully mastered and completed all modules, lessons, and interactive architecture checks for:
          </p>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 max-w-md mx-auto shadow-xs mb-8">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              {course.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {course.modules.length} Modules &bull; {completedCount} Lessons &bull; {course.estimatedHours} Hours
            </p>
          </div>

          {/* Verification & Signatures Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Curriculum</p>
                <p className="text-[11px] text-slate-400">Issued on {completionDate}</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">LUMINARY-VERIFIED</p>
              <p className="text-[10px] text-slate-400">ID: LMS-{course.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
