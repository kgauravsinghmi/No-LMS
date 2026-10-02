# Contributing to Luminary LMS

Thank you for your interest in contributing to **Luminary LMS**! We welcome contributions from the community—whether it's fixing bugs, improving documentation, designing new themes, hardening security, building new interactive features, or expanding our enterprise cloud and database layer.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Design System & UI Guidelines](#design-system--ui-guidelines)
5. [Concurrency, Conflict Handling & Repository Standards](#concurrency-conflict-handling--repository-standards)
6. [Security & Access Control Standards](#security--access-control-standards)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Code Quality & Architecture Standards](#code-quality--architecture-standards)
9. [Commit Message Conventions](#commit-message-conventions)
10. [Submitting a Pull Request](#submitting-a-pull-request)
11. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please treat everyone with respect and kindness regardless of background, experience level, or identity.

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

5. **Run the Full Test Suite**:
   ```bash
   npm run test
   ```

6. **Verify Build & Linting**:
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
   - Check responsive viewports across Desktop, Tablet, and Mobile.
   - Run unit/component tests in watch mode: `npm run test:watch`.

3. **Validate Code & Security Integrity**:
   - Run the full test suite (`npm run test`) to ensure all 108+ unit tests pass.
   - Ensure zero TypeScript compiler errors (`npm run build`).
   - Run the linter (`npm run lint`).

---

## Design System & UI Guidelines

All UI contributions must adhere to our core design principles:

### 1. 8pt Spatial Harmony
All spacing, padding, margins, and component dimensions must strictly align with an **8pt grid**:
- **Padding & Margins**: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-10` (40px), `p-12` (48px)
- **Gaps**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- **Fixed Component Heights**: `h-12` (48px), `h-16` (64px)

### 2. Dual-Tone Semantic Palette
Avoid hardcoded `#000000` or `#ffffff` contrasts. Utilize semantic tokens configured in `tailwind.config.js`:
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
  - Interactive Wash: 8% Tint (`rgba(99, 102, 241, 0.08)` / `bg-accent-wash`) and 12% Hover Wash

### 3. Rendering Performance
- For real-time text input triggering complex parsers (such as Mermaid diagrams or KaTeX formulas), always implement **debounced updates** (default: 350ms) to preserve 60fps typing responsiveness.
- Use `React.memo` or `useMemo` where appropriate on heavy sub-trees.

---

## Concurrency, Conflict Handling & Repository Standards

### 1. Optimistic Locking & Revision Checksums
- When modifying course entities (`Course`, `Module`, `Topic`), compute deterministic revision fingerprints using `conflictService.generateTopicRevisionHash()` or `conflictService.generateCourseRevisionHash()`.
- Always increment `version` and update `lastEditedBy` with the authenticated user's profile on state persistence.
- Before persisting an update to a shared draft, compare local revision hashes against server snapshots via `conflictService.detectTopicConflict()`. If collisions exist, open `ConflictModal` via `useConflictStore` to empower the author with 3-way resolution (`keep-local`, `keep-remote`, `manual-merge`).

### 2. Repository Layer & Offline Queue
- All data persistence should route through repository interfaces (`src/services/db/courseRepository.ts`, `src/services/db/progressRepository.ts`).
- Ensure **0ms synchronous local cache hydration** so UI components render immediately without loading flickers.
- Any mutations executed while offline must be captured in the persistent offline queue (`luminary_lms_offline_queue_v1`) and replayed automatically upon network reconnection.

### 3. Media Upload & WebP Processing
- Process all uploaded and pasted images through `mediaStorageService.ts`.
- Compress raster assets to WebP (`0.85 quality`) using an off-screen HTML5 Canvas.
- Bypass compression for vector SVG diagrams to preserve sharp resolution.
- Ensure fallback to self-contained Base64 DataURLs if cloud endpoints are not configured.

---

## Security & Access Control Standards

### 1. XSS Prevention & Sanitization
- **Strict DOMPurify Sanitization**: Never inject un-sanitized user content directly via `dangerouslySetInnerHTML`.
- Use the centralized sanitization helpers in `src/utils/sanitize.ts`:
  - `sanitizeHtml(dirtyHtml)`: For Markdown, HTML callouts, and rich text blocks.
  - `sanitizeSvg(dirtySvg)`: For Mermaid diagram SVGs and vector elements (maintains gradients, markers, and shapes while stripping scripts).
  - `sanitizeUrl(url)`: For markdown links and image sources (blocks `javascript:`, `vbscript:`, and malicious `data:` protocols).
- External hyperlinks must automatically receive `target="_blank"` and `rel="noopener noreferrer"`.

### 2. Identity Provider (IdP) & Role-Based Access Control (RBAC)
- All course authoring, deletion, user management, and system administration views or buttons must be guarded using `<RoleGuard requiredPermission="..." />` or the `useAuthStore` permission helper (`hasPermission(...)`).
- User authentication and password strength scoring are managed through `idpService.ts`.
- Permissions are strictly defined in `src/types/auth.ts` and mapped in `ROLE_PERMISSIONS` in `src/services/authService.ts`.

---

## Testing & Quality Assurance

We maintain high test coverage using **Vitest** and **React Testing Library**.

### Guidelines:
- Place unit and integration tests adjacent to the code or in a `__tests__/` folder (e.g., `src/services/db/__tests__/courseRepository.test.ts`).
- When introducing a new feature, service method, or UI component, include corresponding test cases verifying:
  - Happy path execution
  - Edge cases, offline fallbacks, and error states
  - Role-based permission enforcement (if applicable)
  - Security/sanitization verification (if parsing HTML, SVG, or URLs)
  - Revision hash determinism and conflict detection logic

### Test Suites (14 suites, 108 tests):
- `src/services/db/__tests__/courseRepository.test.ts`
- `src/services/auth/__tests__/idpService.test.ts`
- `src/services/media/__tests__/mediaStorageService.test.ts`
- `src/services/conflict/__tests__/conflictService.test.ts`
- `src/services/__tests__/authService.test.ts`
- `src/services/__tests__/storage.test.ts`
- `src/stores/__tests__/useAuthStore.test.ts`
- `src/utils/__tests__/sanitize.test.ts`
- `src/utils/__tests__/badges.test.ts`
- `src/components/content/__tests__/MarkdownRenderer.test.tsx`
- `src/components/content/__tests__/MermaidViewer.test.tsx`
- `src/components/content/__tests__/MindmapViewer.test.tsx`
- `src/components/admin/__tests__/AdminStudio.test.tsx`
- `src/components/reader/__tests__/CourseReader.test.tsx`

### Commands:
```bash
# Run all tests
npm run test

# Watch mode for active development
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Code Quality & Architecture Standards

- **TypeScript**: Strict type checking is enforced. Avoid using `any`; define explicit interfaces in `src/types/`.
- **State Management**: Reactive global state lives in Zustand stores (`src/stores/`). Domain persistence routes through `src/services/storage.ts`, `src/services/db/`, or `src/services/authService.ts`.
- **Component Modularity**: Keep components focused and single-purpose. Break complex views into reusable sub-components.
- **Icons**: Use [Lucide React](https://lucide.dev/) icons exclusively for iconography.

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
- `security`: Security hardening, XSS sanitization, or RBAC fixes
- `style`: Formatting, missing semicolons, CSS adjustments without logic changes
- `refactor`: Code restructuring without changing external behavior
- `perf`: Performance optimizations (debouncing, chunk loading)
- `test`: Adding or correcting tests
- `chore`: Build configuration, dependency updates, tooling

### Examples:
```bash
feat(conflict): add 3-way visual diff modal and optimistic locking
feat(idp): implement live user registration and oauth2 federation
security(sanitize): enforce strict svg filter profiling in dompurify
perf(editor): debounce live markdown preview compilation by 350ms
test(db): add offline queue synchronization test suite
docs(readme): update production pillars and vitest test suite documentation
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
   - [ ] `npm run test` passes with 100% success (all 108+ tests passing).
   - [ ] `npm run build` succeeds with zero TypeScript or bundle errors.
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
