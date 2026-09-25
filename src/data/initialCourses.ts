import { Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-fullstack-architecture',
    slug: 'modern-fullstack-architecture',
    title: 'Modern Full-Stack Architecture: React, Node & Vite',
    subtitle: 'A hands-on, no-fluff guide to designing lightning-fast, production-ready web platforms from scratch.',
    description: 'Master clean modular code, instant Vite pipelines, resilient server architectures, and delightful minimalist user experiences written in direct, pragmatic prose.',
    category: 'Full-Stack Development',
    level: 'Intermediate',
    estimatedHours: 6.5,
    author: 'Gaurav & Engineering Team',
    theme: 'indigo-violet',
    iconName: 'Cpu',
    isPublished: true,
    tags: ['React', 'Node.js', 'Vite', 'Architecture', 'TypeScript'],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-25T14:30:00.000Z',
    modules: [
      {
        id: 'mod-fs-1',
        title: 'Core Architecture & Modern Philosophy',
        description: 'Understand why simplicity beats cleverness and how modern tooling changes our mental models.',
        order: 1,
        topics: [
          {
            id: 'top-fs-101',
            title: 'The Modern Web Philosophy: Speed, Simplicity & Zero Bloat',
            slug: 'modern-web-philosophy',
            readingTimeMinutes: 5,
            order: 1,
            isPublished: true,
            summary: 'Why modern web engineering favors lean dependencies, deterministic builds, and clean component contracts over bloated legacy frameworks.',
            keyTakeaways: [
              'Code simplicity reduces cognitive overhead and debugging time by orders of magnitude.',
              'Choose tools that respect browser standards and have near-zero cold-start times.',
              'A minimal UI with deliberate typography creates a memorable, sticky impression.'
            ],
            content: `## The Modern Web Philosophy

When we look at engineering web applications today, the biggest trap engineers fall into is **premature complexity**. We install dozens of dependencies before writing a single line of domain logic.

Here is the truth: **Software should feel instant, readable, and respectful of the user's attention.**

> [!NOTE]
> *Simplicity is not the absence of clutter; it is the presence of purpose.* Every button, every network round-trip, and every render cycle should have an intentional reason to exist.

---

### The Three Pillars of Our Stack

1. **Deterministic Development (Vite & ES Modules):** We eliminate 30-second bundling pauses. Everything compiles in sub-50 milliseconds.
2. **Declarative UI (React 19 & TypeScript):** Strongly typed state machines prevent runtime crashes before code ever touches production.
3. **Airy, Minimalist Aesthetics:** Soft gradient meshes, crisp border lines, and generous whitespace leave a lasting impression without overwhelming the reader.

\`\`\`typescript
// The ideal component: readable, self-contained, typed
interface UserBadgeProps {
  name: string;
  role: 'admin' | 'learner' | 'author';
  completedTopicsCount: number;
}

export function UserBadge({ name, role, completedTopicsCount }: UserBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80">
      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{name}</h4>
        <p className="text-xs text-slate-500">{role} · {completedTopicsCount} topics finished</p>
      </div>
    </div>
  );
}
\`\`\`

> [!TIP]
> Notice how we use Tailwind utility composition with inline semantic styling. It keeps styles co-located with behavior and eliminates orphaned CSS stylesheets.

---

### Architectural Checklist

- [x] Eliminate dead packages during dependency audits.
- [x] Configure strict TypeScript rules (noImplicitAny, strictNullChecks).
- [x] Ensure state lives as close to where it is used as possible.
- [ ] Measure Time to Interactive (TTI) and First Contentful Paint (FCP) on mobile network throttles.`,
            quiz: [
              {
                id: 'q-fs-101-1',
                question: 'What is the primary benefit of native ES Modules in modern Vite tooling?',
                options: [
                  'It compiles everything into a single monolithic bundle on start',
                  'It serves files over native ESM, giving sub-50ms instant reload without bundle overhead',
                  'It replaces JavaScript with WebAssembly automatically',
                  'It prevents all network requests in the browser'
                ],
                correctAnswer: 1,
                explanation: 'Native ESM allows Vite to transform and serve source code on-demand, dramatically cutting cold-start and reload latency.'
              },
              {
                id: 'q-fs-101-2',
                question: 'Where should application state ideally reside in a component tree?',
                options: [
                  'Always in a global window object',
                  'In the highest parent component possible',
                  'As close as possible to the components that directly consume and mutate it',
                  'Strictly in local storage files only'
                ],
                correctAnswer: 2,
                explanation: 'Colocating state prevents unnecessary re-renders across sibling trees and improves maintainability.'
              }
            ],
            updatedAt: '2026-09-25T10:00:00.000Z'
          },
          {
            id: 'top-fs-102',
            title: 'State Architecture: Local, URL & Global Persistence',
            slug: 'state-architecture-local-url-global',
            readingTimeMinutes: 7,
            order: 2,
            isPublished: true,
            summary: 'How to structure UI state, sync state with URL query parameters for shareability, and utilize browser storage safely.',
            keyTakeaways: [
              'If state should be shareable or survived by page refresh, it belongs in the URL or storage.',
              'Derive state during render rather than syncing redundant state variables in effects.',
              'Local state is best for ephemeral UI toggles (dropdowns, hover states, modals).'
            ],
            content: `## State Architecture: Local, URL & Global

Managing state is where 90% of front-end bugs originate. When state becomes desynchronized or scattered across disconnected components, subtle race conditions appear.

### The Hierarchy of State Storage

| Tier | Storage Location | When To Use | Examples |
| :--- | :--- | :--- | :--- |
| **Tier 1: Ephemeral** | React useState | UI toggles, input drafts, menu expansion | Modal visibility, input focus |
| **Tier 2: Shareable** | URL Query Params | Filter states, active tab, active article | ?tab=quiz&topic=102 |
| **Tier 3: Durable** | LocalStorage / IndexedDB | User preferences, bookmarks, progress | Dark mode, reading progress |
| **Tier 4: Remote** | Server Database / API | Collaborative data, user credentials | Published course content, user auth |

> [!WARNING]
> Never store derived state in a separate state variable! If you have items and filter, calculate filteredItems on the fly.

\`\`\`typescript
// Clean derived computation example
const filteredTopics = useMemo(() => {
  return topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));
}, [topics, query]);
\`\`\`

---

### Designing Persistent Local Stores

When building client-side tools like this LMS module, reactive local storage ensures that:
1. Progress is never lost on refresh.
2. The user can create custom courses that persist reliably.
3. Import and export operations can be executed with simple JSON serialization.

\`\`\`typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
\`\`\`

> [!TIP]
> Always wrap localStorage calls in try/catch blocks to handle private browsing modes and quota limit exceptions gracefully.`,
            quiz: [
              {
                id: 'q-fs-102-1',
                question: 'Why is deriving state on the fly better than synchronizing two separate states in useEffect?',
                options: [
                  'It makes network requests faster',
                  'It eliminates redundant render cycles and prevents desynchronization bugs',
                  'It requires fewer TypeScript types',
                  'It is the only way to read localStorage'
                ],
                correctAnswer: 1,
                explanation: 'Synchronizing redundant states in useEffect causes extra re-render cascades and frequently leads to stale state bugs.'
              }
            ],
            updatedAt: '2026-09-25T11:00:00.000Z'
          }
        ]
      },
      {
        id: 'mod-fs-2',
        title: 'Backend API Design & Resilience',
        description: 'Creating robust Node.js backend services and data structures.',
        order: 2,
        topics: [
          {
            id: 'top-fs-201',
            title: 'Pragmatic REST & RPC: When to Choose What',
            slug: 'pragmatic-rest-rpc-apis',
            readingTimeMinutes: 6,
            order: 1,
            isPublished: true,
            summary: 'A direct comparison of RESTful contracts, typed RPCs, and lightweight endpoints for modern full-stack web development.',
            keyTakeaways: [
              'Use REST for public, resource-oriented external interfaces.',
              'Use typed RPC (or shared TS schemas) for internal client-to-server communication.',
              'Structure payloads to return only what the client view actually requires.'
            ],
            content: `## Pragmatic REST & RPC Architecture

Backend design does not need to be an academic exercise in theoretical perfection. It needs to be **predictable**, **type-safe**, and **fast**.

### REST vs. Typed RPC in Practice

\`\`\`
Client (Browser) ───[ Type-Safe Schema ]───> Server (Node.js)
        ▲                                          │
        └────────────[ JSON Response ]─────────────┘
\`\`\`

When designing internal APIs for your application:
- Validate all incoming bodies with schemas (e.g., Zod / Joi).
- Return explicit error codes and human-readable messages.
- Add idempotency keys to critical mutative actions (like publishing or creating records).

> [!IMPORTANT]
> Always enforce role-based access checks at the API gateway or controller level. Never rely on the client UI hiding the "Admin" button as a security mechanism.`,
            updatedAt: '2026-09-25T12:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 'course-system-design',
    slug: 'system-design-pragmatic-scale',
    title: 'System Design: Building for High Availability & Scale',
    subtitle: 'Practical architectural patterns for scalable databases, caching tiers, and resilient microservices.',
    description: 'Learn how modern high-scale distributed systems handle traffic spikes, database sharding, caching strategies, and graceful degradation without collapsing.',
    category: 'System Design',
    level: 'Advanced',
    estimatedHours: 8.0,
    author: 'Architectural Guild',
    theme: 'cyan-blue',
    iconName: 'Server',
    isPublished: true,
    tags: ['Distributed Systems', 'Caching', 'Redis', 'PostgreSQL', 'Scale'],
    createdAt: '2026-09-05T09:00:00.000Z',
    updatedAt: '2026-09-25T15:00:00.000Z',
    modules: [
      {
        id: 'mod-sd-1',
        title: 'Distributed Foundations & Caching',
        description: 'Master caching hierarchies, cache invalidation, and data partition strategies.',
        order: 1,
        topics: [
          {
            id: 'top-sd-101',
            title: 'Caching Strategies: Cache-Aside, Write-Through & Invalidation',
            slug: 'caching-strategies-invalidation',
            readingTimeMinutes: 7,
            order: 1,
            isPublished: true,
            summary: 'Deep dive into caching patterns that prevent the thundering herd problem and ensure sub-millisecond response times.',
            keyTakeaways: [
              'There are only two hard things in Computer Science: cache invalidation and naming things.',
              'Cache-Aside is the standard for read-heavy distributed applications.',
              'Always set explicit TTLs (Time-To-Live) and jitter to prevent thundering herd spikes.'
            ],
            content: `## Caching Strategies for High-Throughput Systems

When an application scales from 1,000 users to 1,000,000 users, the database is almost always the first bottleneck to saturate.

### The Cache-Aside (Lazy Loading) Pattern

\`\`\`
1. App requests Data (Key)
2. Check Cache (Redis)
   ├── HIT  ──> Return Data Immediately (< 2ms)
   └── MISS ──> Query Primary DB ──> Write to Cache with TTL ──> Return Data
\`\`\`

\`\`\`typescript
// Production Cache-Aside Pattern with Jitter
async function getCourseWithCache(courseId: string): Promise<Course> {
  const cacheKey = 'course:' + courseId;

  // 1. Try reading from cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Fetch from primary database
  const course = await db.courses.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error('Course not found');
  }

  // 3. Set cache with TTL + random jitter (prevent simultaneous expiry)
  const baseTTL = 3600; // 1 hour
  const jitter = Math.floor(Math.random() * 300); // 0-5 mins
  await redis.set(cacheKey, JSON.stringify(course), 'EX', baseTTL + jitter);

  return course;
}
\`\`\`

> [!TIP]
> Adding a 5% random jitter to cache expiry timestamps prevents millions of cached keys from expiring at the exact same second, eliminating database crash cascades.`,
            quiz: [
              {
                id: 'q-sd-101-1',
                question: 'What problem does adding random jitter to cache TTLs solve?',
                options: [
                  'It compresses data size in RAM',
                  'It prevents all keys from expiring simultaneously, stopping the Thundering Herd collapse',
                  'It eliminates the need for a database',
                  'It encrypts cached data automatically'
                ],
                correctAnswer: 1,
                explanation: 'Jitter spreads out cache expirations over a time window, ensuring the primary database is not overwhelmed by sudden concurrent misses.'
              }
            ],
            updatedAt: '2026-09-25T13:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 'course-ui-ux-design',
    slug: 'minimalist-ui-ux-engineering',
    title: 'Minimalist UI/UX Engineering: Interfaces That Stick in Mind',
    subtitle: 'How to craft memorable, high-converting digital products using subtle gradients, clean typography, and spatial harmony.',
    description: 'Learn the craft of modern visual hierarchy, tactile feedback, micro-animations, and light gradient palettes that make software feel premium, calm, and effortless.',
    category: 'Design & Frontend',
    level: 'Beginner',
    estimatedHours: 4.5,
    author: 'Design Engineering Studio',
    theme: 'rose-pink',
    iconName: 'Sparkles',
    isPublished: true,
    tags: ['UI/UX', 'Design Systems', 'CSS', 'Micro-interactions', 'Typography'],
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-25T14:00:00.000Z',
    modules: [
      {
        id: 'mod-ux-1',
        title: 'Visual Rhythm, Elevation & Light Gradients',
        description: 'Explore the math behind harmonious layouts and subtle aesthetic treatments.',
        order: 1,
        topics: [
          {
            id: 'top-ux-101',
            title: 'The Art of Subtle Light Gradients & Soft Glassmorphism',
            slug: 'subtle-light-gradients-glassmorphism',
            readingTimeMinutes: 5,
            order: 1,
            isPublished: true,
            summary: 'How to use light pastel gradients and frosted blur surfaces to add depth and warmth without visual clutter.',
            keyTakeaways: [
              'Never use harsh saturated linear gradients for large backgrounds; stick to 5-10% opacity tints.',
              'Combine subtle borders with backdrop blur for crisp definition.',
              'Use color as a directional indicator, not as decoration.'
            ],
            content: `## The Art of Subtle Light Gradients

Why do some modern applications feel effortlessly elegant while others feel loud and distracting?

The answer lies in **tonal subtlety**. When gradients are dialed back to 4%–12% opacity over neutral ivory or soft cool backgrounds, they create an ambient sense of light, like morning sunlight on frosted glass.

> [!NOTE]
> When designing a knowledge base or reading application, your user's eyes will rest on the screen for hours. High contrast borders and heavy dark gradients cause visual fatigue. Soft pastel ambient accents keep the focus on reading comprehension.

---

### Anatomy of a Minimalist Card

\`\`\`css
/* Clean, tactile card surface */
.modern-minimal-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 1rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-minimal-card:hover {
  transform: translateY(-2px);
  border-color: rgba(165, 180, 252, 0.8);
  box-shadow: 0 12px 30px -4px rgba(99, 102, 241, 0.08);
}
\`\`\`

> [!TIP]
> Notice the 0.2s cubic bezier curve: it snaps into motion quickly, mimicking physical inertia and creating a tactile sensation on hover.`,
            quiz: [
              {
                id: 'q-ux-101-1',
                question: 'What is the recommended opacity range for ambient background gradient meshes in clean UI design?',
                options: [
                  '80% to 100% full opacity',
                  '5% to 15% subtle opacity',
                  'Only 0% pure grayscale is allowed',
                  'Opacity does not affect visual fatigue'
                ],
                correctAnswer: 1,
                explanation: 'A 5% to 15% opacity creates a soft, ambient glow without competing with high-contrast text content.'
              }
            ],
            updatedAt: '2026-09-25T14:15:00.000Z'
          }
        ]
      }
    ]
  }
];
