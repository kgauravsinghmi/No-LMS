import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Check,
  FileImage,
  Layers,
  Trash2,
  Info,
  Zap,
  ArrowRight,
  Cloud,
  Library,
  Clock,
  HardDrive
} from 'lucide-react';
import { mediaStorageService, StoredMediaAsset } from '../../services/media/mediaStorageService';
import { dbClient } from '../../services/db/supabaseClient';

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
  }
];

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
  const [activeTab, setActiveTab] = useState<'upload' | 'relative' | 'presets' | 'library'>('upload');

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [shouldCompress, setShouldCompress] = useState<boolean>(true);
  const [uploadedCdnUrl, setUploadedCdnUrl] = useState<string>('');
  const [fileStats, setFileStats] = useState<{
    name: string;
    sizeKb: number;
    dimensions?: string;
    type: string;
    isSvg: boolean;
  } | null>(null);

  // Common inputs
  const [altText, setAltText] = useState<string>('');
  const [captionText, setCaptionText] = useState<string>('');

  // Relative path / URL state
  const [pathInput, setPathInput] = useState<string>('');
  const [pathStatus, setPathStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Media Library state
  const [storedAssets, setStoredAssets] = useState<StoredMediaAsset[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAltText('');
      setCaptionText('');
      setStoredAssets(mediaStorageService.getMediaAssets());
    }
  }, [isOpen]);

  const sanitizeFileNameToAlt = (fileName: string): string => {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.png, .jpg, .svg, .webp, .gif)');
      return;
    }

    setSelectedFile(file);
    const isSvg = file.type === 'image/svg+xml';
    const sizeKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      const img = new Image();
      img.onload = () => {
        setFileStats({
          name: file.name,
          sizeKb,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
          type: file.type,
          isSvg
        });
        if (!altText) {
          setAltText(sanitizeFileNameToAlt(file.name));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndInsert = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result = await mediaStorageService.uploadAsset(selectedFile, {
        compress: shouldCompress,
        onProgress: (p) => setUploadProgress(p)
      });

      setUploadedCdnUrl(result.url);
      setStoredAssets(mediaStorageService.getMediaAssets());

      const alt = altText.trim() || sanitizeFileNameToAlt(selectedFile.name);
      const caption = captionText.trim();
      const markdown = caption
        ? `![${alt}](${result.url} "${caption}")\n`
        : `![${alt}](${result.url})\n`;

      onInsertImage(markdown);
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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

  const handleInsertRelative = () => {
    if (!pathInput.trim()) return;
    const cleanPath = pathInput.trim();
    const alt = altText.trim() || 'Image Reference';
    const caption = captionText.trim();
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

  const handleInsertFromLibrary = (asset: StoredMediaAsset) => {
    const alt = altText.trim() || sanitizeFileNameToAlt(asset.name);
    const caption = captionText.trim();
    const markdown = caption
      ? `![${alt}](${asset.url} "${caption}")\n`
      : `![${alt}](${asset.url})\n`;

    onInsertImage(markdown);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Insert Media &amp; Visual Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cloud CDN Storage, WebP compression, local Base64, and vector SVG presets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Cloud className="w-4 h-4 text-indigo-500" />
            <span>Cloud &amp; Local Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'library'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Library className="w-4 h-4 text-emerald-500" />
            <span>Asset Library ({storedAssets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relative')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'relative'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Relative Path / URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Architecture Presets</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:border-indigo-400 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Choose an image or drop file here
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-compressed to WebP &bull; Direct Cloud CDN upload with offline Base64 fallback
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {dbClient.isLiveDatabaseEnabled() ? 'Cloud Storage Bucket Active' : 'Offline Mode (Local Base64)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 relative shrink-0">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                            {fileStats?.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{fileStats?.dimensions}</span>
                            <span>&bull;</span>
                            <span>{fileStats?.sizeKb} KB</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl('');
                            setFileStats(null);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {!fileStats?.isSvg && (
                        <label className="flex items-center gap-2 text-xs font-semibold text-indigo-950 dark:text-indigo-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shouldCompress}
                            onChange={(e) => setShouldCompress(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>WebP canvas compression (85% quality reduction)</span>
                        </label>
                      )}

                      {isUploading && (
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Uploading to storage...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Alt Text / Description <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="e.g., Central Architecture Pipeline"
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
                        placeholder="e.g., Figure 1.1: Distributed Routing"
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleUploadAndInsert}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload & Insert Markdown'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSET LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Reuse previously uploaded diagrams, charts, and media assets across courses:
              </p>

              {storedAssets.length === 0 ? (
                <div className="p-8 text-center border rounded-2xl border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
                  No assets stored yet. Upload images in the "Cloud &amp; Local Upload" tab.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {storedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between gap-3 group hover:border-indigo-400 transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-1 shrink-0">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{asset.sizeKb} KB</span>
                          <span>&bull;</span>
                          <span className="truncate">{asset.dimensions || 'Image'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleInsertFromLibrary(asset)}
                          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          title="Insert into Markdown"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            mediaStorageService.deleteAsset(asset.id);
                            setStoredAssets(mediaStorageService.getMediaAssets());
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RELATIVE PATH / URL */}
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
                    placeholder="e.g., /assets/diagram.png or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

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

              {pathInput.trim() && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Live Path Verification</span>
                    {pathStatus === 'loading' && <span className="text-indigo-500 animate-pulse font-mono text-[11px]">Testing path...</span>}
                    {pathStatus === 'success' && <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]"><Check className="w-3 h-3" /> Loaded</span>}
                    {pathStatus === 'error' && <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 text-[11px]"><Info className="w-3 h-3" /> Relative path</span>}
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

          {/* TAB 4: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Insert pre-engineered, high-resolution vector SVG diagrams directly into your lesson:
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Integrated WebP optimization &amp; automatic SVG vector rendering</span>
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
