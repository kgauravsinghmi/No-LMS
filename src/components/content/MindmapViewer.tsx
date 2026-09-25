import React, { useState, useMemo } from 'react';
import {
  Network,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Code
} from 'lucide-react';

export interface MindmapNode {
  id: string;
  title: string;
  level: number;
  children: MindmapNode[];
  color?: string;
  icon?: string;
  note?: string;
}

interface MindmapViewerProps {
  content: string;
  title?: string;
}

const BRANCH_COLORS = [
  {
    bg: 'bg-indigo-50 dark:bg-indigo-950/70',
    border: 'border-indigo-300 dark:border-indigo-700',
    text: 'text-indigo-800 dark:text-indigo-200',
    accent: 'bg-indigo-500',
    glow: 'from-indigo-500/20 to-purple-500/20',
    pill: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
  },
  {
    bg: 'bg-emerald-50 dark:bg-emerald-950/70',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-800 dark:text-emerald-200',
    accent: 'bg-emerald-500',
    glow: 'from-emerald-500/20 to-teal-500/20',
    pill: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
  },
  {
    bg: 'bg-violet-50 dark:bg-violet-950/70',
    border: 'border-violet-300 dark:border-violet-700',
    text: 'text-violet-800 dark:text-violet-200',
    accent: 'bg-violet-500',
    glow: 'from-violet-500/20 to-fuchsia-500/20',
    pill: 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300'
  },
  {
    bg: 'bg-amber-50 dark:bg-amber-950/70',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-800 dark:text-amber-200',
    accent: 'bg-amber-500',
    glow: 'from-amber-500/20 to-orange-500/20',
    pill: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
  },
  {
    bg: 'bg-cyan-50 dark:bg-cyan-950/70',
    border: 'border-cyan-300 dark:border-cyan-700',
    text: 'text-cyan-800 dark:text-cyan-200',
    accent: 'bg-cyan-500',
    glow: 'from-cyan-500/20 to-blue-500/20',
    pill: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300'
  },
  {
    bg: 'bg-rose-50 dark:bg-rose-950/70',
    border: 'border-rose-300 dark:border-rose-700',
    text: 'text-rose-800 dark:text-rose-200',
    accent: 'bg-rose-500',
    glow: 'from-rose-500/20 to-pink-500/20',
    pill: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
  }
];

