import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sun,
  Moon,
  Shield,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Award,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { AdminUser, Course, UserProgress, ViewMode } from '../../types';
import { storageService } from '../../services/storage';
import { UserMenu } from '../auth/UserMenu';
import { useAuthStore } from '../../stores/useAuthStore';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  adminUser: AdminUser | null;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  courses: Course[];
  progress: UserProgress;
  onDataReset: () => void;
  onImportSuccess: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  courses,
  progress,
  onDataReset,
  onImportSuccess
}) => {
  const { permissions, openAuthModal } = useAuthStore();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if any course is 100% completed
  const completedCoursesCount = courses.filter(course => {
    const allTopics = course.modules.flatMap(m => m.topics);
    if (allTopics.length === 0) return false;
    return allTopics.every(t => progress.completedTopicIds.includes(t.id));
  }).length;

  const handleExport = () => {
    const jsonStr = storageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luminary-lms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowSettingsMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importDatabaseJSON(content);
      if (res.success) {
        alert(res.message);
        onImportSuccess();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
    setShowSettingsMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  Luminary<span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">LMS</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  Minimal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Knowledge in Your Words</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'catalog'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => onNavigate('learning-hub')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'learning-hub'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>My Learning</span>
              {progress.completedTopicIds.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {progress.completedTopicIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('reference')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'reference'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Cheat Sheets</span>
            </button>

            {completedCoursesCount > 0 && (
              <button
                onClick={() => onNavigate('certificate')}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentView === 'certificate'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certificates ({completedCoursesCount})</span>
              </button>
            )}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">

          {/* Quick Search Bar trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search topics...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Data Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
              title="Backup, Export, & Data Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettingsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-fade-in text-sm">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Data & Portability
                  </div>

                  <button
                    onClick={() => {
                      if (!permissions.canExportDatabase) {
                        openAuthModal('presets', 'canExportDatabase');
                        setShowSettingsMenu(false);
                        return;
                      }
                      handleExport();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-500" />
                    <span>Export Database (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!permissions.canImportDatabase) {
                        openAuthModal('presets', 'canImportDatabase');
                        setShowSettingsMenu(false);
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>Import Database</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    onClick={() => {
                      if (!permissions.canResetSystem) {
                        openAuthModal('presets', 'canResetSystem');
                        setShowSettingsMenu(false);
                        return;
                      }
                      if (confirm('Reset courses to initial default sample curriculum? Any custom courses will be replaced.')) {
                        onDataReset();
                        setShowSettingsMenu(false);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors mt-1 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-rose-500" />
                    <span>Reset to Default Courses</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Admin / Authoring Studio Button */}
          {permissions.canAccessAdminStudio ? (
            <button
              onClick={() => onNavigate(currentView === 'admin' ? 'catalog' : 'admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{currentView === 'admin' ? 'Exit Studio' : 'Author Studio'}</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('presets', 'canAccessAdminStudio')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Switch role to Admin or Instructor to open Studio"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Studio</span>
            </button>
          )}

          {/* User Persona & Role Switcher Menu */}
          <UserMenu />

        </div>
      </div>
    </header>
  );
};
