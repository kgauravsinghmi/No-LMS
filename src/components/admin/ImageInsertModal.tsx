import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  FileImage,
  Layers,
  Maximize2,
  Trash2,
  Info,
  FolderOpen,
  Zap,
  ArrowRight
} from 'lucide-react';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (markdown: string) => void;
}

// Curated architectural SVG diagrams for 1-click instant use
const ARCHITECTURE_PRESETS = [
  {
    id: 'preset-microservices',
    title: 'Microservices & API Gateway Topology',
    alt: 'Distributed Microservices & Gateway Topology',
    caption: 'Figure: Edge Gateway, Authentication Validator & Core Service Mesh',
    description: 'High-availability microservice routing with central JWT auth and caching layer.',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
          <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
          <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#334155" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
          </filter>
        </defs>
        <rect width="800" height="400" rx="20" fill="url(#bgGrad)" />
        <rect x="30" y="30" width="740" height="340" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="6,6" />

        <!-- Client Node -->
        <g transform="translate(60, 150)" filter="url(#shadow)">
          <rect width="130" height="80" rx="12" fill="url(#nodeGrad)" stroke="#6366f1" stroke-width="2" />
          <text x="65" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="middle">Client Apps</text>
          <text x="65" y="58" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">React & Mobile</text>
        </g>

        <!-- Arrow 1 -->
        <path d="M 190 190 L 260 190" stroke="#818cf8" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow)" />
        <text x="225" y="180" fill="#a5b4fc" font-family="monospace" font-size="10" text-anchor="middle">HTTPS</text>

        <!-- API Gateway -->
        <g transform="translate(260, 130)" filter="url(#shadow)">
          <rect width="160" height="120" rx="14" fill="url(#boxGrad)" stroke="#a5b4fc" stroke-width="2" />
          <text x="80" y="45" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" text-anchor="middle">API Gateway</text>
          <text x="80" y="68" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">Rate Limiter & WAF</text>
          <text x="80" y="88" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">JWT Auth Validator</text>
        </g>

        <!-- Arrow splits -->
        <path d="M 420 165 L 500 110" stroke="#818cf8" stroke-width="2.5" />
        <path d="M 420 190 L 500 190" stroke="#818cf8" stroke-width="2.5" />
        <path d="M 420 215 L 500 270" stroke="#818cf8" stroke-width="2.5" />

        <!-- Microservice 1 -->
        <g transform="translate(500, 70)" filter="url(#shadow)">
          <rect width="140" height="65" rx="10" fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="1.5" />
          <text x="70" y="32" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Course Service</text>
          <text x="70" y="50" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">gRPC / Node.js</text>
        </g>

        <!-- Microservice 2 -->
        <g transform="translate(500, 155)" filter="url(#shadow)">
          <rect width="140" height="65" rx="10" fill="url(#nodeGrad)" stroke="#34d399" stroke-width="1.5" />
          <text x="70" y="32" fill="#34d399" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Auth & User Svc</text>
          <text x="70" y="50" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Session / OAuth2</text>
        </g>

        <!-- Microservice 3 -->
        <g transform="translate(500, 240)" filter="url(#shadow)">
          <rect width="140" height="65" rx="10" fill="url(#nodeGrad)" stroke="#f472b6" stroke-width="1.5" />
          <text x="70" y="32" fill="#f472b6" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Analytics Engine</text>
          <text x="70" y="50" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">Event Stream (Kafka)</text>
        </g>

        <!-- Storage Cluster -->
        <g transform="translate(680, 130)" filter="url(#shadow)">
          <rect width="80" height="120" rx="12" fill="#0f172a" stroke="#a855f7" stroke-width="2" />
          <text x="40" y="50" fill="#e9d5ff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">DB &amp; Cache</text>
          <text x="40" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">PostgreSQL</text>
          <text x="40" y="92" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle">Redis Cluster</text>
        </g>

        <path d="M 640 102 L 680 155" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
        <path d="M 640 187 L 680 190" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
        <path d="M 640 272 L 680 225" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
      </svg>
    `)}`
  },
  {
    id: 'preset-cache-aside',
    title: 'Cache-Aside & Database Replication Pipeline',
    alt: 'Cache-Aside and DB Replication Pipeline Topology',
    caption: 'Figure: Sub-millisecond Cache Invalidation with Primary PostgreSQL & Redis Cluster',
    description: 'High-throughput database reads with lazy-loading cache hits and asynchronous write-through.',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" width="100%" height="100%">
        <defs>
          <linearGradient id="cacheBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#172554" />
          </linearGradient>
          <linearGradient id="redisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#ea580c" />
          </linearGradient>
          <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="800" height="380" rx="18" fill="url(#cacheBg)" />

        <!-- Application Server -->
        <g transform="translate(60, 130)">
          <rect width="160" height="100" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
          <text x="80" y="45" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="14" text-anchor="middle">App Backend</text>
          <text x="80" y="68" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">Node.js Workers</text>
        </g>

        <!-- Fast Path: Redis Cache -->
        <g transform="translate(340, 50)">
          <rect width="180" height="90" rx="14" fill="url(#redisGrad)" stroke="#fca5a5" stroke-width="2" />
          <text x="90" y="40" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" text-anchor="middle">Redis In-Memory</text>
          <text x="90" y="62" fill="#fee2e2" font-family="monospace" font-size="11" text-anchor="middle">Cache HIT (&lt; 2ms)</text>
        </g>

        <!-- Primary DB -->
        <g transform="translate(340, 210)">
          <rect width="180" height="100" rx="14" fill="url(#pgGrad)" stroke="#93c5fd" stroke-width="2" />
          <text x="90" y="45" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" text-anchor="middle">Primary PostgreSQL</text>
          <text x="90" y="68" fill="#dbeafe" font-family="monospace" font-size="11" text-anchor="middle">Write / Cache MISS</text>
        </g>

        <!-- Read Replica DB -->
        <g transform="translate(600, 210)">
          <rect width="140" height="100" rx="14" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="70" y="45" fill="#93c5fd" font-family="system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">Read Replica</text>
          <text x="70" y="68" fill="#64748b" font-family="monospace" font-size="10" text-anchor="middle">WAL Streaming</text>
        </g>

        <!-- Connecting Arrows -->
        <path d="M 220 160 L 340 95" stroke="#4ade80" stroke-width="3" stroke-linecap="round" />
        <text x="270" y="115" fill="#4ade80" font-family="monospace" font-size="10" font-weight="bold">1. Check Cache</text>

        <path d="M 220 200 L 340 250" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
        <text x="260" y="245" fill="#f59e0b" font-family="monospace" font-size="10" font-weight="bold">2. On Miss: DB</text>

        <path d="M 430 210 L 430 140" stroke="#a78bfa" stroke-width="2.5" stroke-dasharray="5,5" />
        <text x="440" y="180" fill="#c4b5fd" font-family="monospace" font-size="10">3. Write Back + TTL</text>

        <path d="M 520 260 L 600 260" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" />
        <text x="560" y="250" fill="#93c5fd" font-family="monospace" font-size="9" text-anchor="middle">Sync</text>
      </svg>
    `)}`
  },
  {
    id: 'preset-client-state',
    title: 'Frontend State Architecture & Storage Flow',
    alt: 'Frontend State Hierarchy and Storage Flow',
    caption: 'Figure: Ephemeral useState, Shareable URL State, and Durable Browser Storage',
    description: 'Clear visual tier of Ephemeral, URL Query Params, Durable LocalStorage, and Remote Source of Truth.',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="100%" height="100%">
        <defs>
          <linearGradient id="stateBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#2e1065" />
          </linearGradient>
        </defs>
        <rect width="800" height="360" rx="18" fill="url(#stateBg)" />

        <!-- Tier 1 -->
        <g transform="translate(40, 50)">
          <rect width="160" height="260" rx="14" fill="#1e293b" stroke="#f43f5e" stroke-width="2" />
          <rect x="0" y="0" width="160" height="42" rx="14" fill="#f43f5e" />
          <text x="80" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">1. Ephemeral UI</text>
          <text x="80" y="75" fill="#fecdd3" font-family="monospace" font-size="11" text-anchor="middle">useState / useRef</text>
          <text x="80" y="110" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Modal Toggles</text>
          <text x="80" y="140" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Form Draft Inputs</text>
          <text x="80" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Hover / Tooltips</text>
          <text x="80" y="240" fill="#fb7185" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Lifespan: Unmount</text>
        </g>

        <!-- Tier 2 -->
        <g transform="translate(230, 50)">
          <rect width="160" height="260" rx="14" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
          <rect x="0" y="0" width="160" height="42" rx="14" fill="#3b82f6" />
          <text x="80" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">2. Shareable URL</text>
          <text x="80" y="75" fill="#bfdbfe" font-family="monospace" font-size="11" text-anchor="middle">useSearchParams</text>
          <text x="80" y="110" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Active Tab Index</text>
          <text x="80" y="140" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Filter Query Terms</text>
          <text x="80" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Deep Link Anchors</text>
          <text x="80" y="240" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Lifespan: Shareable</text>
        </g>

        <!-- Tier 3 -->
        <g transform="translate(420, 50)">
          <rect width="160" height="260" rx="14" fill="#1e293b" stroke="#10b981" stroke-width="2" />
          <rect x="0" y="0" width="160" height="42" rx="14" fill="#10b981" />
          <text x="80" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">3. Durable Storage</text>
          <text x="80" y="75" fill="#a7f3d0" font-family="monospace" font-size="11" text-anchor="middle">LocalStorage</text>
          <text x="80" y="110" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Dark Theme Preference</text>
          <text x="80" y="140" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Course Completion</text>
          <text x="80" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Quiz Scores</text>
          <text x="80" y="240" fill="#34d399" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Lifespan: Device</text>
        </g>

        <!-- Tier 4 -->
        <g transform="translate(610, 50)">
          <rect width="150" height="260" rx="14" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" />
          <rect x="0" y="0" width="150" height="42" rx="14" fill="#8b5cf6" />
          <text x="75" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="13" text-anchor="middle">4. Remote Master</text>
          <text x="75" y="75" fill="#ddd6fe" font-family="monospace" font-size="11" text-anchor="middle">REST / RPC API</text>
          <text x="75" y="110" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Course Catalog</text>
          <text x="75" y="140" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Verified Auth State</text>
          <text x="75" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">&bull; Multi-Device Sync</text>
          <text x="75" y="240" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Lifespan: Permanent</text>
        </g>
      </svg>
    `)}`
  }
];