export const parseMindmapContent = (raw: string): MindmapNode | null => {
  const lines = raw.split('\n').map(l => l.trimEnd()).filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;

  // Check if syntax is Markdown headings (#, ##, ###)
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
          id: `node-${idx}-${title.replace(/\s+/g, '-').slice(0, 15)}`,
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
            rootNode = { id: 'root', title: 'Concept Map', level: 0, children: [] };
            stack.push(rootNode);
          }
          // Find parent in stack
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
          const parent = stack.length > 0 ? stack[stack.length - 1] : rootNode;
          parent.children.push(node);
          stack.push(node);
        }
      }
    });

    return rootNode || { id: 'root', title: 'Mindmap', level: 0, children: [] };
  }

  // Check if syntax is Mermaid style `root((Title))` or indented bullets
  let rootTitle = 'Core Architecture';
  let firstLine = lines[0].trim();

  if (firstLine.startsWith('mindmap')) {
    lines.shift();
    if (lines.length > 0) firstLine = lines[0].trim();
  }

  const rootMatch = firstLine.match(/root(?:\(\((.*?)\)\)|\((.*?)\)|\[(.*?)\]|\s+(.*))/i);
  if (rootMatch) {
    rootTitle = (rootMatch[1] || rootMatch[2] || rootMatch[3] || rootMatch[4] || 'Concept Map').trim();
    lines.shift();
  } else if (!firstLine.startsWith('-') && !firstLine.startsWith('*') && !firstLine.startsWith(' ')) {
    rootTitle = firstLine;
    lines.shift();
  }

  const root: MindmapNode = {
    id: 'root-node',
    title: rootTitle,
    level: 0,
    children: []
  };

  const stack: { node: MindmapNode; indent: number }[] = [{ node: root, indent: -1 }];

  lines.forEach((line, idx) => {
    const rawIndent = line.search(/\S/);
    if (rawIndent === -1) return;

    let cleanText = line.trim();
    // remove leading bullet markers like -, *, +, 1.
    cleanText = cleanText.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '').trim();
    if (!cleanText) return;

    // clean mermaid node formatting: e.g. Node[Title] or Node(Title) or Node((Title))
    const shapeMatch = cleanText.match(/^(?:[\w\d_-]+\s*)?(?:\(\((.*?)\)\)|\((.*?)\)|\[(.*?)\]|::icon\((.*?)\)|"(.*?)")/);
    if (shapeMatch) {
      cleanText = (shapeMatch[1] || shapeMatch[2] || shapeMatch[3] || shapeMatch[5] || cleanText).trim();
    }

    const node: MindmapNode = {
      id: `node-${idx}-${cleanText.slice(0, 15)}`,
      title: cleanText,
      level: 1,
      children: []
    };

    while (stack.length > 1 && stack[stack.length - 1].indent >= rawIndent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    node.level = parent.level + 1;
    parent.children.push(node);
    stack.push({ node, indent: rawIndent });
  });

  return root;
};

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ content, title }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'tree' | 'source'>('visual');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const rootNode = useMemo(() => parseMindmapContent(content), [content]);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!rootNode) {
    return null;
  }

  return (
    <div className={`my-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 sm:inset-8 z-50 flex flex-col shadow-2xl backdrop-blur-xl' : 'relative'
    }`}>

      {/* Mindmap Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                {title || rootNode.title || 'Mindmap Concept Map'}
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                Visual Map
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive structural knowledge visualization ({rootNode.children.length} core branches)
            </p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visual Map</span>
          </button>

          <button
            onClick={() => setViewMode('tree')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tree Flow</span>
          </button>

          <button
            onClick={() => setViewMode('source')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'source'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Source</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Zoom controls (for visual mode) */}
          {viewMode === 'visual' && (
            <>
              <button
                onClick={() => setZoomScale(s => Math.max(0.7, s - 0.1))}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={() => setZoomScale(s => Math.min(1.4, s + 0.1))}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
            </>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="Copy mindmap text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title={isExpanded ? 'Minimize' : 'Expand full screen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Mindmap Display Body */}
      <div className={`p-6 overflow-auto bg-slate-50/40 dark:bg-[#070B14] transition-all ${
        isExpanded ? 'flex-1 overflow-y-auto' : 'min-h-[380px] max-h-[750px]'
      }`}>

        {/* MODE 1: Rich Visual Mindmap Matrix / Canvas */}
        {viewMode === 'visual' && (
          <div
            className="flex flex-col items-center justify-center py-6 px-2 transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* Root Hub Node */}
            <div className="relative z-10 mb-10 text-center">
              <div className="inline-flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-500/25 border-2 border-white/20 ring-4 ring-indigo-500/10 max-w-sm">
                <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center mb-2 backdrop-blur-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-display leading-snug">
                  {rootNode.title}
                </h3>
                <span className="text-[10px] font-semibold text-white/80 mt-1 uppercase tracking-wider">
                  Core Concept Nexus
                </span>
              </div>
            </div>

            {/* Branches Grid */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
              {rootNode.children.map((branch, bIdx) => {
                const colorTheme = BRANCH_COLORS[bIdx % BRANCH_COLORS.length];
                const isCollapsed = collapsedNodes[branch.id];

                return (
                  <div
                    key={branch.id}
                    className={`rounded-3xl border ${colorTheme.border} ${colorTheme.bg} p-5 shadow-xs transition-all hover:shadow-md relative flex flex-col`}
                  >
                    {/* Branch Header Pill */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/50 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-3 h-3 rounded-full ${colorTheme.accent} shrink-0 shadow-xs`} />
                        <h4 className={`text-sm font-bold ${colorTheme.text} font-display truncate`}>
                          {branch.title}
                        </h4>
                      </div>

                      {branch.children.length > 0 && (
                        <button
                          onClick={() => toggleCollapse(branch.id)}
                          className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/60 text-slate-500 transition-colors cursor-pointer"
                          title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    {/* Sub-Nodes / Leaves */}
                    {!isCollapsed && branch.children.length > 0 ? (
                      <div className="space-y-2.5 flex-1">
                        {branch.children.map((sub, sIdx) => {
                          const hasLeaves = sub.children && sub.children.length > 0;
                          const isSubCollapsed = collapsedNodes[sub.id];

                          return (
                            <div
                              key={sub.id || sIdx}
                              className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                                  <span>{sub.title}</span>
                                </div>
                                {hasLeaves && (
                                  <button
                                    onClick={() => toggleCollapse(sub.id)}
                                    className="p-0.5 text-slate-400 hover:text-slate-600"
                                  >
                                    {isSubCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>

                              {/* Level 3 Leaves */}
                              {hasLeaves && !isSubCollapsed && (
                                <div className="mt-2 pl-3.5 border-l-2 border-indigo-100 dark:border-indigo-900/40 space-y-1.5 pt-1">
                                  {sub.children.map((leaf, lIdx) => (
                                    <div
                                      key={leaf.id || lIdx}
                                      className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
                                    >
                                      <span className="text-indigo-400">&bull;</span>
                                      <span>{leaf.title}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : !isCollapsed ? (
                      <div className="text-xs text-slate-400 italic py-2">
                        Primary architectural pillar node
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-1 flex items-center gap-1">
                        <span>{branch.children.length} sub-topics collapsed</span>
                      </div>
                    )}

                    {/* Branch Footer Badge */}
                    <div className="mt-4 pt-2.5 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Branch #{bIdx + 1}</span>
                      <span>{branch.children.length} sub-nodes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: Hierarchical Tree Flow View */}
        {viewMode === 'tree' && (
          <div className="max-w-3xl mx-auto py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-md">
              <Network className="w-5 h-5" />
              <span>{rootNode.title}</span>
            </div>

            <div className="pl-6 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-4">
              {rootNode.children.map((branch, bIdx) => {
                const colorTheme = BRANCH_COLORS[bIdx % BRANCH_COLORS.length];
                return (
                  <div key={branch.id} className="space-y-2">
                    <div className={`p-3 rounded-xl border ${colorTheme.border} ${colorTheme.bg} font-semibold text-xs sm:text-sm ${colorTheme.text} flex items-center gap-2`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${colorTheme.accent}`} />
                      <span>{branch.title}</span>
                    </div>

                    {branch.children.length > 0 && (
                      <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-2 py-1">
                        {branch.children.map((sub, sIdx) => (
                          <div key={sub.id || sIdx} className="space-y-1">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200">
                              {sub.title}
                            </div>
                            {sub.children.length > 0 && (
                              <div className="pl-5 border-l border-slate-200 dark:border-slate-800 space-y-1 py-1">
                                {sub.children.map((leaf, lIdx) => (
                                  <div key={leaf.id || lIdx} className="text-xs text-slate-500 dark:text-slate-400 pl-2">
                                    &bull; {leaf.title}
                                  </div>
                                ))}
                              </div>
                            )}
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

        {/* MODE 3: Markdown Source View */}
        {viewMode === 'source' && (
          <div className="max-w-3xl mx-auto py-2">
            <pre className="p-5 rounded-2xl bg-[#0d1117] text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
              <code>{content}</code>
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
