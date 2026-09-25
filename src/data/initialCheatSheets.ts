import { CheatSheetItem } from '../types';

export const INITIAL_CHEATSHEETS: CheatSheetItem[] = [
  {
    id: 'cs-react-19-actions',
    title: 'React 19 Server Actions & useTransition Flow',
    category: 'Frontend & React',
    language: 'typescript',
    tags: ['React 19', 'Async', 'State Management'],
    description: 'Non-blocking async state transitions with optimistic UI rollbacks and zero loading flicker.',
    keyRule: 'Always wrap manual async mutations in startTransition to keep high-priority interactions (inputs, taps) responsive.',
    code: `import { useTransition, useState } from 'react';

export function ActionButton({ onSave }: { onSave: (val: string) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleClick = () => {
    startTransition(async () => {
      await onSave('Updated Course Payload');
      setStatus('success');
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
    >
      {isPending ? 'Syncing...' : status === 'success' ? 'Saved!' : 'Save Changes'}
    </button>
  );
}`
  },
  {
    id: 'cs-sys-cache-invalidation',
    title: 'Cache-Aside (Lazy Loading) with Singleflight Guard',
    category: 'Backend & Systems',
    language: 'typescript',
    tags: ['Redis', 'Caching', 'Concurrency', 'High Availability'],
    description: 'Prevent cache stampedes (thundering herd) during key expiration using atomic locking.',
    keyRule: 'On cache miss, never let 10,000 requests hit PostgreSQL simultaneously. Coordinate via single-flight mutex or Redis redlock.',
    code: `async function getCourseWithCache(courseId: string): Promise<Course> {
  const cacheKey = \`course:\${courseId}\`;

  // 1. Fast Cache Read
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Mutex / Distributed Lock to prevent Stampede
  const lockAcquired = await redis.set(\`lock:\${cacheKey}\`, 'locked', 'NX', 'EX', 5);
  if (!lockAcquired) {
    await sleep(50); // Small backoff and retry cache
    return getCourseWithCache(courseId);
  }

  try {
    // 3. Authoritative DB Query
    const course = await db.courses.findUnique({ where: { id: courseId } });
    await redis.set(cacheKey, JSON.stringify(course), 'EX', 3600); // 1hr TTL
    return course;
  } finally {
    await redis.del(\`lock:\${cacheKey}\`);
  }
}`
  },
  {
    id: 'cs-minimalist-glassmorphism',
    title: 'Tailwind CSS Modern Glassmorphism Formula',
    category: 'UI/UX Engineering',
    language: 'css',
    tags: ['Tailwind CSS', 'CSS', 'Glassmorphism', 'Design System'],
    description: 'Subtle, translucent surface tokens with ambient backdrop-blur and hairline borders.',
    keyRule: 'Never use heavy opaque gradients. Use 70-80% opacity with backdrop-blur-xl and 1px border with 20-30% opacity for crisp depth.',
    code: `/* Light Mode Glass Panel */
.glass-panel-light {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
}

/* Dark Mode Frosted Slate Panel */
.glass-panel-dark {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(51, 65, 85, 0.6);
  box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.4);
}`
  },
  {
    id: 'cs-ts-discriminated-union',
    title: 'TypeScript Discriminated Unions & Exhaustive Checks',
    category: 'TypeScript & Type Safety',
    language: 'typescript',
    tags: ['TypeScript', 'Design Patterns', 'Type Safety'],
    description: 'Bulletproof state modeling with compiler-enforced exhaustive switch checks.',
    keyRule: 'Use assertNever(x: never) in default cases so adding a new union variant forces a compile-time fix across your whole app.',
    code: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; updatedAt: number }
  | { status: 'error'; error: Error };

function assertNever(x: never): never {
  throw new Error(\`Unexpected object: \${JSON.stringify(x)}\`);
}

function renderState(state: AsyncState<Course[]>) {
  switch (state.status) {
    case 'idle':
      return 'Ready to fetch';
    case 'loading':
      return 'Skeleton loader...';
    case 'success':
      return \`Loaded \${state.data.length} courses\`;
    case 'error':
      return \`Failed: \${state.error.message}\`;
    default:
      return assertNever(state); // Enforces compiler check
  }
}`
  },
  {
    id: 'cs-node-stream-pipeline',
    title: 'Node.js Memory-Efficient Stream Pipeline',
    category: 'Backend & Systems',
    language: 'typescript',
    tags: ['Node.js', 'Streams', 'Memory Efficiency'],
    description: 'Stream large datasets/files without exceeding memory buffers (constant O(1) RAM).',
    keyRule: 'Never read multi-gigabyte files with fs.readFile(). Always use stream.pipeline with async iterators.',
    code: `import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

export async function compressExportBundle(inputPath: string, outputPath: string) {
  try {
    await pipeline(
      createReadStream(inputPath),
      createGzip({ level: 6 }),
      createWriteStream(outputPath)
    );
    console.log('Stream completed with zero RAM surge.');
  } catch (err) {
    console.error('Pipeline failed with cleanup:', err);
    throw err;
  }
}`
  },
  {
    id: 'cs-resilient-localstorage',
    title: 'Resilient LocalStorage Wrapper with Event Dispatch',
    category: 'Frontend & React',
    language: 'typescript',
    tags: ['Storage', 'Events', 'Browser API'],
    description: 'Fail-safe client-side persistence with cross-component window event dispatching.',
    keyRule: 'Always wrap localStorage calls in try/catch (Safari private mode throws errors) and emit custom Window events for zero-polling UI updates.',
    code: `export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(\`Storage read error for \${key}\`, e);
      return fallback;
    }
  },
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(\`app_storage_\${key}\`, { detail: value }));
      return true;
    } catch (e) {
      console.error(\`Storage write error for \${key}\`, e);
      return false;
    }
  }
};`
  }
];
