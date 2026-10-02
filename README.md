<div align="center">

# 🎓 Luminary LMS

**Next-Generation Self-Contained Interactive Learning & Technical Course Studio**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Mermaid.js](https://img.shields.io/badge/Mermaid-12.0-FF3670?style=flat-square&logo=mermaid&logoColor=white)](https://mermaid.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

<p align="center">
  A modern, ultra-responsive, and zero-backend-required Learning Management Platform. Designed for engineers, technical writers, educators, and self-learners to author rich interactive courses, render complex architectural diagrams, and master technical skills with gamified rewards.
</p>

[Key Features](#-key-capabilities) • [Architecture](#-architecture--directory-layout) • [Getting Started](#-getting-started) • [Design System](#-design-system--8pt-grid) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Contributing](#-contributing)

---

</div>

## ✨ Key Capabilities

### 🛠️ 1. Course Studio & Authoring Suite
- **Three-Column Responsive Workspace**:
  - **Left (20%)**: Collapsible course outline and module/topic hierarchy with instant navigation.
  - **Middle (40%)**: Raw Markdown editor in a crisp monospace font (`text-[14px] leading-[1.6] font-mono`) with toolbar shortcuts.
  - **Right (40%)**: Live preview pane with responsive viewport simulation (Desktop, Tablet, Mobile).
- **Zen Mode (`Cmd/Ctrl + Shift + F`)**: Instantly collapses navigation and preview panes, focusing into an **800px max-width** centered authoring canvas for distraction-free writing.
- **350ms Debounced Preview**: Live typing state is decoupled from rendering to ensure smooth 60fps typing even during heavy Mermaid or KaTeX compilations.
- **Client-Side Media Compression**: Drag-and-drop or paste images from the clipboard—automatically converted via `<canvas>` to optimized WebP format with automated Markdown figure captions.
- **Interactive Quiz Builder**: Build multiple-choice assessments with answer explanations and instant verification.
- **Course Metadata & Theming**: Configure difficulty badges, estimated reading times, takeaway summaries, and customizable gradient banners.

### 📖 2. Distraction-Free Interactive Reader
- **Typography & Ergonomics**: Engineered with `Outfit` headers, `Plus Jakarta Sans` body, and `JetBrains Mono` code blocks for optimal legibility.
- **Reading Metrics**: Real-time reading time calculation and word counts.
- **Quick Action Utilities**:
  - **Copy Takeaways**: One-click extraction of key topic points to clipboard.
  - **Export Notes**: Export formatted Markdown notes (`.md`) for personal knowledge bases (Obsidian, Notion, Logseq).
- **Embedded Quiz Testing Engine**: Interactive inline testing with instant feedback, explanations, and XP rewards.

### 📊 3. Visual Diagramming & Formula Suite
- **Mermaid.js 12 Visualizations**: Native rendering for Flowcharts, Sequence diagrams, Mindmaps (with horizontal SVG curve trees), ER diagrams, Git graphs, Architecture C4 diagrams, Quadrant charts, and Kanban boards.
- **Interactive Diagram Modal**: Fullscreen zoom, pan, and SVG export capabilities for high-density architectural charts.
- **Mathematical Typography**: Seamless KaTeX LaTeX math support for inline formulas (`$E = mc^2$`) and display equation blocks (`$$\sum_{i=1}^{n} x_i$$`).

### 🏆 4. Gamification & Progression System
- **Tiered Medal & Badges**: Unlock Bronze, Silver, Gold, Platinum, and Diamond achievements across learning milestones (Topics Mastered, Perfect Quizzes, Course Completions, Reading Streaks).
- **Celebration Confetti**: Physics-based confetti celebration effects on course and quiz completions powered by `canvas-confetti`.
- **Verified Completion Certificates**: Generate printable and downloadable certificates upon completing all course modules.

### ⚡ 5. Reference & Cheat Sheet Hub
- Comprehensive quick-reference sheets covering Data Structures, Algorithms, System Design, Git, SQL, Docker, Python, and TypeScript.
- Live search filtering and one-click code copy.

---

## 📐 Architecture & Directory Layout

```
No-LMS/
├── images/                       # Sample illustrations & screenshots
│   ├── information_system.png
│   └── People_hard.png
├── public/                       # Static public assets & icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                   # SVG & PNG assets
│   ├── components/
│   │   ├── admin/                # Course authoring & studio components
│   │   │   ├── AdminLoginModal.tsx    # Secure admin authentication dialog
│   │   │   ├── AdminStudio.tsx        # 3-Column Markdown Studio & Zen Mode
│   │   │   └── ImageInsertModal.tsx   # Client-side WebP image processor
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
│   ├── services/                 # Persistence & storage services
│   │   └── storage.ts                 # LocalStorage persistence & backup/restore
│   ├── types/                    # TypeScript interfaces & domain models
│   │   └── index.ts                   # Course, Module, Topic, Quiz, Badge types
│   ├── utils/                    # Helper utilities & design system logic
│   │   ├── badges.ts                  # Badge tier evaluation & metadata
│   │   ├── icons.tsx                  # Dynamic icon resolver
│   │   └── theme.ts                   # Theme classes & gradient generators
│   ├── App.tsx                   # Top-level router & state coordinator
│   ├── index.css                 # Tailwind v4 theme tokens & glassmorphic styles
│   └── main.tsx                  # React 19 application entry point
├── .env.example                  # Environment configuration template
├── CONTRIBUTING.md               # Contribution guidelines & coding standards
├── LICENSE                       # MIT License
├── package.json                  # Dependencies & npm scripts
├── tailwind.config.js            # Tailwind theme, 8pt grid, and semantic colors
└── vite.config.ts                # Vite build and plugin configuration
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
| **`Cmd/Ctrl + S`** | Course Studio | Save active topic changes to LocalStorage |
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

7. **Code Linting**:
   ```bash
   npm run lint
   ```

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

# Feature Flags
VITE_ENABLE_EXPERIMENTAL_DIAGRAMS=true
VITE_ENABLE_CERTIFICATE_EXPORT=true
VITE_ENABLE_GAMIFICATION=true
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on code formatting, the 8pt design system, commit conventions, and our pull request process.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <sub>Built with ❤️ using React 19, Vite, Tailwind CSS, and Mermaid.js.</sub>
</div>
