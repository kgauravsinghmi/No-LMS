import React, { useState, useEffect } from 'react';
import { Course, UserProgress, AdminUser, ViewMode } from './types';
import { storageService } from './services/storage';
import { Header } from './components/common/Header';
import { CourseCatalog } from './components/catalog/CourseCatalog';
import { CourseReader } from './components/reader/CourseReader';
import { AdminStudio } from './components/admin/AdminStudio';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { SearchModal } from './components/common/SearchModal';
import { CertificateModal } from './components/common/CertificateModal';
import { LearningHub } from './components/learning/LearningHub';
import { CheatSheetHub } from './components/reference/CheatSheetHub';
import { RoleGuard } from './components/auth/RoleGuard';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './stores/useAuthStore';

export function App() {
  // Application Data State
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCourses());
  const [progress, setProgress] = useState<UserProgress>(() => storageService.getProgress());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => storageService.getAdminSession());

  // Navigation & View State
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [editModuleId, setEditModuleId] = useState<string>('');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('luminary_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark class to html/body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('luminary_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('luminary_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Listen to custom storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setCourses(storageService.getCourses());
      setProgress(storageService.getProgress());
    };
    window.addEventListener('luminary_courses_updated', handleUpdate);
    return () => window.removeEventListener('luminary_courses_updated', handleUpdate);
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshData = () => {
    setCourses(storageService.getCourses());
    setProgress(storageService.getProgress());
  };

  const handleSelectCourse = (courseId: string, topicId?: string) => {
    setSelectedCourseId(courseId);
    if (topicId) setSelectedTopicId(topicId);
    setCurrentView('reader');
  };

  const handleOpenAdminEditTopic = (courseId: string, moduleId: string, topicId: string) => {
    setSelectedCourseId(courseId);
    setEditModuleId(moduleId);
    setSelectedTopicId(topicId);
    setCurrentView('admin');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsAdminLoginOpen(false);
  };

  const handleAdminLogout = () => {
    storageService.logoutAdmin();
    setAdminUser(null);
    if (currentView === 'admin') {
      setCurrentView('catalog');
    }
  };

  const handleOpenCertificate = (course: Course) => {
    setCertificateCourse(course);
    setIsCertificateOpen(true);
  };

  // Find active course for reader
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">

      {/* Global Header Bar */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'certificate') {
            const completed = courses.find(c => {
              const allT = c.modules.flatMap(m => m.topics);
              return allT.length > 0 && allT.every(t => progress.completedTopicIds.includes(t.id));
            });
            if (completed) {
              handleOpenCertificate(completed);
            }
          } else {
            setCurrentView(view);
          }
        }}
        adminUser={adminUser}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        courses={courses}
        progress={progress}
        onDataReset={refreshData}
        onImportSuccess={refreshData}
      />

      {/* Main App Router View */}
      <div className="flex-1">
        {currentView === 'catalog' && (
          <CourseCatalog
            courses={courses}
            progress={progress}
            adminUser={adminUser}
            onSelectCourse={handleSelectCourse}
            onOpenCreateCourse={() => {
              if (adminUser) setCurrentView('admin');
              else setIsAdminLoginOpen(true);
            }}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {currentView === 'reader' && activeCourse && (
          <CourseReader
            course={activeCourse}
            initialTopicId={selectedTopicId}
            progress={progress}
            adminUser={adminUser}
            onBackToCatalog={() => setCurrentView('catalog')}
            onOpenAdminEditTopic={handleOpenAdminEditTopic}
            onProgressUpdate={setProgress}
            onOpenCertificate={handleOpenCertificate}
          />
        )}

        {currentView === 'learning-hub' && (
          <LearningHub
            courses={courses}
            progress={progress}
            onSelectCourse={handleSelectCourse}
            onNavigateToCatalog={() => setCurrentView('catalog')}
            onOpenCertificate={handleOpenCertificate}
          />
        )}

        {currentView === 'reference' && (
          <CheatSheetHub />
        )}

        {currentView === 'admin' && (
          <RoleGuard requiredPermission="canAccessAdminStudio">
            <AdminStudio
              adminUser={adminUser || { username: 'Administrator', role: 'admin', token: 'admin-studio-token' }}
              courses={courses}
              initialCourseId={selectedCourseId}
              initialModuleId={editModuleId}
              initialTopicId={selectedTopicId}
              onCoursesUpdated={refreshData}
              onNavigateToCourse={handleSelectCourse}
              onExitAdmin={() => setCurrentView('catalog')}
            />
          </RoleGuard>
        )}
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        courses={courses}
        onSelectTopic={(courseId, topicId) => {
          handleSelectCourse(courseId, topicId);
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Auth & RBAC Modal */}
      <AuthModal />

      {/* Certificate Modal */}
      {certificateCourse && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          course={certificateCourse}
          progress={progress}
        />
      )}

    </div>
  );
}

export default App;