// Quick relative path suggestions
const RELATIVE_SUGGESTIONS = [
  { label: '/assets/', value: '/assets/' },
  { label: '/images/', value: '/images/' },
  { label: './assets/', value: './assets/' },
  { label: './images/', value: './images/' },
  { label: '/public/', value: '/public/' }
];

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'relative' | 'presets'>('local');

  // Local file state
  const [localDataUrl, setLocalDataUrl] = useState<string>('');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    sizeKb: number;
    dimensions?: string;
    type: string;
    isSvg: boolean;
  } | null>(null);
  const [shouldOptimize, setShouldOptimize] = useState<boolean>(true);
  const [optimizedDataUrl, setOptimizedDataUrl] = useState<string>('');
  const [optimizedSizeKb, setOptimizedSizeKb] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragOverDropzone, setIsDragOverDropzone] = useState<boolean>(false);

  // Inputs for all tabs
  const [altText, setAltText] = useState<string>('');
  const [captionText, setCaptionText] = useState<string>('');

  // Relative path / URL state
  const [pathInput, setPathInput] = useState<string>('');
  const [pathStatus, setPathStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAltText('');
      setCaptionText('');
    }
  }, [isOpen]);

  // Clean filename to human-friendly alt text
  const sanitizeFileNameToAlt = (fileName: string): string => {
    return fileName
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[-_]+/g, ' ') // replace hyphens and underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize words
  };

  // Image optimization helper (resizes huge images via canvas for lightweight storage)
  const compressImage = (file: File, dataUrl: string): Promise<{ dataUrl: string; sizeKb: number }> => {
    return new Promise((resolve) => {
      // SVGs do not need raster compression
      if (file.type === 'image/svg+xml') {
        resolve({ dataUrl, sizeKb: Math.round(dataUrl.length / 1024) });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1440;
        const MAX_HEIGHT = 1440;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl, sizeKb: Math.round(dataUrl.length / 1024) });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG for superior compression
        const mimeType = file.type === 'image/png' && !shouldOptimize ? 'image/png' : 'image/webp';
        const compressed = canvas.toDataURL(mimeType, 0.86);
        const sizeKb = Math.round((compressed.length * 3) / 4 / 1024);
        resolve({ dataUrl: compressed, sizeKb });
      };

      img.onerror = () => {
        resolve({ dataUrl, sizeKb: Math.round(dataUrl.length / 1024) });
      };

      img.src = dataUrl;
    });
  };

  // Handle file selection
  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.png, .jpg, .svg, .webp, .gif)');
      return;
    }

    setRawFile(file);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setLocalDataUrl(result);

      const isSvg = file.type === 'image/svg+xml';
      const sizeKb = Math.round(file.size / 1024);

      // Measure dimensions
      const img = new Image();
      img.onload = async () => {
        setFileDetails({
          name: file.name,
          sizeKb,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
          type: file.type || 'image',
          isSvg
        });

        // Set default alt text
        if (!altText) {
          setAltText(sanitizeFileNameToAlt(file.name));
        }

        // Perform fast optimization preview
        setIsCompressing(true);
        const optimized = await compressImage(file, result);
        setOptimizedDataUrl(optimized.dataUrl);
        setOptimizedSizeKb(optimized.sizeKb);
        setIsCompressing(false);
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  // Drag & drop handlers for local file dropzone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(true);
  };

  const handleDragLeave = () => {
    setIsDragOverDropzone(false);
  };

  // Test relative path / URL loading
  const handlePathChange = (val: string) => {
    setPathInput(val);
    if (!val.trim()) {
      setPathStatus('idle');
      return;
    }

    setPathStatus('loading');
    const testImg = new Image();
    testImg.onload = () => setPathStatus('success');
    testImg.onerror = () => setPathStatus('error');
    testImg.src = val.trim();
  };

  // Submit and insert into Markdown
  const handleInsertLocal = () => {
    const finalUrl = (shouldOptimize && optimizedDataUrl) ? optimizedDataUrl : localDataUrl;
    if (!finalUrl) return;

    const alt = altText.trim() || 'Visual Diagram Reference';
    const caption = captionText.trim();
    const markdown = caption
      ? `![${alt}](${finalUrl} "${caption}")\n`
      : `![${alt}](${finalUrl})\n`;

    onInsertImage(markdown);
    onClose();
  };

  const handleInsertRelative = () => {
    if (!pathInput.trim()) return;
    const cleanPath = pathInput.trim();
    const alt = altText.trim() || 'Image Reference';
    const caption = captionText.trim();

    // If path contains spaces, wrap in angle brackets <path> as standard Markdown
    const formattedSrc = cleanPath.includes(' ') && !cleanPath.startsWith('<') ? `<${cleanPath}>` : cleanPath;

    const markdown = caption
      ? `![${alt}](${formattedSrc} "${caption}")\n`
      : `![${alt}](${formattedSrc})\n`;

    onInsertImage(markdown);
    onClose();
  };

  const handleInsertPreset = (preset: typeof ARCHITECTURE_PRESETS[0]) => {
    const alt = altText.trim() || preset.alt;
    const caption = captionText.trim() || preset.caption;
    const markdown = `![${alt}](${preset.dataUrl} "${caption}")\n`;

    onInsertImage(markdown);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Insert Image &amp; Visual Reference
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import local files (as embedded Base64 Data URLs), reference relative paths, or use architecture templates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>📁 Local Machine Image</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relative')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'relative'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>🔗 Relative Path or URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>📐 Architecture Presets</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* TAB 1: LOCAL FILE IMPORT */}
          {activeTab === 'local' && (
            <div className="space-y-5">
              {!localDataUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group ${
                    isDragOverDropzone
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:border-indigo-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to browse or drag &amp; drop an image here
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports PNG, JPG, SVG, WebP, GIF &bull; Converted directly into ultra-fast self-contained Base64
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60 mt-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Client-side FileReader &bull; 100% Offline Compatible</span>
                  </div>
                </div>
              ) : (
                /* Selected File Preview & Settings */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col sm:flex-row items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 relative group shrink-0">
                      <img
                        src={(shouldOptimize && optimizedDataUrl) ? optimizedDataUrl : localDataUrl}
                        alt="Local Preview"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>

                    {/* File Meta */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                            {fileDetails?.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{fileDetails?.dimensions}</span>
                            <span>&bull;</span>
                            <span>{fileDetails?.type}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLocalDataUrl('');
                            setRawFile(null);
                            setFileDetails(null);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Storage Optimization Switch */}
                      {!fileDetails?.isSvg && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                          <label className="flex items-center gap-2 text-xs font-semibold text-indigo-950 dark:text-indigo-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={shouldOptimize}
                              onChange={(e) => setShouldOptimize(e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Optimize &amp; Resize for Fast Storage (Recommended)</span>
                          </label>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                            <span>Original: <strong>{fileDetails?.sizeKb} KB</strong></span>
                            {shouldOptimize && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                Optimized: ~{optimizedSizeKb} KB ({Math.max(0, Math.round((1 - optimizedSizeKb / (fileDetails?.sizeKb || 1)) * 100))}% saved)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {fileDetails?.isSvg && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5" /> Vector SVG preserved at 100% infinite scale fidelity
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alt Text & Caption Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Alt Text / Description <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="e.g., Central System Architecture Diagram"
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Figure Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="e.g., Figure 1.2: Component Data Pipeline"
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLocalDataUrl('')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Choose Different File
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertLocal}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Insert into Lesson Markdown
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RELATIVE PATH OR ONLINE URL */}
          {activeTab === 'relative' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relative Path or Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pathInput}
                    onChange={(e) => handlePathChange(e.target.value)}
                    placeholder="e.g., /assets/diagram.png, ./images/architecture.svg, or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Quick Folder Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400">Quick prefixes:</span>
                  {RELATIVE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => handlePathChange(`${sug.value}`)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-[11px] font-mono border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {pathInput.trim() && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Live Path Verification</span>
                    {pathStatus === 'loading' && <span className="text-indigo-500 animate-pulse font-mono text-[11px]">Testing path...</span>}
                    {pathStatus === 'success' && <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]"><Check className="w-3 h-3" /> Image Loaded Successfully</span>}
                    {pathStatus === 'error' && <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 text-[11px]"><Info className="w-3 h-3" /> Relative path (Resolves at web server root)</span>}
                  </div>

                  <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                    <img
                      src={pathInput.trim()}
                      alt="Path verification"
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={() => setPathStatus('error')}
                      onLoad={() => setPathStatus('success')}
                    />
                  </div>
                </div>
              )}

              {/* Alt Text & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alt Text / Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="e.g., High-Level Topology Architecture"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Figure Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="e.g., Figure 2.1: Microservice Communication"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!pathInput.trim()}
                  onClick={handleInsertRelative}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Insert Path Image
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Insert pre-engineered, high-resolution vector SVG diagrams directly into your lesson with 1-click:
              </p>

              <div className="grid grid-cols-1 gap-4">
                {ARCHITECTURE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <div className="w-full sm:w-56 h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={preset.dataUrl}
                        alt={preset.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-left w-full">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 pt-1">
                        {preset.caption}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInsertPreset(preset)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Insert Preset</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Images support zoom, fullscreen inspection lightbox, and automatic theme adaptation</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
