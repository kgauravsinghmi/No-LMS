import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Network,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';

export interface MindmapNode {
  id: string;
  title: string;
  level: number;
  parentId?: string;
  children: MindmapNode[];
}

interface MindmapViewerProps {
  content: string;
  title?: string;
  className?: string;
}

interface ConnectorPath {
  id: string;
  d: string;
  color: string;
}

const BRANCH_ACCENTS = [
  { stroke: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/60', border: 'border-indigo-300/80 dark:border-indigo-700/80', text: 'text-indigo-900 dark:text-indigo-200', dot: 'bg-indigo-500' },
  { stroke: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-300/80 dark:border-emerald-700/80', text: 'text-emerald-900 dark:text-emerald-200', dot: 'bg-emerald-500' },
  { stroke: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-300/80 dark:border-violet-700/80', text: 'text-violet-900 dark:text-violet-200', dot: 'bg-violet-500' },
  { stroke: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-950/60', border: 'border-cyan-300/80 dark:border-cyan-700/80', text: 'text-cyan-900 dark:text-cyan-200', dot: 'bg-cyan-500' },
  { stroke: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-300/80 dark:border-amber-700/80', text: 'text-amber-900 dark:text-amber-200', dot: 'bg-amber-500' },
  { stroke: '#f43f5e', bg: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-300/80 dark:border-rose-700/80', text: 'text-rose-900 dark:text-rose-200', dot: 'bg-rose-500' }
];

export const parseMindmapContent = (raw: string): MindmapNode | null => {
  const lines = raw.split('\n').map(l => l.trimEnd()).filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;

  // 1. Markdown Heading Syntax (#, ##, ###)
  const isHeadingSyntax = lines.some(l => l.trim().startsWith('#'));
  if (isHeadingSyntax) {
    let rootNode: MindmapNode | null = null;
    const stack: MindmapNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const hashMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (hashMatch) {
        const level = hashMatch[1].length;
        const title = hashMatch[2].trim();
        const node: MindmapNode = {
          id: `node-${idx}-${title.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 15)}`,
          title,
          level,
          children: []
        };

        if (level === 1 && !rootNode) {
          rootNode = node;
          stack.length = 0;
          stack.push(node);
        } else {
          if (!rootNode) {
            rootNode = { id: 'root-nexus', title: 'Concept Map', level: 0, children: [] };
            stack.push(rootNode);
          }
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
          const parent = stack.length > 0 ? stack[stack.length - 1] : rootNode;
          node.parentId = parent.id;
          parent.children.push(node);
          stack.push(node);
        }
      }
    });

    return rootNode || { id: 'root-nexus', title: 'Mindmap', level: 0, children: [] };
  }

  // 2. Mermaid style (mindmap \n root((Title)) \n branch) or Indented Outline
  let rootTitle = 'Core Concept';
  let firstLine = lines[0].trim();

  if (firstLine.toLowerCase().startsWith('mindmap')) {
    lines.shift();
    if (lines.length > 0) firstLine = lines[0].trim();
  }

  const rootMatch = firstLine.match(/root(?:\(\((.*?)\)\)|\((.*?)\)|\[(.*?)\]|\s+(.*))/i);
  if (rootMatch) {
    rootTitle = (rootMatch[1] || rootMatch[2] || rootMatch[3] || rootMatch[4] || 'Concept Map').trim();
    lines.shift();
  } else if (!firstLine.startsWith('-') && !firstLine.startsWith('*') && !firstLine.startsWith(' ') && !firstLine.startsWith('\t')) {
    rootTitle = firstLine;
    lines.shift();
  }

  const root: MindmapNode = {
    id: 'root-nexus',
    title: rootTitle,
    level: 0,
    children: []
  };

  const stack: { node: MindmapNode; indent: number }[] = [{ node: root, indent: -1 }];

  lines.forEach((line, idx) => {
    const rawIndent = line.search(/\S/);
    if (rawIndent === -1) return;

    let cleanText = line.trim();
    cleanText = cleanText.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '').trim();
    if (!cleanText) return;

    const shapeMatch = cleanText.match(/^(?:[\w\d_-]+\s*)?(?:\(\((.*?)\)\)|\((.*?)\)|\[(.*?)\]|::icon\((.*?)\)|"(.*?)"|`(.*?)`)/);
    if (shapeMatch) {
      cleanText = (shapeMatch[1] || shapeMatch[2] || shapeMatch[3] || shapeMatch[5] || shapeMatch[6] || cleanText).trim();
    }

    const node: MindmapNode = {
      id: `node-${idx}-${cleanText.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 15)}`,
      title: cleanText,
      level: 1,
      children: []
    };

    while (stack.length > 1 && stack[stack.length - 1].indent >= rawIndent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    node.level = parent.level + 1;
    node.parentId = parent.id;
    parent.children.push(node);
    stack.push({ node, indent: rawIndent });
  });

  return root;
};

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ content, title, className }) => {
  const [viewMode, setViewMode] = useState<'arrows' | 'compact' | 'source'>('arrows');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [connectorPaths, setConnectorPaths] = useState<ConnectorPath[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphContentRef = useRef<HTMLDivElement>(null);
  const rootNode = useMemo(() => parseMindmapContent(content), [content]);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate smooth SVG bezier connecting arrows between parent & child nodes
  const calculateConnectors = useCallback(() => {
    if (!graphContentRef.current || viewMode !== 'arrows') {
      setConnectorPaths([]);
      return;
    }

    const container = graphContentRef.current;
    const containerRect = container.getBoundingClientRect();
    const paths: ConnectorPath[] = [];

    // Find all node elements
    const childElements = container.querySelectorAll<HTMLElement>('[data-node-id][data-parent-id]');

    childElements.forEach((childEl) => {
      const parentId = childEl.getAttribute('data-parent-id');
      const childId = childEl.getAttribute('data-node-id');
      const branchColor = childEl.getAttribute('data-branch-color') || '#6366f1';

      if (!parentId || !childId) return;

      const parentEl = container.querySelector<HTMLElement>(`[data-node-id="${parentId}"]`);
      if (!parentEl) return;

      const pRect = parentEl.getBoundingClientRect();
      const cRect = childEl.getBoundingClientRect();

      // Parent exit point (middle-right of parent)
      const startX = pRect.right - containerRect.left + container.scrollLeft;
      const startY = pRect.top + pRect.height / 2 - containerRect.top + container.scrollTop;

      // Child entry point (middle-left of child)
      const endX = cRect.left - containerRect.left + container.scrollLeft - 3;
      const endY = cRect.top + cRect.height / 2 - containerRect.top + container.scrollTop;

      // Control points for smooth horizontal S-curve
      const deltaX = Math.max(20, (endX - startX) * 0.5);
      const d = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

      paths.push({
        id: `${parentId}->${childId}`,
        d,
        color: branchColor
      });
    });

    setConnectorPaths(paths);
  }, [viewMode]);

  // Recalculate connectors on render, zoom, collapse, or resize
  useEffect(() => {
    const timer = setTimeout(calculateConnectors, 50);
    const handleResize = () => calculateConnectors();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => calculateConnectors());
    if (graphContentRef.current) {
      observer.observe(graphContentRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [calculateConnectors, zoomScale, collapsedNodes, isExpanded, viewMode]);

  if (!rootNode) return null;

  return (
    <div
      ref={containerRef}
      className={`my-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all ${className || ''} ${
        isExpanded ? 'fixed inset-3 sm:inset-6 z-50 flex flex-col shadow-2xl backdrop-blur-xl' : 'relative'
      }`}
    >
      {/* Sleek Minimalist Toolbar */}
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-xs">
        {/* Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">
            <Network className="w-3 h-3" />
            <span>Mindmap</span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-xs">
            {title || rootNode.title}
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            ({rootNode.children.length} branches)
          </span>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('arrows')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                viewMode === 'arrows'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Flow with Connecting Arrows"
            >
              Arrow Tree
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Compact Outline"
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setViewMode('source')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                viewMode === 'source'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Raw Code"
            >
              Source
            </button>
          </div>

          {/* Zoom controls (for arrow view) */}
          {viewMode === 'arrows' && (
            <div className="hidden md:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-1 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.min(1.8, +(z + 0.15).toFixed(2)))}
                className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Copy Mindmap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand full view'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Body */}
      <div
        className={`relative overflow-auto p-4 sm:p-5 bg-slate-50/30 dark:bg-slate-950/40 transition-all ${
          isExpanded ? 'flex-1' : 'min-h-[140px] max-h-[380px]'
        }`}
      >
        {/* MODE 1: Horizontal Tree with Directional SVG Connecting Arrows */}
        {viewMode === 'arrows' && (
          <div
            ref={graphContentRef}
            className="relative inline-flex items-center min-w-max p-3 transition-transform duration-150 origin-left"
            style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined }}
          >
            {/* SVG Overlay for Connected Arrows */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            >
              <defs>
                {BRANCH_ACCENTS.map((accent, i) => (
                  <marker
                    key={`arrow-${i}`}
                    id={`mindmap-arrow-${i}`}
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 8 5 L 0 8 z" fill={accent.stroke} opacity="0.85" />
                  </marker>
                ))}
              </defs>

              {connectorPaths.map((cPath) => {
                const accentIdx = BRANCH_ACCENTS.findIndex(a => a.stroke === cPath.color);
                const markerId = accentIdx >= 0 ? `url(#mindmap-arrow-${accentIdx})` : undefined;

                return (
                  <path
                    key={cPath.id}
                    d={cPath.d}
                    fill="none"
                    stroke={cPath.color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeOpacity="0.75"
                    markerEnd={markerId}
                  />
                );
              })}
            </svg>

            {/* Tree Flow: Column 1 (Root Node) */}
            <div className="relative z-10 flex items-center pr-12">
              <div
                data-node-id={rootNode.id}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white font-bold text-xs shadow-md border border-white/20 flex items-center gap-2 max-w-xs"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-200" />
                <span className="truncate">{rootNode.title}</span>
              </div>
            </div>

            {/* Tree Flow: Column 2 (Branches) & Column 3 (Leaves) */}
            <div className="relative z-10 flex flex-col gap-3">
              {rootNode.children.map((branch, bIdx) => {
                const accent = BRANCH_ACCENTS[bIdx % BRANCH_ACCENTS.length];
                const isCollapsed = collapsedNodes[branch.id];
                const hasChildren = branch.children && branch.children.length > 0;

                return (
                  <div key={branch.id} className="flex items-center gap-10">
                    {/* Branch Pill */}
                    <div
                      data-node-id={branch.id}
                      data-parent-id={rootNode.id}
                      data-branch-color={accent.stroke}
                      className={`px-3 py-1.5 rounded-xl border ${accent.border} ${accent.bg} ${accent.text} text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all hover:scale-[1.02]`}
                    >
                      <span className={`w-2 h-2 rounded-full ${accent.dot} shrink-0`} />
                      <span className="truncate max-w-[200px]">{branch.title}</span>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleCollapse(branch.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Sub-children Column */}
                    {hasChildren && !isCollapsed && (
                      <div className="flex flex-col gap-1.5 py-0.5">
                        {branch.children.map((leaf) => (
                          <div
                            key={leaf.id}
                            data-node-id={leaf.id}
                            data-parent-id={branch.id}
                            data-branch-color={accent.stroke}
                            className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1.5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                          >
                            <span className="text-slate-400 text-[9px]">&bull;</span>
                            <span className="truncate max-w-[220px]">{leaf.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: Minimalist Compact Outline */}
        {viewMode === 'compact' && (
          <div className="max-w-2xl mx-auto space-y-2 py-1 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 shadow-xs">
              <Network className="w-3.5 h-3.5" />
              <span>{rootNode.title}</span>
            </div>

            <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-2">
              {rootNode.children.map((branch, bIdx) => {
                const accent = BRANCH_ACCENTS[bIdx % BRANCH_ACCENTS.length];
                return (
                  <div key={branch.id} className="space-y-1">
                    <div className={`px-2.5 py-1 rounded-lg border ${accent.border} ${accent.bg} ${accent.text} font-semibold flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                      <span>{branch.title}</span>
                    </div>

                    {branch.children.length > 0 && (
                      <div className="pl-4 border-l border-slate-200 dark:border-slate-700 space-y-1 py-0.5">
                        {branch.children.map((sub) => (
                          <div key={sub.id} className="px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <span className="text-indigo-400">&rarr;</span>
                            <span>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 3: Raw Source Code */}
        {viewMode === 'source' && (
          <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{content}</code>
          </pre>
        )}
      </div>

      {/* Slim Footer */}
      <div className="px-3.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>Compact Visual Tree with Directional Flow &bull; Click branch arrows to toggle</span>
        <button
          type="button"
          onClick={() => setZoomScale(1)}
          className="hover:text-indigo-500 transition-colors cursor-pointer"
        >
          Reset zoom
        </button>
      </div>
    </div>
  );
};
