import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Eye,
  Download,
  AlertCircle,
  Sparkles,
  GitBranch,
  X
} from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  title?: string;
  className?: string;
}

// Detect diagram type from first non-empty lines
const detectDiagramType = (code: string): { label: string; icon: string } => {
  const clean = code.trim().toLowerCase();
  if (clean.startsWith('flowchart') || clean.startsWith('graph')) return { label: 'Flowchart / Architecture', icon: 'flow' };
  if (clean.startsWith('sequencediagram')) return { label: 'Sequence Diagram', icon: 'sequence' };
  if (clean.startsWith('statediagram')) return { label: 'State Machine', icon: 'state' };
  if (clean.startsWith('erdiagram')) return { label: 'Entity Relationship (ER)', icon: 'er' };
  if (clean.startsWith('classdiagram')) return { label: 'Class Hierarchy', icon: 'class' };
  if (clean.startsWith('gitgraph')) return { label: 'Git Branch Flow', icon: 'git' };
  if (clean.startsWith('journey')) return { label: 'User Journey Map', icon: 'journey' };
  if (clean.startsWith('gantt')) return { label: 'Gantt Timeline', icon: 'gantt' };
  if (clean.startsWith('pie')) return { label: 'Pie Distribution', icon: 'pie' };
  if (clean.startsWith('mindmap')) return { label: 'Mermaid Mindmap', icon: 'mindmap' };
  if (clean.startsWith('timeline')) return { label: 'Chronological Timeline', icon: 'timeline' };
  if (clean.startsWith('quadrantchart')) return { label: 'Quadrant Matrix', icon: 'quadrant' };
  if (clean.startsWith('c4context') || clean.startsWith('c4container')) return { label: 'C4 Architecture', icon: 'c4' };
  return { label: 'Mermaid Visual Diagram', icon: 'diagram' };
};

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, title, className }) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [zoom, setZoom] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));

  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueIdRef = useRef<string>(`mermaid-${Math.random().toString(36).substring(2, 9)}`);
  const diagInfo = detectDiagramType(chart);

  // Sync dark mode changes from document class observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains('dark');
      setIsDark(darkActive);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Initialize and Render Mermaid SVG
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const renderDiagram = async () => {
      if (!chart.trim()) {
        setSvgHtml('');
        setIsLoading(false);
        return;
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          theme: isDark ? 'dark' : 'default',
          themeVariables: isDark
            ? {
                primaryColor: '#3730a3',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#6366f1',
                lineColor: '#818cf8',
                secondaryColor: '#1e1b4b',
                tertiaryColor: '#0f172a',
                background: '#0b0f19',
                mainBkg: '#1e293b',
                nodeBorder: '#6366f1',
                clusterBkg: '#0f172a',
                clusterBorder: '#334155',
                titleColor: '#f1f5f9',
                edgeLabelBackground: '#1e293b',
                actorBkg: '#312e81',
                actorBorder: '#6366f1',
                actorTextColor: '#ffffff',
                signalColor: '#818cf8',
                signalTextColor: '#f1f5f9'
              }
            : {
                primaryColor: '#e0e7ff',
                primaryTextColor: '#1e1b4b',
                primaryBorderColor: '#6366f1',
                lineColor: '#4f46e5',
                secondaryColor: '#f5f3ff',
                tertiaryColor: '#ffffff',
                background: '#ffffff',
                mainBkg: '#f8fafc',
                nodeBorder: '#818cf8',
                clusterBkg: '#f1f5f9',
                clusterBorder: '#cbd5e1',
                titleColor: '#0f172a',
                edgeLabelBackground: '#f8fafc',
                actorBkg: '#e0e7ff',
                actorBorder: '#6366f1',
                actorTextColor: '#1e1b4b',
                signalColor: '#4f46e5',
                signalTextColor: '#0f172a'
              }
        });

        // Unique ID per render to prevent collisions
        const renderId = `${uniqueIdRef.current}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart);

        if (isMounted) {
          // Enhance rendered SVG with responsive styles
          const responsiveSvg = svg
            .replace(/<svg\s+/, '<svg class="max-w-full h-auto mx-auto" ')
            .replace(/height="[^"]*"/, '')
            .replace(/style="[^"]*max-width:[^;]*;?"/, 'style="max-width: 100%;"');

          setSvgHtml(responsiveSvg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg);
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, isDark]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${diagInfo.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-diagram.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`my-8 group/mermaid relative ${className || ''}`}>
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl transition-all overflow-hidden">

        {/* Top Header Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">

          {/* Badge & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <GitBranch className="w-3.5 h-3.5 shrink-0" />
              <span>{diagInfo.label}</span>
            </span>
            {title && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                {title}
              </span>
            )}
          </div>

          {/* Actions Toolbar */}
          <div className="flex items-center gap-1">

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg mr-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'visual'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visual Diagram"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Mermaid Code Source"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
              </button>
            </div>

            {/* Zoom Controls (when in visual mode) */}
            {viewMode === 'visual' && !error && (
              <div className="hidden md:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded-lg mr-1">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                  className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="px-1.5 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}
                  className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Export SVG */}
            {!error && svgHtml && (
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Download SVG vector"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Copy Raw Code */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Mermaid Code"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Lightbox Trigger */}
            {!error && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Inspect in Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        </div>

        {/* Content Body */}
        <div className="relative min-h-[160px] flex items-center justify-center p-4 sm:p-6 bg-slate-50/40 dark:bg-slate-950/40">

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
              <Sparkles className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-mono">Compiling Mermaid matrix...</span>
            </div>
          )}

          {/* Syntax Error Notice */}
          {error && (
            <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider">Mermaid Syntax Warning</div>
                  <p className="text-xs font-mono text-rose-700 dark:text-rose-300 break-all">{error}</p>
                  <button
                    type="button"
                    onClick={() => setViewMode('code')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-200 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" /> Inspect & Fix Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visual SVG Output */}
          {!isLoading && !error && viewMode === 'visual' && (
            <div
              ref={containerRef}
              className="w-full flex justify-center items-center overflow-x-auto transition-transform duration-150"
              style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: 'center center' }}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )}

          {/* Source Code View */}
          {viewMode === 'code' && (
            <div className="w-full rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre className="leading-relaxed whitespace-pre">{chart}</pre>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Interactive Mermaid diagram &bull; Vector Scalable</span>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="hover:text-indigo-500 transition-colors cursor-pointer"
          >
            Reset zoom
          </button>
        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in">

          {/* Lightbox Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold truncate max-w-md font-display">
                {title || diagInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.4, +(z - 0.2).toFixed(2)))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 py-0.5 bg-white/10 rounded-md">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(3, +(z + 0.2).toFixed(2)))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors ml-2 cursor-pointer flex items-center gap-1 text-xs font-semibold px-3"
              >
                <Download className="w-3.5 h-3.5" /> SVG
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors ml-1 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Scaled Canvas */}
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsLightboxOpen(false);
            }}
            className="flex-1 w-full flex items-center justify-center p-6 overflow-auto"
          >
            <div
              className="max-h-[82vh] max-w-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>

          {/* Lightbox Footer */}
          <div className="text-center text-xs text-slate-400 py-1">
            <span>Use zoom controls or scroll to inspect diagram details &bull; Click background or press close to exit</span>
          </div>

        </div>
      )}

    </div>
  );
};
