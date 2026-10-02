<div align="center">

# 🎓 Luminary LMS

**Next-Generation Self-Contained Interactive Learning, Technical Course Studio & Enterprise RBAC Platform**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![DOMPurify](https://img.shields.io/badge/Security-DOMPurify-blueviolet?style=flat-square)](https://github.com/cure53/DOMPurify)
[![Vitest](https://img.shields.io/badge/Tests-108%20Passing-green?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

<p align="center">
  An enterprise-grade, ultra-responsive Learning Management Platform featuring live database synchronization, production Identity Provider (IdP) with OAuth2, direct-to-cloud media storage, optimistic locking with 3-way visual conflict resolution, strict XSS sanitization, distraction-free Markdown authoring, visual diagramming (Mermaid & Mindmaps), and gamified progress tracking.
</p>

[Key Features](#-key-capabilities) • [Production Architecture](#-production-pillars--architecture) • [Security & RBAC](#-security--access-control) • [Directory Layout](#-architecture--directory-layout) • [Getting Started](#-getting-started) • [Testing & QA](#-testing--quality-assurance) • [Design System](#-design-system--8pt-grid) • [Contributing](#-contributing)

---

</div>

## ✨ Key Capabilities

### 🛡️ 1. Enterprise RBAC & Multi-Provider Identity (IdP)
- **Production IdP & Auth Engine (`idpService.ts`)**: Live user registration, password strength metering (0–4 entropy evaluation with regex checks), RFC-compliant email validation, and 3-part Base64 URL JWT session generation.
- **Social OAuth2 Federation**: Simulated & live OAuth2 providers for **GitHub**, **Google**, and **Discord** with domain-based role mapping.
- **4 Distinct Personas**: Full permission boundaries for **Admin**, **Instructor**, **Student / Learner**, and **Guest Explorer**.
- **Instant Role Preset Switching**: One-click persona switcher for rapid local development, client presentations, and automated QA.
- **Declarative `<RoleGuard />` Barriers**: Protect administrative views and action triggers with contextual upgrade prompts.
- **Reactive Zustand Store**: `useAuthStore` managing session tokens, user credentials, active permissions, and auth modals.

### 🔄 2. Multi-User Draft Conflict Handling & Optimistic Locking
- **32-Bit FNV-1a Revision Checksums**: Deterministic content fingerprinting (`generateTopicRevisionHash`) computing checksums across topic title, summary, content, key takeaways, and quizzes.
- **Optimistic Concurrency Control**: Automatic collision detection preventing concurrent author overwrites when multiple instructors edit content simultaneously.
- **Line-by-Line Diff Engine**: Computes structured diff chunks (`unchanged`, `added`, `removed`, `modified`) across revisions.
- **Visual 3-Way Conflict Modal (`ConflictModal.tsx`)**: Side-by-side comparison between server state and local unsaved drafts, featuring line-level diff highlighting, inline manual merge Markdown editor, and three resolution strategies (`keep-local`, `keep-remote`, `manual-merge`).

### ☁️ 3. Cloud Media & Asset Storage Pipeline
- **Direct-to-Cloud Upload Pipeline (`mediaStorageService.ts`)**: Upload course banners, diagrams, and assets directly to cloud buckets (`courses-media` via Supabase Storage, S3, or REST endpoints).
- **Off-Screen HTML5 Canvas WebP Compression**: Automatic client-side image compression (0.85 quality) reducing payload size by up to 70% while preserving resolution.
- **SVG Vector Preservation**: Dedicated vector bypass for SVG diagrams to maintain resolution independence without pixel distortion.
- **Dedicated Cloud Upload UI (`ImageInsertModal.tsx`)**: File picker, upload progress indicator, CDN URL generation, and automatic Markdown tag insertion.
- **Zero-Backend Offline Fallback**: Generates self-contained Base64 DataURLs if cloud endpoints are unreachable.

### 🗄️ 4. Persistent Database & Offline-First Sync Layer
- **Live Supabase & REST Client (`supabaseClient.ts`)**: Dynamic endpoint configuration, connection health checks, and REST request pipeline.
- **Course & Progress Repositories (`courseRepository.ts`, `progressRepository.ts`)**:
  - Instant **0ms synchronous local cache hydration** for responsive UI rendering.
  - Background asynchronous revalidation and optimistic database upserts with `version` tracking.
  - Durable offline mutation queue (`luminary_lms_offline_queue_v1`) that captures offline writes and automatically replays them upon network reconnection.
- **Storage Coordinator (`storage.ts`)**: Hybrid persistence proxy bridging local storage and remote databases seamlessly.

### 🔒 5. Strict XSS Prevention & DOM Sanitization
- **DOMPurify HTML Sanitization**: Deep HTML filtering for custom Markdown, callouts, and raw HTML blocks with whitelisted tags and dangerous protocol rejection (`javascript:`, `vbscript:`, malicious `data:` URIs).
- **SVG & Mermaid Sanitization**: Dedicated SVG profile (`USE_PROFILES: { svg: true, svgFilters: true }`) protecting dynamic diagram elements while preserving markers, curves, gradients, and filters.
- **External Link Security**: Automatic injection of `target="_blank"` and `rel="noopener noreferrer"` for external hyperlinks.

### 🛠️ 6. Course Studio & Distraction-Free Authoring
- **Three-Column Responsive Workspace**:
  - **Left (20%)**: Collapsible course outline and module/topic hierarchy with drag-and-drop navigation.
  - **Middle (40%)**: Raw Markdown editor in a crisp monospace font (`text-[14px] leading-[1.6] font-mono`) with quick-insert toolbar.
  - **Right (40%)**: Live preview pane with responsive viewport simulation (Desktop, Tablet, Mobile).
- **Zen Mode (`Cmd/Ctrl + Shift + F`)**: Instantly collapses sidebars into an **800px max-width** centered canvas for focused writing.
- **350ms Debounced Preview**: Typing state is decoupled from live compilation to maintain smooth 60fps responsiveness during heavy Mermaid or KaTeX parses.
- **Interactive Quiz Builder**: Build multiple-choice assessments with real-time feedback and explanation fields.

### 📖 7. Interactive Learning & Reader Canvas
- **Typography & Ergonomics**: Engineered with `Outfit` headers, `Plus Jakarta Sans` body, and `JetBrains Mono` code blocks for optimal legibility.
- **Reading Metrics**: Real-time reading time calculation and word counts.
- **Quick Action Utilities**:
  - **Copy Takeaways**: One-click extraction of key topic points to clipboard.
  - **Export Notes**: Export formatted Markdown notes (`.md`) directly for Obsidian, Notion, and Logseq.
- **Embedded Quiz Testing Engine**: Interactive inline testing with instant feedback, explanations, and XP rewards.

### 📊 8. Visual Diagramming & Mathematical Formulas
- **Mermaid.js 12 Visualizations**: Native rendering for Flowcharts, Sequence diagrams, Mindmaps (with horizontal SVG curve trees), ER diagrams, Git graphs, Architecture C4 diagrams, Quadrant charts, and Kanban boards.
- **Interactive Diagram Modal**: Fullscreen zoom, pan, and SVG export capabilities for high-density architectural charts.
- **Mathematical Typography**: Seamless KaTeX LaTeX math support for inline formulas (`$E = mc^2$`) and display equation blocks (`$$\sum_{i=1}^{n} x_i$$`).

### 🏆 9. Gamification & Progression System
- **Tiered Medal & Badges**: Unlock Bronze, Silver, Gold, Platinum, and Diamond achievements across learning milestones (Topics Mastered, Perfect Quizzes, Course Completions, Reading Streaks).
- **Celebration Confetti**: Physics-based confetti celebration effects on course and quiz completions powered by `canvas-confetti`.
- **Verified Completion Certificates**: Generate printable and downloadable certificates upon completing all course modules.

### ⚡ 10. Reference & Cheat Sheet Hub
- Comprehensive quick-reference sheets covering Data Structures, Algorithms, System Design, Git, SQL, Docker, Python, and TypeScript.
- Live search filtering and one-click code copy.

---

## 🏛️ Production Pillars & Architecture

```
                                  ┌───────────────────────────┐
                                  │      Luminary LMS UI      │
                                  │  (React 19 + Tailwind v4) │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
    ┌────────────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐
    │    Identity Provider   │    │  Course Studio Engine  │    │ Persistent Repository  │
    │      (idpService)      │    │  (Conflict & Locking)  │    │  (course / progress)   │
    ├────────────────────────┤    ├────────────────────────┤    ├────────────────────────┤
    │ • Password Validation  │    │ • FNV-1a Checksums     │    │ • 0ms Cache Hydration  │
    │ • RFC Email Formatter  │    │ • 3-Way Diff Engine    │    │ • Background Sync      │
    │ • Base64 JWT Generator │    │ • Conflict Resolution  │    │ • Offline Queue Replay │
    │ • OAuth2 Federation    │    │ • Canvas WebP Media    │    │ • Supabase / REST DB   │
    └────────────────────────┘    └────────────────────────┘    └────────────────────────┘
```

---

## 🔐 Security & Access Control

### Role-Based Permission Matrix

| Permission Capability | Admin | Instructor | Student / Learner | Guest Explorer |
| :--- | :---: | :---: | :---: | :---: |
| **Course Authoring (`canEditCourse`)** | ✅ | ✅ | ❌ | ❌ |
| **Publish Courses (`canPublishCourse`)** | ✅ | ✅ | ❌ | ❌ |
| **Delete Courses (`canDeleteCourse`)** | ✅ | ❌ | ❌ | ❌ |
| **Access Admin Studio (`canAccessAdminStudio`)** | ✅ | ✅ | ❌ | ❌ |
| **Learner Analytics (`canViewAnalytics`)** | ✅ | ✅ | ❌ | ❌ |
| **User Management (`canManageUsers`)** | ✅ | ❌ | ❌ | ❌ |
| **Export Database (`canExportDatabase`)** | ✅ | ✅ | ❌ | ❌ |
| **Import Database (`canImportDatabase`)** | ✅ | ❌ | ❌ | ❌ |
| **System Reset (`canResetSystem`)** | ✅ | ❌ | ❌ | ❌ |
| **Take Quizzes (`canTakeQuiz`)** | ✅ | ✅ | ✅ | ✅ |
| **Submit Notes (`canSubmitNotes`)** | ✅ | ✅ | ✅ | ❌ |
| **Bookmark Topics (`canBookmark`)** | ✅ | ✅ | ✅ | ❌ |

### Declarative Role Guard Example

```tsx
import { RoleGuard } from './components/auth/RoleGuard';

// Wrap restricted views or buttons
<RoleGuard requiredPermission="canEditCourse">
  <button onClick={handleEditTopic}>Edit Topic Content</button>
</RoleGuard>
```

---

## 📐 Architecture & Directory Layout

```
No-LMS/
├── public/                       # Static public assets & vector icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                   # SVG & PNG assets
│   ├── components/
│   │   ├── admin/                # Course authoring & studio components
│   │   │   ├── AdminLoginModal.tsx    # Secure admin authentication dialog
│   │   │   ├── AdminStudio.tsx        # 3-Column Markdown Studio & Zen Mode
│   │   │   ├── ConflictModal.tsx      # Visual 3-Way diff & merge conflict resolution
│   │   │   └── ImageInsertModal.tsx   # Cloud media upload & WebP compressor
│   │   ├── auth/                 # Authentication & RBAC components
│   │   │   ├── AuthModal.tsx          # Production IdP, OAuth2 & preset login modal
│   │   │   ├── RoleBadge.tsx          # Role visualization chip
│   │   │   └── RoleGuard.tsx          # Declarative permission boundary
│   │   ├── catalog/              # Course discovery & catalog view
│   │   │   └── CourseCatalog.tsx      # Filterable course grid with progress
│   │   ├── common/               # Shared global components
│   │   │   ├── CertificateModal.tsx   # Verified certificate generator
│   │   │   ├── Header.tsx             # Global navigation, dark mode, search
│   │   │   └── SearchModal.tsx        # Command palette & full-text search
│   │   ├── content/              # Content renderers & media viewers
│   │   │   ├── ImageViewer.tsx        # Zoomable image lightbox
│   │   │   ├── MarkdownRenderer.tsx   # Enhanced Markdown + KaTeX parser
│   │   │   ├── MermaidViewer.tsx      # Pan/zoom interactive diagram viewer
│   │   │   └── MindmapViewer.tsx      # Horizontal SVG mindmap tree viewer
│   │   ├── learning/             # Gamification & learner analytics
│   │   │   └── LearningHub.tsx        # XP tracking, badge shelf, stats
│   │   ├── reader/               # Reading interface
│   │   │   └── CourseReader.tsx       # Distraction-free reader & quiz engine
│   │   └── reference/            # Quick reference & cheatsheets
│   │       └── CheatSheetHub.tsx      # Searchable developer cheat sheets
│   ├── data/                     # Default seed courses and reference data
│   │   ├── initialCheatSheets.ts      # Technical reference sheets
│   │   └── initialCourses.ts          # Seed curriculum & module content
│   ├── services/                 # Persistence, IdP & conflict services
│   │   ├── auth/
│   │   │   ├── idpService.ts          # Production IdP, password meter & OAuth2
│   │   │   └── __tests__/             # IdP unit test suite
│   │   ├── conflict/
│   │   │   ├── conflictService.ts     # FNV-1a checksums, diff chunks & 3-way merge
│   │   │   └── __tests__/             # Conflict service test suite
│   │   ├── db/
│   │   │   ├── courseRepository.ts    # Course CRUD with offline mutation queue
│   │   │   ├── progressRepository.ts  # Learner progress & quiz state sync
│   │   │   ├── supabaseClient.ts      # Supabase REST client & health checks
│   │   │   └── __tests__/             # Repository test suite
│   │   ├── media/
│   │   │   ├── mediaStorageService.ts # Direct cloud uploads & WebP compression
│   │   │   └── __tests__/             # Media service test suite
│   │   ├── authService.ts             # JWT generator, RBAC engine & OAuth hooks
│   │   ├── storage.ts                 # Hybrid persistence coordinator
│   │   └── __tests__/                 # Storage test suites
│   ├── stores/                   # Global reactive state management
│   │   ├── useAuthStore.ts            # Zustand auth state & permission hooks
│   │   ├── useConflictStore.ts        # Collision tracking & 3-way merge store
│   │   └── __tests__/                 # Zustand store test suites
│   ├── types/                    # TypeScript interfaces & domain models
│   │   ├── auth.ts                    # UserRole, AuthUser, UserPermissions, IdP types
│   │   ├── conflict.ts                # ConflictDetectionResult, DiffChunk, MergeStrategy
│   │   └── index.ts                   # Course, Module, Topic, Quiz, Badge types
│   ├── utils/                    # Helper utilities & design system logic
│   │   ├── badges.ts                  # Badge tier evaluation & metadata
│   │   ├── icons.tsx                  # Dynamic icon resolver
│   │   ├── sanitize.ts                # Strict DOMPurify HTML/SVG/URL sanitizers
│   │   └── theme.ts                   # Theme classes & gradient generators
│   ├── App.tsx                   # Top-level router & state coordinator
│   ├── index.css                 # Tailwind v4 theme tokens & glassmorphic styles
│   └── main.tsx                  # React 19 application entry point
├── .env.example                  # Environment configuration template
├── CONTRIBUTING.md               # Contribution guidelines & coding standards
├── LICENSE                       # MIT License
├── package.json                  # Dependencies & npm scripts
├── tailwind.config.js            # Tailwind theme, 8pt grid, and semantic colors
├── tsconfig.json                 # Strict TypeScript configuration
└── vite.config.ts                # Vite build, test & plugin configuration
```

---

## 🎨 Design System & 8pt Grid

Luminary LMS implements a strict **8pt spatial harmony grid** and a **dual-tone semantic palette** configured in `tailwind.config.js` and `src/index.css`:

### Semantic Color Tokens

| Palette | Light Mode (`#F8FAFC`) | Dark Mode (`#0B0F19`) | Description |
| :--- | :--- | :--- | :--- |
| **Canvas** | `bg-light-bg` (`#F8FAFC`) | `bg-dark-bg` (`#0B0F19`) | Base background canvas |
| **Surface** | `bg-light-surface` (`#FFFFFF`) | `bg-dark-surface` (`#111827`) | Card and modal surfaces |
| **Border** | `border-light-border` (`#E2E8F0`) | `border-dark-border` (`rgba(255,255,255,0.08)`) | Hairline boundary dividers |
| **Accent** | `text-accent-indigo` (`#6366F1`) | `text-accent-indigo` (`#6366F1`) | Primary action and highlights |
| **Wash** | `bg-accent-wash` (`8% opacity`) | `bg-accent-wash` (`8% opacity`) | Interactive hover & focus washes |

### 8pt Spatial Scale
All layout intervals, headers, and container gaps conform to exact 8pt multiples:
- `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-10` (40px), `p-12` (48px)
- `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- `h-12` (48px), `h-16` (64px)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| **`Cmd/Ctrl + Shift + F`** | Course Studio | Toggle **Zen Mode** (Distraction-free 800px canvas) |
| **`Escape`** | Global / Studio | Exit Zen Mode / Close open dialogs & lightboxes |
| **`Cmd/Ctrl + S`** | Course Studio | Save active topic changes with optimistic locking |
| **`Cmd/Ctrl + K`** | Global | Open global command palette & curriculum search |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x` LTS recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kgauravsinghmi/No-LMS.git
   cd No-LMS
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```
   The production-optimized bundle will be output to the `dist/` directory.

6. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🧪 Testing & Quality Assurance

Luminary LMS includes a comprehensive **Vitest** test suite covering database repositories, identity providers, cloud media, optimistic locking diffs, RBAC matrix, Zustand stores, DOM sanitization, Mermaid diagrams, and client storage:

```bash
# Run all unit and component tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with graphical UI
npm run test:ui

# Generate test coverage report
npm run test:coverage
```

### Test Suite Summary

- **108 / 108 Passing Tests** across **14 test suites**:
  - `courseRepository.test.ts`: Local cache, optimistic concurrency, and offline queue synchronization.
  - `idpService.test.ts`: Password strength scoring, RFC email validation, JWT session generation, and OAuth simulation.
  - `mediaStorageService.test.ts`: WebP compression upload to cloud storage and fallback Base64 URL generation.
  - `conflictService.test.ts`: Revision hash generation, collision detection on simultaneous edits, and line-by-line diff chunking.
  - `authService.test.ts`: RBAC permission matrix, 3-part JWT session generation, credential & OAuth authentication.
  - `useAuthStore.test.ts`: Zustand store actions, role switching, modal state, permission evaluation.
  - `sanitize.test.ts`: XSS vector mitigation in HTML, SVG, and URL protocols.
  - `MarkdownRenderer.test.tsx`: Custom callout parsing, KaTeX formula formatting, safe markup rendering.
  - `MermaidViewer.test.tsx`: Diagram rendering, zoom/pan controls, error boundaries.
  - `MindmapViewer.test.tsx`: SVG horizontal tree rendering, node clicks, responsive views.
  - `AdminStudio.test.tsx`: 3-column editor layout, Zen Mode toggling, debounced live preview.
  - `CourseReader.test.tsx`: Reading metrics, takeaway copy, notes export, inline quiz evaluation.
  - `badges.test.ts`: Milestone calculation, tier unlocking (Bronze through Diamond), streak tracking.
  - `storage.test.ts`: LocalStorage serialization, database export/import, session persistence.

---

## ⚙️ Environment Variables

Luminary LMS includes a `.env.example` template. Key configuration variables:

```env
# Application Metadata
VITE_APP_NAME="Luminary LMS"
VITE_APP_VERSION="1.0.0"

# Local Storage Prefix
VITE_STORAGE_PREFIX="luminary_lms_"

# UI Defaults
VITE_DEFAULT_THEME="system"

# Authentication & Supabase Configuration
VITE_ENABLE_OAUTH=true
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Cloud Storage Bucket Configuration
VITE_MEDIA_STORAGE_BUCKET="courses-media"

# Feature Flags
VITE_ENABLE_EXPERIMENTAL_DIAGRAMS=true
VITE_ENABLE_CERTIFICATE_EXPORT=true
VITE_ENABLE_GAMIFICATION=true
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on:
- 8pt Spatial Harmony & Semantic Color Guidelines
- Optimistic Concurrency, Revision Hashing & Conflict Resolution
- Strict TypeScript & Zero-`any` Standards
- Security & DOMPurify Sanitization Protocols
- Role-Based Access Control Guidelines
- Vitest Testing & Pull Request Checklists

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <sub>Built with ❤️ using React 19, TypeScript, Vite, Tailwind CSS, Zustand, and Mermaid.js.</sub>
</div>
