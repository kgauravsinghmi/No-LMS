# Contributing to Luminary LMS

Thank you for your interest in contributing to **Luminary LMS**! We welcome contributions from the community—whether it's fixing bugs, improving documentation, designing new themes, or building new features.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Design System & UI Guidelines](#design-system--ui-guidelines)
5. [Code Quality & Architecture Standards](#code-quality--architecture-standards)
6. [Commit Message Conventions](#commit-message-conventions)
7. [Submitting a Pull Request](#submitting-a-pull-request)
8. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please treat everyone with respect and kindness regardless of their background, experience level, or identity.

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x` LTS recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`
- **Git**: Modern version of Git

### Local Environment Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/kgauravsinghmi/No-LMS.git
   cd No-LMS
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Verify Build & Linting**:
   ```bash
   npm run lint
   npm run build
   ```

---

## Development Workflow

1. **Create a Feature Branch**:
   Always branch off `main` with a descriptive name:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Develop & Test Locally**:
   - Verify that Hot Module Replacement (HMR) operates smoothly.
   - Test both **Light Mode** and **Dark Mode**.
   - Check mobile and tablet responsive viewports.

3. **Validate Code Integrity**:
   - Ensure zero TypeScript compiler errors (`tsc -b`).
   - Run the linter (`npm run lint`).

---

## Design System & UI Guidelines

To maintain aesthetic coherence and fluid performance, all UI contributions must adhere to our core design principles:

### 1. 8pt Spatial Harmony
All spacing, padding, margins, and component dimensions must strictly align with an **8pt grid**:
- **Padding & Margins**: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-10` (40px), `p-12` (48px)
- **Gaps**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- **Fixed Component Heights**: `h-12` (48px), `h-16` (64px)

### 2. Dual-Tone Semantic Palette
Avoid harsh raw `#000000` or `#ffffff` contrasts. Utilize our semantic tokens:
- **Light Theme**:
  - Background: Soft Slate (`#F8FAFC` / `bg-light-bg`)
  - Elevated Surfaces: Pure Card White (`#FFFFFF` / `bg-light-surface`)
  - Hairline Borders: Soft Gray (`#E2E8F0` / `border-light-border`)
- **Dark Theme**:
  - Background: Obsidian Canvas (`#0B0F19` / `bg-dark-bg`)
  - Elevated Surfaces: Deep Slate Card (`#111827` / `bg-dark-surface`)
  - Hairline Borders: Translucent White (`rgba(255, 255, 255, 0.08)` / `border-dark-border`)
- **Accent & Interaction**:
  - Primary Accent: Indigo (`#6366F1` / `text-accent-indigo` / `bg-accent-indigo`)
  - Interactive Wash: 8% Tint (`rgba(99, 102, 241, 0.08)`) and 12% Hover Wash

### 3. Rendering Performance
- For real-time text input triggering complex parsers (such as Mermaid diagrams or KaTeX formulas), always implement **debounced updates** (default: 350ms) to preserve 60fps typing responsiveness.
- Use `React.memo` or `useMemo` where appropriate on heavy sub-trees.

---

## Code Quality & Architecture Standards

- **TypeScript**: Strict type checking is enforced. Avoid using `any`; define explicit interfaces in `src/types/index.ts`.
- **Component Modularity**: Keep components focused and single-purpose. Break complex views into reusable sub-components.
- **Icons**: Use [Lucide React](https://lucide.dev/) icons exclusively for iconography.
- **Client-Side Persistence**: State persistence must route through `src/services/storage.ts` using structured local storage namespaces.
- **Image Handling**: All uploaded or pasted media should be processed client-side with `<canvas>` resizing and WebP compression.

---

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new user-facing feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting, missing semicolons, CSS adjustments without logic changes
- `refactor`: Code restructuring without changing external behavior
- `perf`: Performance optimizations (debouncing, chunk loading)
- `test`: Adding or correcting tests
- `chore`: Build configuration, dependency updates, tooling

### Examples:
```bash
feat(studio): add zen mode distraction-free authoring toggle
fix(mermaid): prevent clipping on wide sequence diagrams
perf(editor): debounce live markdown preview compilation by 350ms
docs(readme): update architecture diagram and installation steps
```

---

## Submitting a Pull Request

1. **Push Changes to Your Fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a Pull Request**:
   - Provide a clear, descriptive PR title following commit conventions.
   - Describe the changes, motivation, and test steps in the PR description.
   - Attach screenshots or screen recordings for UI changes.

3. **Review Checklist**:
   - [ ] `npm run build` succeeds with zero errors.
   - [ ] `npm run lint` reports no violations.
   - [ ] Verified both Light Mode and Dark Mode rendering.
   - [ ] Verified responsive layout across Desktop, Tablet, and Mobile.
   - [ ] Checked for console warnings or unhandled rejections.

---

## Reporting Issues

If you encounter bugs or have feature proposals:
1. Check the [GitHub Issues](https://github.com/kgauravsinghmi/No-LMS/issues) tab to verify if the issue has already been reported.
2. If not, open a new issue providing:
   - Clear summary of the problem or feature idea
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Screenshots and browser/OS environment details

---

Thank you for helping make **Luminary LMS** better for everyone! 🚀
