import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Sparkles,
  Check,
  Eye,
  List,
  HelpCircle,
  Shield,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Minus,
  Network,
  Image as ImageIcon,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  ArrowLeft,
  Download,
  AlertCircle,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Layers,
  Edit3,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Monitor,
  Tablet,
  Smartphone,
  Info,
  AlertTriangle,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  HardDriveDownload
} from 'lucide-react';
import { Course, Module, Topic, QuizQuestion, GradientTheme, AdminUser } from '../../types';
import { GRADIENT_THEMES } from '../../utils/theme';
import { AVAILABLE_ICONS, getCourseIcon } from '../../utils/icons';
import { storageService } from '../../services/storage';
import { MarkdownRenderer } from '../content/MarkdownRenderer';
import { ImageInsertModal } from './ImageInsertModal';
import { ConflictModal } from './ConflictModal';
import { useUIStore } from '../../stores/useUIStore';
import { useDraftAutoSave } from '../../hooks/useDraftAutoSave';
import { conflictService } from '../../services/conflict/conflictService';
import { useConflictStore } from '../../stores/useConflictStore';

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

const MERMAID_TEMPLATES = [
  {
    name: 'Flowchart / Architecture',
    desc: 'System flow with nodes, decisions, & microservices',
    code: `\`\`\`mermaid
flowchart TD
    Client[Web & Mobile App] -->|HTTPS / TLS| Gateway[API Gateway & Auth]
    Gateway -->|gRPC| AuthSvc[Auth Service]
    Gateway -->|Internal REST| CoreAPI[Core Microservice]
    CoreAPI -->|Read / Write| PrimaryDB[(Primary PostgreSQL)]
    CoreAPI -->|Cache| RedisCache[(Redis Cluster)]
    CoreAPI -->|Async Event| EventBus[Kafka Event Stream]
\`\`\`\n`
  },
  {
    name: 'Sequence Diagram',
    desc: 'Client-Gateway-Service-DB request lifecycle',
    code: `\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client
    participant GW as API Gateway
    participant Svc as Order Service
    participant DB as Postgres DB
    participant MQ as Event Bus

    Client->>GW: POST /api/v1/orders (JWT Token)
    GW->>GW: Verify Token & Rate Limit
    GW->>Svc: Forward Validated Request
    Svc->>DB: BEGIN TX & Insert Order
    DB-->>Svc: Commit TX (Order #8492)
    Svc->>MQ: Publish OrderCreatedEvent
    Svc-->>GW: HTTP 201 Created (Order DTO)
    GW-->>Client: 201 Response Payload
\`\`\`\n`
  },
  {
    name: 'C4 Container / Layer Diagram',
    desc: 'Architecture boundary and subsystems',
    code: `\`\`\`mermaid
flowchart LR
    subgraph Edge["🌐 Edge Network"]
        CDN["Cloudflare Edge / WAF"]
        LB["NLB / Load Balancer"]
    end

    subgraph AppCluster["⚡ Kubernetes Cluster"]
        direction TB
        Ingress["Traefik Ingress"]
        Pods["Node.js Microservices (x12 Pods)"]
        Worker["Background Cron & Celery Workers"]
    end

    subgraph DataTier["🗄️ Persistence Tier"]
        DB[(Aurora PostgreSQL Multi-AZ)]
        Redis[(Redis In-Memory Cache)]
    end

    Edge --> AppCluster
    AppCluster --> DataTier
\`\`\`\n`
  },
  {
    name: 'State Machine Diagram',
    desc: 'Entity lifecycle transitions and states',
    code: `\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft: Author writes content
    Draft --> InReview: Submit for Peer Review
    InReview --> Approved: Technical QA Passed
    InReview --> Draft: Changes Requested
    Approved --> Published: Deploy to Production
    Published --> Archived: Deprecated
    Archived --> [*]
\`\`\`\n`
  },
  {
    name: 'Git Workflow / Branch Graph',
    desc: 'Git branch lifecycle & merge topology',
    code: `\`\`\`mermaid
gitGraph
    commit id: "Initial Commit"
    branch develop
    checkout develop
    commit id: "Feature: Auth JWT"
    commit id: "Feature: Course Reader"
    branch release/v1.0
    checkout release/v1.0
    commit id: "Bump version 1.0.0"
    checkout main
    merge release/v1.0 id: "Release 1.0.0" tag: "v1.0.0"
    checkout develop
    merge release/v1.0
\`\`\`\n`
  }
];

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
  // Course, Module, Topic Selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || '');

  // Zustand Global UI Store Integration
  const {
    isZenMode,
    toggleZenMode,
    setZenMode,
    editorOutlineCollapsed,
    toggleEditorOutline,
    editorPreviewCollapsed,
    toggleEditorPreview,
    editorPreviewDevice,
    setEditorPreviewDevice,
  } = useUIStore();

  const isOutlineOpen = !editorOutlineCollapsed;
  const isPreviewOpen = !editorPreviewCollapsed;
  const previewViewport = editorPreviewDevice;
  const setPreviewViewport = setEditorPreviewDevice;
  const [activeEditorTab, setActiveEditorTab] = useState<'editor' | 'meta' | 'quiz' | 'takeaways'>('editor');

  // Expanded Modules in Outline Tree
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Modals
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showCourseSettingsModal, setShowCourseSettingsModal] = useState<boolean>(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState<boolean>(false);
  const [showMermaidDropdown, setShowMermaidDropdown] = useState<boolean>(false);

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Drag-and-drop / Image upload state
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active Selected Course
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0] || null;
  }, [courses, selectedCourseId]);

  // Active Selected Module & Topic
  const activeModule = useMemo(() => {
    if (!activeCourse) return null;
    return activeCourse.modules.find((m) => m.id === selectedModuleId) || activeCourse.modules[0] || null;
  }, [activeCourse, selectedModuleId]);

  const activeTopic = useMemo(() => {
    if (!activeModule) return null;
    return activeModule.topics.find((t) => t.id === selectedTopicId) || activeModule.topics[0] || null;
  }, [activeModule, selectedTopicId]);

  // Topic Form State
  const [topicForm, setTopicForm] = useState({
    title: '',
    slug: '',
    summary: '',
    readingTimeMinutes: 5,
    keyTakeaways: [] as string[],
    newTakeaway: '',
    quiz: [] as QuizQuestion[],
    content: ''
  });

  // Course Form State (For creation / editing)
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'Engineering',
    iconName: 'BookOpen',
    theme: 'indigo-violet' as GradientTheme,
    level: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery'
  });

  // Debounced Markdown Content (350ms delay for 60fps typing)
  const [debouncedContent, setDebouncedContent] = useState<string>(topicForm.content);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedContent(topicForm.content);
      setIsDebouncing(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [topicForm.content]);

  // Dual-Tier Offline Auto-Save Engine (IndexedDB + localStorage fallback)
  const {
    recoverableDraft,
    restoreDraft,
    discardDraft,
    status: autoSaveStatus,
  } = useDraftAutoSave({
    courseId: selectedCourseId,
    moduleId: selectedModuleId,
    topic: activeTopic,
    currentData: {
      title: topicForm.title,
      slug: topicForm.slug,
      summary: topicForm.summary,
      readingTimeMinutes: topicForm.readingTimeMinutes,
      keyTakeaways: topicForm.keyTakeaways,
      quiz: topicForm.quiz,
      content: topicForm.content,
    },
    onRestoreDraft: (restoredData) => {
      setTopicForm({
        title: restoredData.title || '',
        slug: restoredData.slug || '',
        summary: restoredData.summary || '',
        readingTimeMinutes: restoredData.readingTimeMinutes || 5,
        keyTakeaways: restoredData.keyTakeaways ? [...restoredData.keyTakeaways] : [],
        newTakeaway: '',
        quiz: restoredData.quiz ? JSON.parse(JSON.stringify(restoredData.quiz)) : [],
        content: restoredData.content || '',
      });
      setDebouncedContent(restoredData.content || '');
      setIsDirty(true);
    },
  });

  // Global Keyboard Shortcut for Zen Mode (Cmd/Ctrl + Shift + F) & Escape to Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Zen Mode: Cmd/Ctrl + Shift + F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        toggleZenMode();
      }
      // Save Shortcut: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveTopic();
      }
      // Exit Zen Mode: Escape
      if (e.key === 'Escape' && isZenMode) {
        setZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, toggleZenMode, setZenMode, topicForm, activeCourse, activeModule, activeTopic]);

  // Sync state when selected Topic changes
  useEffect(() => {
    if (activeTopic) {
      setTopicForm({
        title: activeTopic.title,
        slug: activeTopic.slug || activeTopic.id,
        summary: activeTopic.summary || '',
        readingTimeMinutes: activeTopic.readingTimeMinutes || 5,
        keyTakeaways: activeTopic.keyTakeaways ? [...activeTopic.keyTakeaways] : [],
        newTakeaway: '',
        quiz: activeTopic.quiz ? JSON.parse(JSON.stringify(activeTopic.quiz)) : [],
        content: activeTopic.content || ''
      });
      setDebouncedContent(activeTopic.content || '');
      setIsDirty(false);
    }
  }, [activeTopic?.id]);

  // Expand the active module in outline by default
  useEffect(() => {
    if (activeModule) {
      setExpandedModules((prev) => ({
        ...prev,
        [activeModule.id]: true
      }));
    }
  }, [activeModule?.id]);

  // Auto-select course, module, topic fallback
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (activeCourse && activeCourse.modules.length > 0) {
      if (!selectedModuleId || !activeCourse.modules.some((m) => m.id === selectedModuleId)) {
        setSelectedModuleId(activeCourse.modules[0].id);
      }
    }
  }, [activeCourse, selectedModuleId]);

  useEffect(() => {
    if (activeModule && activeModule.topics.length > 0) {
      if (!selectedTopicId || !activeModule.topics.some((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(activeModule.topics[0].id);
      }
    }
  }, [activeModule, selectedTopicId]);

  // Word count calculation
  const wordsCount = useMemo(() => {
    if (!topicForm.content) return 0;
    return topicForm.content.trim().split(/\s+/).filter(Boolean).length;
  }, [topicForm.content]);

  // Auto-estimate reading time based on 200 words per minute
  useEffect(() => {
    if (wordsCount > 0) {
      const estimatedMinutes = Math.max(1, Math.ceil(wordsCount / 200));
      setTopicForm((prev) => ({
        ...prev,
        readingTimeMinutes: estimatedMinutes
      }));
    }
  }, [wordsCount]);

  // --------------------------------------------------------------------------
  // MARKDOWN INSERTION HELPERS
  // --------------------------------------------------------------------------
  const insertMarkdownText = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = topicForm.content;
    const selectedText = currentVal.substring(start, end) || placeholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setTopicForm((prev) => ({ ...prev, content: newContent }));
    setIsDirty(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // --------------------------------------------------------------------------
  // IMAGE & CANVAS WEBP COMPRESSION
  // --------------------------------------------------------------------------
  const compressImageToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1440;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const webpData = canvas.toDataURL('image/webp', 0.85);
          resolve(webpData);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          try {
            const webpData = await compressImageToWebP(file);
            const markdownImage = `\n\n![Pasted Architecture Diagram](${webpData})\n*Figure: Architecture and system component diagram*\n\n`;
            insertMarkdownText(markdownImage, '', '');
          } catch (err) {
            console.error('Failed to compress pasted image:', err);
          }
        }
      }
    }
  };

  const handleDropImage = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const webpData = await compressImageToWebP(file);
          const markdownImage = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${webpData})\n*Figure: ${file.name.replace(/\.[^/.]+$/, '')}*\n\n`;
          insertMarkdownText(markdownImage, '', '');
        } catch (err) {
          console.error('Failed to process dropped image:', err);
        }
      }
    }
  };

  // --------------------------------------------------------------------------
  // SAVE & DATA MODIFICATION HANDLERS (With Optimistic Concurrency & Locking)
  // --------------------------------------------------------------------------
  const persistTopicData = (topicToSave: Topic) => {
    if (!activeCourse || !activeModule) return;

    setSaveStatus('saving');

    const updatedCourses: Course[] = courses.map((course) => {
      if (course.id !== activeCourse.id) return course;

      return {
        ...course,
        updatedAt: new Date().toISOString(),
        modules: course.modules.map((mod) => {
          if (mod.id !== activeModule.id) return mod;

          return {
            ...mod,
            topics: mod.topics.map((top) => {
              if (top.id !== topicToSave.id) return top;
              return topicToSave;
            })
          };
        })
      };
    });

    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();
    discardDraft();
    setIsDirty(false);
    setSaveStatus('saved');

    setTimeout(() => {
      setSaveStatus('idle');
    }, 2500);
  };

  const handleSaveTopic = () => {
    if (!activeCourse || !activeModule || !activeTopic) return;

    const topicCandidate: Topic = {
      ...activeTopic,
      title: topicForm.title,
      slug: topicForm.slug || topicForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: topicForm.summary,
      readingTimeMinutes: Number(topicForm.readingTimeMinutes) || 5,
      keyTakeaways: topicForm.keyTakeaways,
      quiz: topicForm.quiz,
      content: topicForm.content,
      version: (activeTopic.version || 1) + 1,
      lastEditedBy: {
        id: adminUser.username || 'admin',
        name: adminUser.username || 'Administrator',
        role: adminUser.role
      },
      updatedAt: new Date().toISOString()
    };
    topicCandidate.revisionHash = conflictService.generateTopicRevisionHash(topicCandidate);

    // Retrieve fresh snapshot from storage to check for concurrent modifications
    const freshCourses = storageService.getCourses();
    const freshCourse = freshCourses.find((c) => c.id === activeCourse.id);
    const freshModule = freshCourse?.modules.find((m) => m.id === activeModule.id);
    const serverTopic = freshModule?.topics.find((t) => t.id === activeTopic.id);

    // Check if server version was modified by another editor
    if (
      serverTopic &&
      serverTopic.revisionHash &&
      activeTopic.revisionHash &&
      serverTopic.revisionHash !== activeTopic.revisionHash
    ) {
      const conflictResult = conflictService.detectTopicConflict(topicCandidate, serverTopic, adminUser.username);
      if (conflictResult.hasConflict) {
        useConflictStore.getState().openConflictModal(
          activeCourse.id,
          activeModule.id,
          activeTopic.id,
          conflictResult,
          (resolvedTopic) => {
            persistTopicData(resolvedTopic);
            setTopicForm((prev) => ({
              ...prev,
              title: resolvedTopic.title,
              summary: resolvedTopic.summary || '',
              content: resolvedTopic.content,
              keyTakeaways: resolvedTopic.keyTakeaways || [],
              quiz: resolvedTopic.quiz || []
            }));
            setDebouncedContent(resolvedTopic.content);
          }
        );
        return;
      }
    }

    persistTopicData(topicCandidate);
  };

  // Module & Topic Creation / Deletion
  const handleAddModule = () => {
    if (!activeCourse) return;
    const newModuleId = `mod-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      title: 'New Module',
      description: 'Module overview and topics',
      order: activeCourse.modules.length + 1,
      topics: [
        {
          id: `top-${Date.now()}`,
          title: 'Introduction & Core Concepts',
          slug: 'intro-core-concepts',
          summary: 'Getting started with this module',
          readingTimeMinutes: 5,
          order: 1,
          isPublished: true,
          content: '# Introduction & Core Concepts\n\nStart authoring your lesson content here...',
          keyTakeaways: ['Foundational concept #1'],
          quiz: [],
          updatedAt: new Date().toISOString()
        }
      ]
    };

    const updatedCourses: Course[] = courses.map((c) => {
      if (c.id !== activeCourse.id) return c;
      return {
        ...c,
        updatedAt: new Date().toISOString(),
        modules: [...c.modules, newModule]
      };
    });

    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();
    setSelectedModuleId(newModuleId);
    setSelectedTopicId(newModule.topics[0].id);
    setExpandedModules((prev) => ({ ...prev, [newModuleId]: true }));
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!activeCourse) return;
    if (activeCourse.modules.length <= 1) {
      alert('A course must have at least one module.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this module and all its topics?')) {
      return;
    }

    const updatedCourses: Course[] = courses.map((c) => {
      if (c.id !== activeCourse.id) return c;
      return {
        ...c,
        updatedAt: new Date().toISOString(),
        modules: c.modules.filter((m) => m.id !== moduleId)
      };
    });

    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();

    const remainingModules = activeCourse.modules.filter((m) => m.id !== moduleId);
    if (remainingModules.length > 0) {
      setSelectedModuleId(remainingModules[0].id);
      if (remainingModules[0].topics.length > 0) {
        setSelectedTopicId(remainingModules[0].topics[0].id);
      }
    }
  };

  const handleAddTopic = (moduleId: string) => {
    if (!activeCourse) return;
    const targetModule = activeCourse.modules.find((m) => m.id === moduleId);
    const newTopicId = `top-${Date.now()}`;
    const newTopic: Topic = {
      id: newTopicId,
      title: 'Untitled Lesson',
      slug: `lesson-${Date.now().toString().slice(-4)}`,
      summary: 'Key principles and architectural patterns',
      readingTimeMinutes: 5,
      order: (targetModule?.topics.length || 0) + 1,
      isPublished: true,
      content: '# Untitled Lesson\n\nWrite your markdown content, architectural diagrams, and interactive checks here.\n\n```mermaid\nflowchart TD\n    A[Step 1] --> B[Step 2]\n    B --> C[Result]\n```\n',
      keyTakeaways: ['Primary takeaway point'],
      quiz: [],
      updatedAt: new Date().toISOString()
    };

    const updatedCourses: Course[] = courses.map((c) => {
      if (c.id !== activeCourse.id) return c;
      return {
        ...c,
        updatedAt: new Date().toISOString(),
        modules: c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: [...m.topics, newTopic]
          };
        })
      };
    });

    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();
    setSelectedModuleId(moduleId);
    setSelectedTopicId(newTopicId);
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
  };

  const handleDeleteTopic = (moduleId: string, topicId: string) => {
    if (!activeCourse) return;
    const targetModule = activeCourse.modules.find((m) => m.id === moduleId);
    if (targetModule && targetModule.topics.length <= 1) {
      alert('A module must contain at least one topic.');
      return;
    }
    if (!window.confirm('Delete this lesson permanently?')) return;

    const updatedCourses: Course[] = courses.map((c) => {
      if (c.id !== activeCourse.id) return c;
      return {
        ...c,
        updatedAt: new Date().toISOString(),
        modules: c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.filter((t) => t.id !== topicId)
          };
        })
      };
    });

    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();

    if (targetModule) {
      const remaining = targetModule.topics.filter((t) => t.id !== topicId);
      if (remaining.length > 0) {
        setSelectedTopicId(remaining[0].id);
      }
    }
  };

  // Course Creation
  const handleCreateNewCourse = () => {
    const newId = `course-${Date.now()}`;
    const nowStr = new Date().toISOString();
    const newCourse: Course = {
      id: newId,
      title: courseForm.title || 'New Course',
      slug: courseForm.slug || 'new-course',
      subtitle: courseForm.subtitle || 'Master the architecture and patterns',
      description: courseForm.description || 'Comprehensive course description.',
      category: courseForm.category || 'Engineering',
      iconName: courseForm.iconName || 'BookOpen',
      theme: courseForm.theme || 'indigo-violet',
      level: courseForm.level || 'Intermediate',
      estimatedHours: 4,
      author: adminUser.username || 'Course Architect',
      isPublished: true,
      tags: ['Architecture', 'FullStack'],
      createdAt: nowStr,
      updatedAt: nowStr,
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: Getting Started',
          description: 'Fundamental architecture and core principles',
          order: 1,
          topics: [
            {
              id: `top-${Date.now()}`,
              title: 'Overview & Prerequisites',
              slug: 'overview-prerequisites',
              summary: 'Introductory concepts and mental model',
              readingTimeMinutes: 5,
              order: 1,
              isPublished: true,
              content: '# Overview & Prerequisites\n\nWelcome to this course. Start writing your technical guide.',
              keyTakeaways: ['Foundational concept #1'],
              quiz: [],
              updatedAt: nowStr
            }
          ]
        }
      ]
    };

    const updatedCourses = [...courses, newCourse];
    storageService.saveCourses(updatedCourses);
    onCoursesUpdated();
    setSelectedCourseId(newId);
    setShowNewCourseModal(false);
  };

  // Export Course JSON
  const handleExportCourseJSON = () => {
    if (!activeCourse) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeCourse, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeCourse.slug || activeCourse.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Quiz Question Handlers
  const handleAddQuizQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: 'Which of the following describes the correct behavior?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Option A is correct because of the architectural principles outlined in the lesson.'
    };
    setTopicForm((prev) => ({
      ...prev,
      quiz: [...prev.quiz, newQ]
    }));
    setIsDirty(true);
  };

  const handleUpdateQuizQuestion = (index: number, updated: QuizQuestion) => {
    const newQuiz = [...topicForm.quiz];
    newQuiz[index] = updated;
    setTopicForm((prev) => ({ ...prev, quiz: newQuiz }));
    setIsDirty(true);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setTopicForm((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Key Takeaways Handlers
  const handleAddTakeaway = () => {
    if (!topicForm.newTakeaway.trim()) return;
    setTopicForm((prev) => ({
      ...prev,
      keyTakeaways: [...prev.keyTakeaways, prev.newTakeaway.trim()],
      newTakeaway: ''
    }));
    setIsDirty(true);
  };

  const handleRemoveTakeaway = (index: number) => {
    setTopicForm((prev) => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      {/* -------------------------------------------------------------------- */}
      {/* TOP WORKSPACE NAVIGATION & HEADER BAR (Strict 8pt: h-16, px-6, gap-4) */}
      {/* -------------------------------------------------------------------- */}
      <header className="h-16 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-white/[0.08] px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs">

        {/* Left: Brand / Course Selection Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Exit Admin Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Reader</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08]" />

          {/* Outline Sidebar Toggle Button */}
          {!isZenMode && (
            <button
              onClick={toggleEditorOutline}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isOutlineOpen
                  ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
              title={isOutlineOpen ? 'Collapse Outline (Left Panel)' : 'Open Outline'}
            >
              {isOutlineOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Active Course Selector */}
          <div className="relative flex items-center gap-2">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-bold text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer max-w-[220px] truncate"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowNewCourseModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-500/[0.08] transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs font-semibold"
            title="Create New Course"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden lg:inline">New Course</span>
          </button>
        </div>

        {/* Center: Zen Mode Active Banner or Topic Indicator */}
        <div className="flex items-center gap-2">
          {isZenMode ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zen Mode Active &bull; Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-2xs">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-2xs">Cmd/Ctrl+Shift+F</kbd></span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {activeCourse?.title}
              </span>
              <span>/</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                {activeModule?.title}
              </span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[160px]">
                {topicForm.title || 'Untitled Topic'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Workspace Controls, Auto-Save Status, Zen Toggle, Preview Toggle, Save Button */}
        <div className="flex items-center gap-2">

          {/* Live Auto-Save / IndexedDB Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {autoSaveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                <span>Saving draft...</span>
              </>
            ) : autoSaveStatus === 'unsaved_draft' ? (
              <>
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Unsaved draft</span>
              </>
            ) : autoSaveStatus === 'recovered' ? (
              <>
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Draft restored</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Draft synced</span>
              </>
            )}
          </div>

          {/* Live Preview Toggle Button (When not in Zen Mode) */}
          {!isZenMode && (
            <button
              onClick={toggleEditorPreview}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isPreviewOpen
                  ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
              title={isPreviewOpen ? 'Hide Live Preview' : 'Show Live Preview'}
            >
              {isPreviewOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              <span className="hidden md:inline">Preview</span>
            </button>
          )}

          {/* Zen Mode Toggle Button */}
          <button
            onClick={toggleZenMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isZenMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-500/[0.08] hover:text-indigo-600'
            }`}
            title="Toggle Zen Mode (Cmd/Ctrl + Shift + F)"
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Zen Mode</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

          {/* Export JSON */}
          <button
            onClick={handleExportCourseJSON}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Export Course JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveTopic}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isDirty
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
            }`}
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : isDirty ? 'Save Changes' : 'Saved'}
            </span>
          </button>

          {/* View in Course Reader */}
          {activeCourse && (
            <button
              onClick={() => onNavigateToCourse(activeCourse.id, selectedTopicId)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-500/[0.08] transition-colors cursor-pointer hidden lg:flex"
              title="Open in Reader"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* OFFLINE DRAFT RECOVERY NOTIFICATION BANNER (Dual-Tier Persistence)   */}
      {/* -------------------------------------------------------------------- */}
      {recoverableDraft && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs animate-fade-in z-20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
            <HardDriveDownload className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Recoverable Draft Found:</strong> You have an unsaved local draft for this topic from {new Date(recoverableDraft.savedAt).toLocaleTimeString()}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-2xs cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MAIN WORKSPACE: THREE-COLUMN RESPONSIVE LAYOUT                        */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ================================================================== */}
        {/* COLUMN 1: COURSE OUTLINE TREE (20% width / Collapsible)            */}
        {/* ================================================================== */}
        {!isZenMode && isOutlineOpen && (
          <aside className="w-72 lg:w-80 flex-shrink-0 bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-white/[0.08] flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-fade-in z-20">

            {/* Outline Header */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Course Outline
                </h2>
                <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {activeCourse?.modules.reduce((acc, m) => acc + m.topics.length, 0)} total lessons
                </p>
              </div>

              <button
                onClick={handleAddModule}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/[0.08] hover:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors cursor-pointer"
                title="Add New Module"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Module</span>
              </button>
            </div>

            {/* Modules & Topics Scrollable Tree */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeCourse?.modules.map((module, modIndex) => {
                const isExpanded = expandedModules[module.id] ?? true;
                const isCurrentModule = activeModule?.id === module.id;

                return (
                  <div
                    key={module.id}
                    className={`rounded-2xl border transition-all ${
                      isCurrentModule
                        ? 'border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10'
                        : 'border-[#E2E8F0] dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]'
                    }`}
                  >
                    {/* Module Accordion Header */}
                    <div className="p-3 flex items-center justify-between gap-2 group">
                      <button
                        onClick={() =>
                          setExpandedModules((prev) => ({
                            ...prev,
                            [module.id]: !isExpanded
                          }))
                        }
                        className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                            Module {modIndex + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {module.title}
                          </span>
                        </div>
                      </button>

                      {/* Module Quick Actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAddTopic(module.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Add Topic to Module"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        {activeCourse.modules.length > 1 && (
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Topics List under Module */}
                    {isExpanded && (
                      <div className="px-2 pb-2 space-y-1">
                        {module.topics.map((topic, topicIndex) => {
                          const isSelected = selectedTopicId === topic.id;

                          return (
                            <div
                              key={topic.id}
                              onClick={() => {
                                setSelectedModuleId(module.id);
                                setSelectedTopicId(topic.id);
                              }}
                              className={`group/topic flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                <span className="truncate">{topic.title || 'Untitled Topic'}</span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                  {topic.readingTimeMinutes || 5}m
                                </span>
                                {module.topics.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTopic(module.id, topic.id);
                                    }}
                                    className={`opacity-0 group-hover/topic:opacity-100 p-1 rounded transition-opacity ${
                                      isSelected ? 'hover:bg-indigo-700 text-white' : 'hover:text-rose-500 text-slate-400'
                                    }`}
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Outline Bottom Stats & Quick Actions */}
            <div className="p-4 border-t border-[#E2E8F0] dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span>Modules: {activeCourse?.modules.length}</span>
                <span>Est. Total Time: {activeCourse?.modules.reduce((acc, m) => acc + m.topics.reduce((tAcc, t) => tAcc + (t.readingTimeMinutes || 5), 0), 0)} min</span>
              </div>
              <button
                onClick={handleAddModule}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-slate-400" />
                <span>Add Module</span>
              </button>
            </div>

          </aside>
        )}

        {/* ================================================================== */}
        {/* COLUMN 2: RAW MARKDOWN EDITOR CANVAS (40% / Zen 800px Centered)   */}
        {/* ================================================================== */}
        <main
          className={`flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-all duration-300 ${
            isZenMode
              ? 'max-w-[800px] mx-auto w-full px-4 py-4'
              : 'border-r border-[#E2E8F0] dark:border-white/[0.08]'
          }`}
        >

          {/* Sub-Header / Topic Title & Editor Tabs */}
          <div className="p-4 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-white/[0.08] flex-shrink-0 space-y-4">

            {/* Topic Title Input Bar */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={topicForm.title}
                onChange={(e) => {
                  setTopicForm({ ...topicForm, title: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="Topic Title (e.g., Microservices & Event-Driven Architecture)"
                className="flex-1 text-base lg:text-lg font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 font-display"
              />

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  {topicForm.readingTimeMinutes} min
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {wordsCount} words
                </span>
              </div>
            </div>

            {/* Sub-Tabs: Editor / Meta / Quiz / Takeaways */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04] pt-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveEditorTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeEditorTab === 'editor'
                      ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Markdown Editor</span>
                </button>

                <button
                  onClick={() => setActiveEditorTab('quiz')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeEditorTab === 'quiz'
                      ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Quiz ({topicForm.quiz.length})</span>
                </button>

                <button
                  onClick={() => setActiveEditorTab('takeaways')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeEditorTab === 'takeaways'
                      ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Takeaways ({topicForm.keyTakeaways.length})</span>
                </button>

                <button
                  onClick={() => setActiveEditorTab('meta')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeEditorTab === 'meta'
                      ? 'bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>SEO & Meta</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isDebouncing && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                    Compiling...
                  </span>
                )}
                {isDirty && !isDebouncing && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved edits" />
                )}
              </div>
            </div>

          </div>

          {/* TAB 1: MARKDOWN EDITOR */}
          {activeEditorTab === 'editor' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#111827]">

              {/* Markdown Formatting Toolbar (Strict 8pt: p-2, gap-2) */}
              <div className="p-2 bg-slate-50/80 dark:bg-white/[0.02] border-b border-[#E2E8F0] dark:border-white/[0.08] flex items-center justify-between flex-wrap gap-2 flex-shrink-0">

                {/* Text Formats & Headings */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => insertMarkdownText('# ', '', 'Heading 1')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('## ', '', 'Heading 2')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('### ', '', 'Heading 3')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

                  <button
                    onClick={() => insertMarkdownText('**', '**', 'bold text')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('*', '*', 'italic text')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('~~', '~~', 'strikethrough text')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('> ', '', 'Quote block')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

                  <button
                    onClick={() => insertMarkdownText('- ', '', 'List item')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('1. ', '', 'Numbered item')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('- [ ] ', '', 'Task')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Task List"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

                  <button
                    onClick={() => insertMarkdownText('`', '`', 'code')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Inline Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('```typescript\n', '\n```', '// Your code implementation here\nconst server = new Server();')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Code Block"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('\n| Parameter | Type | Description |\n| :--- | :--- | :--- |\n| `id` | `string` | Unique identifier |\n| `status` | `enum` | Active lifecycle status |\n\n', '', '')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Table"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdownText('\n---\n\n', '', '')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Divider"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                {/* Diagrams & Media insertion */}
                <div className="flex items-center gap-1.5">

                  {/* Callout Blocks Dropdown */}
                  <button
                    onClick={() => insertMarkdownText('> [!NOTE]\n> **Important Note:** Enter details here.\n\n', '', '')}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-1"
                    title="Insert Note Callout"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Note</span>
                  </button>
                  <button
                    onClick={() => insertMarkdownText('> [!WARNING]\n> **Critical Warning:** Pay special attention here.\n\n', '', '')}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-1"
                    title="Insert Warning Callout"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Warning</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

                  {/* Mermaid Diagrams Quick Preset Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMermaidDropdown((prev) => !prev)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/[0.08] hover:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Mermaid</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showMermaidDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] rounded-2xl shadow-xl p-2 z-40 space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Insert Diagram Preset
                        </div>
                        {MERMAID_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              insertMarkdownText(tmpl.code, '', '');
                              setShowMermaidDropdown(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              {tmpl.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {tmpl.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image & Preset Diagram Modal Trigger */}
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Image</span>
                  </button>

                </div>

              </div>

              {/* Raw Markdown Textarea (Monospace: text-[14px] leading-[1.6] font-mono) */}
              <div
                className="flex-1 relative overflow-hidden flex flex-col"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={handleDropImage}
              >
                {/* Drag-over Visual Indicator */}
                {isDraggingImage && (
                  <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-400/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 z-30 flex flex-col items-center justify-center pointer-events-none">
                    <ImageIcon className="w-12 h-12 text-indigo-500 mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      Drop image to auto-compress to WebP & insert
                    </p>
                  </div>
                )}

                <textarea
                  id="markdown-editor"
                  ref={textareaRef}
                  value={topicForm.content}
                  onChange={(e) => {
                    setTopicForm({ ...topicForm, content: e.target.value });
                    setIsDirty(true);
                  }}
                  onPaste={handlePasteImage}
                  placeholder="# Write your technical content here...&#10;&#10;Use standard Markdown, Mermaid diagrams, KaTeX formulas, tables, and paste images directly."
                  className="w-full h-full p-6 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[14px] leading-[1.6] resize-none focus:outline-none focus:ring-0 selection:bg-indigo-500/20"
                  spellCheck="false"
                />

                {/* Editor Bottom Status Bar */}
                <div className="h-8 bg-slate-50/50 dark:bg-white/[0.01] border-t border-[#E2E8F0] dark:border-white/[0.08] px-4 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0 font-mono">
                  <div className="flex items-center gap-4">
                    <span>Lines: {topicForm.content.split('\n').length}</span>
                    <span>Words: {wordsCount}</span>
                    <span>Characters: {topicForm.content.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Markdown &bull; Mermaid 12.0</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TOPIC METADATA & SEO */}
          {activeEditorTab === 'meta' && (
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#111827] space-y-6">
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                    Topic Metadata & SEO
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure search slugs, descriptions, and estimated reading time.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={topicForm.slug}
                      onChange={(e) => {
                        setTopicForm({ ...topicForm, slug: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-mono"
                      placeholder="e.g. event-driven-architecture"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Short Summary / Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value={topicForm.summary}
                      onChange={(e) => {
                        setTopicForm({ ...topicForm, summary: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs"
                      placeholder="Brief synopsis shown in course outlines and search index..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Estimated Reading Time (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={topicForm.readingTimeMinutes}
                      onChange={(e) => {
                        setTopicForm({ ...topicForm, readingTimeMinutes: Number(e.target.value) || 5 });
                        setIsDirty(true);
                      }}
                      className="w-32 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ BUILDER */}
          {activeEditorTab === 'quiz' && (
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#111827] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                    Interactive Knowledge Check Quiz
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify reader retention and award Gold, Silver, or Bronze medals.
                  </p>
                </div>
                <button
                  onClick={handleAddQuizQuestion}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {topicForm.quiz.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[#E2E8F0] dark:border-white/[0.08] rounded-3xl">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-xs font-semibold text-slate-500">No quiz questions created yet.</p>
                  <button
                    onClick={handleAddQuizQuestion}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-500/[0.08] hover:bg-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Create First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {topicForm.quiz.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-6 rounded-2xl bg-slate-50/70 dark:bg-[#0B0F19]/60 border border-[#E2E8F0] dark:border-white/[0.08] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Question #{qIdx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveQuizQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          handleUpdateQuizQuestion(qIdx, { ...q, question: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold"
                        placeholder="Type question prompt here..."
                      />

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Options (Select the radio for the correct answer)
                        </label>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`quiz-correct-${qIdx}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() =>
                                handleUpdateQuizQuestion(qIdx, { ...q, correctAnswer: optIdx })
                              }
                              className="w-4 h-4 text-indigo-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuizQuestion(qIdx, { ...q, options: newOpts });
                              }}
                              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] text-xs"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Explanation (Shown after submission)
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) =>
                            handleUpdateQuizQuestion(qIdx, { ...q, explanation: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-300"
                          placeholder="Why this answer is the optimal choice..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KEY TAKEAWAYS */}
          {activeEditorTab === 'takeaways' && (
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#111827] space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Core Lesson Takeaways
                </h3>
                <p className="text-xs text-slate-500">
                  Key summary points highlighted at the beginning of the lesson.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicForm.newTakeaway}
                  onChange={(e) => setTopicForm({ ...topicForm, newTakeaway: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTakeaway()}
                  placeholder="e.g. Always decouple write operations using distributed message queues..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs"
                />
                <button
                  onClick={handleAddTakeaway}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Add Takeaway
                </button>
              </div>

              <div className="space-y-2">
                {topicForm.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/50 border border-[#E2E8F0] dark:border-white/[0.08] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{takeaway}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveTakeaway(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* ================================================================== */}
        {/* COLUMN 3: LIVE RENDERED PREVIEW PANE (40% width / Collapsible)     */}
        {/* ================================================================== */}
        {!isZenMode && isPreviewOpen && (
          <aside className="w-[40%] min-w-[340px] flex-shrink-0 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-fade-in">

            {/* Live Preview Header */}
            <div className="h-12 px-4 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-white/[0.08] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Live Preview
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  350ms Sync
                </span>
              </div>

              {/* Viewport Simulation Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-lg">
                <button
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    previewViewport === 'desktop'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Desktop View (Full)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewViewport('tablet')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    previewViewport === 'tablet'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    previewViewport === 'mobile'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Rendered Markdown Container */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div
                className={`transition-all duration-300 w-full ${
                  previewViewport === 'mobile'
                    ? 'max-w-[390px] bg-white dark:bg-[#111827] p-6 rounded-3xl shadow-lg border border-[#E2E8F0] dark:border-white/[0.08]'
                    : previewViewport === 'tablet'
                    ? 'max-w-[768px] bg-white dark:bg-[#111827] p-8 rounded-3xl shadow-lg border border-[#E2E8F0] dark:border-white/[0.08]'
                    : 'max-w-3xl'
                }`}
              >
                {/* Hero Header Preview */}
                <div className="mb-6 pb-6 border-b border-[#E2E8F0] dark:border-white/[0.08]">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-2">
                    {topicForm.title || 'Untitled Topic'}
                  </h1>
                  {topicForm.summary && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {topicForm.summary}
                    </p>
                  )}

                  {/* Key Takeaways in Preview */}
                  {topicForm.keyTakeaways.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Core Takeaways</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {topicForm.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-500">&bull;</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Markdown Body */}
                <MarkdownRenderer content={debouncedContent} />

                {/* Quiz Preview */}
                {topicForm.quiz.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-[#E2E8F0] dark:border-white/[0.08] space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span>Knowledge Check ({topicForm.quiz.length} Questions)</span>
                    </h3>
                    <div className="space-y-3">
                      {topicForm.quiz.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] text-xs">
                          <p className="font-bold text-slate-900 dark:text-white mb-2">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2 rounded-lg border text-xs ${
                                  q.correctAnswer === optIdx
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {opt} {q.correctAnswer === optIdx && '✓ (Correct)'}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: IMAGE & MERMAID ARCHITECTURE INSERTION MODAL                 */}
      {/* -------------------------------------------------------------------- */}
      <ImageInsertModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={(markdown) => {
          insertMarkdownText(markdown, '', '');
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: MULTI-USER SIMULTANEOUS EDIT CONFLICT RESOLUTION MODAL       */}
      {/* -------------------------------------------------------------------- */}
      <ConflictModal />

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: CREATE NEW COURSE                                            */}
      {/* -------------------------------------------------------------------- */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.08] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Create New Course
              </h3>
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems & High-Scale Architecture"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Slug
                </label>
                <input
                  type="text"
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="e.g. distributed-systems-101"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Course overview and syllabus..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme Color
                  </label>
                  <select
                    value={courseForm.theme}
                    onChange={(e) => setCourseForm({ ...courseForm, theme: e.target.value as GradientTheme })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold"
                  >
                    {Object.keys(GRADIENT_THEMES).map((th) => (
                      <option key={th} value={th}>
                        {th.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-white/[0.08]">
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewCourse}
                disabled={!courseForm.title.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
