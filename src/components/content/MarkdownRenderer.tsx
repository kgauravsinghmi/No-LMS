import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Copy,
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  ExternalLink,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import { MindmapViewer } from './MindmapViewer';
import { ImageViewer } from './ImageViewer';
import { MermaidViewer } from './MermaidViewer';

interface MarkdownRendererProps {
  content: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  onHeadingsExtracted?: (headings: { id: string; text: string; level: number }[]) => void;
  quiz?: QuizQuestion[];
  topicId?: string;
  onQuizSubmit?: (score: number, total: number) => void;
  savedQuizScore?: { score: number; total: number };
}

export type ListItemKind =
  | 'task'         // [ ] or [x]
  | 'check'        // ✓, ✔, ✅, [v]
  | 'cross'        // ✗, ✘, ❌
  | 'roman-lower'  // i., ii., iii., iv.
  | 'roman-upper'  // I., II., III., IV.
  | 'alpha-lower'  // a., b., c.
  | 'alpha-upper'  // A., B., C.
  | 'decimal'      // 1., 2., 3.
  | 'bullet';      // -, *, +, •

export interface ParsedListItem {
  raw: string;
  text: string;
  kind: ListItemKind;
  indent: number;
  marker: string;
  checked?: boolean;
  id?: string;
}

// Classify line into list item type
function classifyListItem(line: string, lineIndex: number): ParsedListItem | null {
  const indentMatch = line.match(/^(\s*)/);
  const indentSpaces = indentMatch ? indentMatch[1].length : 0;
  const indentLevel = Math.min(Math.floor(indentSpaces / 2), 4);
  const trimmed = line.trim();

  // 1. Task Checklists: - [ ] text, * [x] text, + [X] text, - [v] text
  const taskMatch = trimmed.match(/^[-*+]\s+\[([ xXvV!])\]\s+(.+)$/);
  if (taskMatch) {
    const flag = taskMatch[1].toLowerCase();
    const text = taskMatch[2];
    const id = `task-${lineIndex}-${text.slice(0, 15).replace(/\s+/g, '-')}`;
    return {
      raw: line,
      text,
      kind: 'task',
      indent: indentLevel,
      marker: `[${taskMatch[1]}]`,
      checked: flag === 'x' || flag === 'v',
      id
    };
  }

  // 2. Standalone Check sign bullets: ✓ item, ✔ item, ✅ item, [v] item
  const checkBulletMatch = trimmed.match(/^([-*+]\s+)?([✓✔✅]|\[v\])\s+(.+)$/i);
  if (checkBulletMatch) {
    return {
      raw: line,
      text: checkBulletMatch[3],
      kind: 'check',
      indent: indentLevel,
      marker: checkBulletMatch[2]
    };
  }

  // 3. Standalone Cross / Negative bullets: ✗ item, ✘ item, ❌ item
  const crossBulletMatch = trimmed.match(/^([-*+]\s+)?([✗✘❌])\s+(.+)$/i);
  if (crossBulletMatch) {
    return {
      raw: line,
      text: crossBulletMatch[3],
      kind: 'cross',
      indent: indentLevel,
      marker: crossBulletMatch[2]
    };
  }

  // 4. Roman Numeral lists (lowercase): i., ii., iii., iv., v., vi., vii., viii., ix., x., xi., xii. etc. or i), ii)
  const romanLowerMatch = trimmed.match(/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)([.)])\s+(.+)$/i);
  if (romanLowerMatch && romanLowerMatch[1] === romanLowerMatch[1].toLowerCase()) {
    return {
      raw: line,
      text: romanLowerMatch[3],
      kind: 'roman-lower',
      indent: indentLevel,
      marker: `${romanLowerMatch[1]}${romanLowerMatch[2]}`
    };
  }

  // 5. Roman Numeral lists (uppercase): I., II., III., IV., V., VI., VII., VIII., IX., X. etc.
  if (romanLowerMatch && romanLowerMatch[1] === romanLowerMatch[1].toUpperCase()) {
    return {
      raw: line,
      text: romanLowerMatch[3],
      kind: 'roman-upper',
      indent: indentLevel,
      marker: `${romanLowerMatch[1]}${romanLowerMatch[2]}`
    };
  }

  // 6. Alphabet lists (lowercase): a., b., c., d., e., a), b)
  const alphaLowerMatch = trimmed.match(/^([a-z])([.)])\s+(.+)$/);
  if (alphaLowerMatch) {
    return {
      raw: line,
      text: alphaLowerMatch[3],
      kind: 'alpha-lower',
      indent: indentLevel,
      marker: `${alphaLowerMatch[1]}${alphaLowerMatch[2]}`
    };
  }

  // 7. Alphabet lists (uppercase): A., B., C., D., E., A), B)
  const alphaUpperMatch = trimmed.match(/^([A-Z])([.)])\s+(.+)$/);
  if (alphaUpperMatch) {
    return {
      raw: line,
      text: alphaUpperMatch[3],
      kind: 'alpha-upper',
      indent: indentLevel,
      marker: `${alphaUpperMatch[1]}${alphaUpperMatch[2]}`
    };
  }

  // 8. Numbered / Decimal lists: 1., 2., 3., 10., 1), 2)
  const decMatch = trimmed.match(/^(\d+)([.)])\s+(.+)$/);
  if (decMatch) {
    return {
      raw: line,
      text: decMatch[3],
      kind: 'decimal',
      indent: indentLevel,
      marker: `${decMatch[1]}${decMatch[2]}`
    };
  }

  // 9. Standard unordered bullets: -, *, +, •
  const bulletMatch = trimmed.match(/^[-*+•]\s+(.+)$/);
  if (bulletMatch) {
    return {
      raw: line,
      text: bulletMatch[1],
      kind: 'bullet',
      indent: indentLevel,
      marker: '•'
    };
  }

  return null;
}

// Render individual list item node
function renderListItemNode(
  item: ParsedListItem,
  index: number,
  typography: any,
  checkedState: boolean | undefined,
  onToggleCheck?: (id: string, defaultChecked: boolean) => void
) {
  const isChecked = checkedState !== undefined ? checkedState : !!item.checked;
  const indentClass =
    item.indent === 1 ? 'ml-5 sm:ml-6' :
    item.indent === 2 ? 'ml-9 sm:ml-12' :
    item.indent === 3 ? 'ml-13 sm:ml-16' :
    item.indent >= 4 ? 'ml-17 sm:ml-20' : '';

  // Interactive Task Item
  if (item.kind === 'task') {
    return (
      <div
        key={`list-task-${index}-${item.id}`}
        onClick={() => onToggleCheck && item.id && onToggleCheck(item.id, !!item.checked)}
        className={`flex items-start gap-3 my-1.5 cursor-pointer group py-1 px-2 -mx-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors ${indentClass}`}
      >
        <div
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
            isChecked
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-700 group-hover:border-indigo-400 bg-white dark:bg-slate-900'
          }`}
        >
          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
        <span
          className={`${typography.checkItem || typography.list} transition-colors ${
            isChecked
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Checkmark Bullet (✓, ✔, ✅, [v])
  if (item.kind === 'check') {
    return (
      <div
        key={`list-check-${index}`}
        className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
      >
        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300/60 dark:border-emerald-800/60 shadow-xs">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Cross / Avoid Bullet (✗, ✘, ❌)
  if (item.kind === 'cross') {
    return (
      <div
        key={`list-cross-${index}`}
        className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
      >
        <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-300/60 dark:border-rose-800/60 shadow-xs">
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Roman Numerals (i., ii., iii. or I., II., III.)
  if (item.kind === 'roman-lower' || item.kind === 'roman-upper') {
    return (
      <div
        key={`list-roman-${index}`}
        className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
      >
        <span className="min-w-[24px] h-[22px] px-1.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {item.marker}
        </span>
        <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Alphabet Lists (a., b., c. or A., B., C.)
  if (item.kind === 'alpha-lower' || item.kind === 'alpha-upper') {
    return (
      <div
        key={`list-alpha-${index}`}
        className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
      >
        <span className="min-w-[22px] h-[22px] px-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {item.marker}
        </span>
        <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Decimal / Numbered Lists (1., 2., 3.)
  if (item.kind === 'decimal') {
    return (
      <div
        key={`list-dec-${index}`}
        className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
      >
        <span className="min-w-[22px] h-[22px] px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {item.marker}
        </span>
        <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
          {renderInlineFormatting(item.text)}
        </span>
      </div>
    );
  }

  // Standard Bullets (-, *, +, •)
  return (
    <div
      key={`list-bullet-${index}`}
      className={`flex items-start gap-3 my-1.5 py-0.5 ${indentClass}`}
    >
      <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-950/60 shrink-0 mt-2 mx-1.5"></span>
      <span className={`text-slate-700 dark:text-slate-300 ${typography.list}`}>
        {renderInlineFormatting(item.text)}
      </span>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize = 'base',
  onHeadingsExtracted,
  quiz,
  onQuizSubmit,
  savedQuizScore
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(!!savedQuizScore);
  const [showExplanations, setShowExplanations] = useState<boolean>(!!savedQuizScore);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleCheckItem = (id: string, initialChecked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !initialChecked
    }));
  };

  // Comprehensive font size & typography scaling
  const typography = useMemo(() => {
    switch (fontSize) {
      case 'sm':
        return {
          paragraph: 'text-[14px] sm:text-[14.5px] leading-[1.68]',
          list: 'text-[14px] sm:text-[14.5px] leading-[1.65]',
          blockquote: 'text-[13.5px] sm:text-[14px] leading-relaxed',
          code: 'text-[12px] sm:text-[12.5px]',
          table: 'text-[12.5px] sm:text-[13px]',
          checkItem: 'text-[14px] sm:text-[14.5px]',
          h1: 'text-2xl sm:text-3xl',
          h2: 'text-xl sm:text-2xl',
          h3: 'text-base sm:text-lg',
          h4: 'text-sm sm:text-base',
          h5: 'text-xs sm:text-sm',
          h6: 'text-[11px] sm:text-xs',
          quizQuestion: 'text-sm sm:text-base',
          quizOption: 'text-xs sm:text-sm'
        };
      case 'lg':
        return {
          paragraph: 'text-[18px] sm:text-[19px] leading-[1.85]',
          list: 'text-[18px] sm:text-[19px] leading-[1.8]',
          blockquote: 'text-[17.5px] sm:text-[18px] leading-relaxed',
          code: 'text-[14px] sm:text-[14.5px]',
          table: 'text-[15px] sm:text-[16px]',
          checkItem: 'text-[17.5px] sm:text-[18.5px]',
          h1: 'text-3xl sm:text-4xl lg:text-5xl',
          h2: 'text-2xl sm:text-3xl',
          h3: 'text-xl sm:text-2xl',
          h4: 'text-lg sm:text-xl',
          h5: 'text-base sm:text-lg',
          h6: 'text-xs sm:text-sm',
          quizQuestion: 'text-lg sm:text-xl',
          quizOption: 'text-sm sm:text-base'
        };
      case 'xl':
        return {
          paragraph: 'text-[21px] sm:text-[22px] leading-[1.95]',
          list: 'text-[21px] sm:text-[22px] leading-[1.9]',
          blockquote: 'text-[20px] sm:text-[21px] leading-relaxed',
          code: 'text-[15.5px] sm:text-[16.5px]',
          table: 'text-[16.5px] sm:text-[17.5px]',
          checkItem: 'text-[20px] sm:text-[21.5px]',
          h1: 'text-4xl sm:text-5xl',
          h2: 'text-3xl sm:text-4xl',
          h3: 'text-2xl sm:text-3xl',
          h4: 'text-xl sm:text-2xl',
          h5: 'text-lg sm:text-xl',
          h6: 'text-sm sm:text-base',
          quizQuestion: 'text-xl sm:text-2xl',
          quizOption: 'text-base sm:text-lg'
        };
      case 'base':
      default:
        return {
          paragraph: 'text-[16px] sm:text-[16.5px] leading-[1.78]',
          list: 'text-[16px] sm:text-[16.5px] leading-[1.72]',
          blockquote: 'text-[15px] sm:text-[15.5px] leading-relaxed',
          code: 'text-[13px] sm:text-[13.5px]',
          table: 'text-[13.5px] sm:text-[14px]',
          checkItem: 'text-[15.5px] sm:text-[16px]',
          h1: 'text-3xl sm:text-4xl',
          h2: 'text-2xl sm:text-2xl',
          h3: 'text-lg sm:text-xl',
          h4: 'text-base sm:text-lg',
          h5: 'text-sm sm:text-base',
          h6: 'text-xs sm:text-sm',
          quizQuestion: 'text-base sm:text-lg',
          quizOption: 'text-xs sm:text-sm'
        };
    }
  }, [fontSize]);

  // Extract headings list for TOC (Levels 1 to 6)
  const extractedHeadings = useMemo(() => {
    const list: { id: string; text: string; level: number }[] = [];
    const lines = content.split('\n');
    let inCode = false;

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;

      if (line.startsWith('#')) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          list.push({ id: slug, text, level });
        }
      }
    }

    if (quiz && quiz.length > 0) {
      list.push({ id: 'knowledge-check', text: 'Knowledge Check Quiz', level: 2 });
    }

    return list;
  }, [content, quiz]);

  // Synchronize headings with parent component
  useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(extractedHeadings);
    }
  }, [extractedHeadings, onHeadingsExtracted]);

  // Parse markdown into tokens
  const parsedSections = useMemo(() => {
    const headings: { id: string; text: string; level: number }[] = [];
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent: string[] = [];
    let codeBlockIndex = 0;

    let inTable = false;
    let tableHeaders: string[] = [];
    let tableAlignments: string[] = [];
    let tableRows: string[][] = [];
    let tableIndex = 0;

    let inBlockquote = false;
    let blockquoteType: 'note' | 'tip' | 'warning' | 'important' | 'quote' = 'quote';
    let blockquoteLines: string[] = [];
    let blockquoteIndex = 0;

    let currentListGroup: ParsedListItem[] = [];
    let listGroupIndex = 0;

    const flushListGroup = () => {
      if (currentListGroup.length > 0) {
        const key = `list-group-${listGroupIndex++}`;
        nodes.push(
          <div key={key} className="my-4 space-y-1.5">
            {currentListGroup.map((item, idx) =>
              renderListItemNode(
                item,
                idx,
                typography,
                checkedItems[item.id || ''],
                toggleCheckItem
              )
            )}
          </div>
        );
        currentListGroup = [];
      }
    };

    const flushBlockquote = () => {
      if (blockquoteLines.length > 0) {
        const fullText = blockquoteLines.join('\n');
        const key = `blockquote-${blockquoteIndex++}`;

        let icon: React.ReactNode = <Info className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />;
        let borderClass = 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-800/50 text-indigo-950 dark:text-indigo-200';
        let label = 'Note';

        if (blockquoteType === 'tip') {
          icon = <Lightbulb className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />;
          borderClass = 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200';
          label = 'Pro Tip';
        } else if (blockquoteType === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />;
          borderClass = 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-800/50 text-amber-950 dark:text-amber-200';
          label = 'Caution';
        } else if (blockquoteType === 'important') {
          icon = <ShieldAlert className="w-5 h-5 shrink-0 text-fuchsia-600 dark:text-fuchsia-400 mt-0.5" />;
          borderClass = 'border-fuchsia-200 bg-fuchsia-50/50 dark:bg-fuchsia-950/30 dark:border-fuchsia-800/50 text-fuchsia-950 dark:text-fuchsia-200';
          label = 'Important';
        } else {
          icon = null;
          borderClass = 'border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 italic';
          label = '';
        }

        // Parse bullet points & extended lists within blockquote content
        const blockquoteNodes = parseBlockquoteContent(fullText, typography, checkedItems, toggleCheckItem);

        nodes.push(
          <div key={key} className={`my-6 rounded-2xl border p-4.5 transition-all ${borderClass}`}>
            <div className="flex gap-3.5 items-start">
              {icon}
              <div className="flex-1 space-y-1">
                {label && <div className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</div>}
                <div className={`${typography.blockquote}`}>
                  {blockquoteNodes}
                </div>
              </div>
            </div>
          </div>
        );
        blockquoteLines = [];
        inBlockquote = false;
        blockquoteType = 'quote';
      }
    };

    const flushTable = () => {
      if (inTable && tableHeaders.length > 0) {
        const key = `table-${tableIndex++}`;
        nodes.push(
          <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xs">
            <table className={`w-full ${typography.table}`}>
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={i} className={`px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 ${tableAlignments[i] || 'text-left'}`}>
                      {renderInlineFormatting(header.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className={`px-4 py-3 text-slate-600 dark:text-slate-300 ${tableAlignments[cIdx] || 'text-left'}`}>
                        {renderInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
        tableRows = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // close code block
          const codeText = codeContent.join('\n');
          const lowerLang = (codeLanguage || '').toLowerCase().trim();

          if (lowerLang === 'mermaid') {
            nodes.push(
              <MermaidViewer
                key={`mermaid-${codeBlockIndex++}`}
                chart={codeText}
              />
            );
          } else if (lowerLang === 'mindmap' || lowerLang === 'conceptmap' || lowerLang === 'tree' || lowerLang === 'diagram') {
            nodes.push(
              <MindmapViewer
                key={`mindmap-${codeBlockIndex++}`}
                content={codeText}
              />
            );
          } else {
            const codeId = `code-${codeBlockIndex++}`;
            nodes.push(
              <div key={codeId} className="my-6 rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-200 shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400 ml-2 uppercase tracking-wide">
                      {codeLanguage || 'text'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(codeText, codeId)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                    title="Copy code to clipboard"
                  >
                    {copiedCodeId === codeId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className={`p-4.5 overflow-x-auto font-mono leading-relaxed text-slate-300 ${typography.code}`}>
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          }
          inCodeBlock = false;
          codeContent = [];
          codeLanguage = '';
        } else {
          flushListGroup();
          flushBlockquote();
          flushTable();
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Blockquotes & Callouts
      if (line.trim().startsWith('>')) {
        flushListGroup();
        flushTable();
        const trimmed = line.trim().slice(1).trim();
        if (!inBlockquote) {
          inBlockquote = true;
          if (trimmed.startsWith('[!NOTE]') || trimmed.startsWith('[!INFO]')) {
            blockquoteType = 'note';
            const remainder = trimmed.replace(/^\[!(NOTE|INFO)\]\s*/i, '');
            if (remainder) blockquoteLines.push(remainder);
            continue;
          } else if (trimmed.startsWith('[!TIP]')) {
            blockquoteType = 'tip';
            const remainder = trimmed.replace(/^\[!TIP\]\s*/i, '');
            if (remainder) blockquoteLines.push(remainder);
            continue;
          } else if (trimmed.startsWith('[!WARNING]')) {
            blockquoteType = 'warning';
            const remainder = trimmed.replace(/^\[!WARNING\]\s*/i, '');
            if (remainder) blockquoteLines.push(remainder);
            continue;
          } else if (trimmed.startsWith('[!IMPORTANT]')) {
            blockquoteType = 'important';
            const remainder = trimmed.replace(/^\[!IMPORTANT\]\s*/i, '');
            if (remainder) blockquoteLines.push(remainder);
            continue;
          } else {
            blockquoteType = 'quote';
            blockquoteLines.push(trimmed);
            continue;
          }
        } else {
          blockquoteLines.push(trimmed);
          continue;
        }
      } else if (inBlockquote) {
        flushBlockquote();
      }

      // Markdown Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushListGroup();
        const cells = line.trim().split('|').slice(1, -1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          continue;
        } else {
          // Check if it's separator row (e.g. | :--- | :---: | ---: |)
          if (cells.every(c => /^[\s:-]+$/.test(c))) {
            tableAlignments = cells.map(c => {
              const trimmed = c.trim();
              if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'text-center';
              if (trimmed.endsWith(':')) return 'text-right';
              return 'text-left';
            });
            continue;
          }
          tableRows.push(cells);
          continue;
        }
      } else if (inTable) {
        flushTable();
      }

      // Headings (#, ##, ###, ####, #####, ######)
      if (line.startsWith('#')) {
        flushListGroup();
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          headings.push({ id: slug, text, level });

          if (level === 1) {
            nodes.push(
              <h1 key={`h1-${i}`} id={slug} className={`${typography.h1} font-extrabold tracking-tight text-slate-900 dark:text-white mt-10 mb-4 font-display scroll-mt-20 flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-sm transition-opacity">#</a>
              </h1>
            );
          } else if (level === 2) {
            nodes.push(
              <h2 key={`h2-${i}`} id={slug} className={`${typography.h2} font-bold tracking-tight text-slate-900 dark:text-white mt-9 mb-3 font-display border-b border-slate-100 dark:border-slate-800/80 pb-2 scroll-mt-20 flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-sm transition-opacity">#</a>
              </h2>
            );
          } else if (level === 3) {
            nodes.push(
              <h3 key={`h3-${i}`} id={slug} className={`${typography.h3} font-bold text-slate-800 dark:text-slate-100 mt-7 mb-2.5 font-display scroll-mt-20 flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-sm transition-opacity">#</a>
              </h3>
            );
          } else if (level === 4) {
            nodes.push(
              <h4 key={`h4-${i}`} id={slug} className={`${typography.h4} font-semibold text-slate-800 dark:text-slate-200 mt-5 mb-2 scroll-mt-20 flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-xs transition-opacity">#</a>
              </h4>
            );
          } else if (level === 5) {
            nodes.push(
              <h5 key={`h5-${i}`} id={slug} className={`${typography.h5} font-semibold text-slate-700 dark:text-slate-300 mt-4 mb-1.5 scroll-mt-20 flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-xs transition-opacity">#</a>
              </h5>
            );
          } else {
            nodes.push(
              <h6 key={`h6-${i}`} id={slug} className={`${typography.h6} font-medium text-slate-600 dark:text-slate-400 mt-3.5 mb-1 scroll-mt-20 uppercase tracking-wider flex items-center gap-2 group`}>
                <span>{renderInlineFormatting(text)}</span>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-indigo-500 text-[10px] transition-opacity">#</a>
              </h6>
            );
          }
          continue;
        }
      }

      // Standalone Image Line Match: ![alt](<url with spaces> "optional caption") or ![alt](url "caption") or ![alt](url)
      const imgBlockMatch = line.trim().match(/^!\[(.*?)\]\((?:<([^>]+)>|([^)\s]+))(?:\s+["'](.*?)["'])?\)$/);
      if (imgBlockMatch) {
        flushListGroup();
        flushBlockquote();
        flushTable();
        const src = imgBlockMatch[2] || imgBlockMatch[3];
        const alt = imgBlockMatch[1];
        const caption = imgBlockMatch[4] || alt;
        nodes.push(
          <ImageViewer
            key={`img-${i}`}
            src={src}
            alt={alt}
            caption={caption}
          />
        );
        continue;
      }

      // Horizontal rule / Divider (---, ***, ___)
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        flushListGroup();
        nodes.push(
          <div key={`hr-${i}`} className="my-8 flex items-center justify-center gap-2">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50"></span>
            <span className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></span>
          </div>
        );
        continue;
      }

      // Unified List Classifier (Checklists, Check signs, Alphabet bullets, Roman numerals, Decimal numbers, Standard bullets)
      const listItem = classifyListItem(line, i);
      if (listItem) {
        flushBlockquote();
        flushTable();
        currentListGroup.push(listItem);
        continue;
      }

      // Empty line
      if (!line.trim()) {
        flushListGroup();
        continue;
      }

      // Regular Paragraph
      flushListGroup();
      nodes.push(
        <p key={`p-${i}`} className={`my-4 text-slate-700 dark:text-slate-300 ${typography.paragraph}`}>
          {renderInlineFormatting(line)}
        </p>
      );
    }

    // Flush any remaining blocks
    flushListGroup();
    flushBlockquote();
    flushTable();

    return nodes;
  }, [content, typography, copiedCodeId, checkedItems]);

  // Quiz submission calculation
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!quiz || quiz.length === 0) return;
    let score = 0;
    quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    setSubmittedQuiz(true);
    setShowExplanations(true);
    if (onQuizSubmit) {
      onQuizSubmit(score, quiz.length);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setShowExplanations(false);
  };

  return (
    <div className="space-y-1">
      {/* Markdown Rendered Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {parsedSections}
      </div>

      {/* Embedded Interactive Quiz Section */}
      {quiz && quiz.length > 0 && (
        <div id="knowledge-check" className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800 scroll-mt-24">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-100/80 dark:border-indigo-900/40 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Knowledge Check
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test your understanding of this topic with {quiz.length} questions
                  </p>
                </div>
              </div>

              {submittedQuiz && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {quiz.map((q, qIdx) => {
                const selectedOption = selectedAnswers[q.id];
                const isAnswered = selectedOption !== undefined;
                const isCorrect = isAnswered && selectedOption === q.correctAnswer;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs">
                    <p className={`${typography.quizQuestion} font-semibold text-slate-900 dark:text-white mb-3.5 flex items-start gap-2.5`}>
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        submittedQuiz
                          ? isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </p>

                    <div className="space-y-2 pl-8.5">
                      {q.options.map((option, optIdx) => {
                        const isThisSelected = selectedOption === optIdx;
                        let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';

                        if (isThisSelected && !submittedQuiz) {
                          optionStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200 shadow-xs';
                        }

                        if (submittedQuiz) {
                          if (optIdx === q.correctAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200 font-medium';
                          } else if (isThisSelected && optIdx !== q.correctAnswer) {
                            optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/50 dark:text-rose-200';
                          } else {
                            optionStyle = 'opacity-60 border-slate-200 dark:border-slate-800 bg-transparent';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border ${typography.quizOption} transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {submittedQuiz && optIdx === q.correctAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {submittedQuiz && isThisSelected && optIdx !== q.correctAnswer && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showExplanations && q.explanation && (
                      <div className="mt-3.5 ml-8.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-800 dark:text-slate-200">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit Bar */}
            {!submittedQuiz ? (
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {Object.keys(selectedAnswers).length} of {quiz.length} answered
                </span>
                <button
                  type="button"
                  onClick={calculateQuizScore}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  Submit Answers
                </button>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Quiz Score: {Object.values(selectedAnswers).filter((ans, i) => ans === quiz[i]?.correctAnswer).length} / {quiz.length} Correct
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Completed
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Parse blockquote content into proper React nodes with full bullet & list support
function parseBlockquoteContent(
  text: string,
  typography: any,
  checkedItems: Record<string, boolean> = {},
  toggleCheckItem?: (id: string, initialChecked: boolean) => void
): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentListGroup: ParsedListItem[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join('\n').trim();
      if (paraText) {
        nodes.push(
          <p key={`bq-p-${nodes.length}`} className={`${typography.blockquote} whitespace-pre-line my-1.5`}>
            {renderInlineFormatting(paraText)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentListGroup.length > 0) {
      const key = `bq-list-${nodes.length}`;
      nodes.push(
        <div key={key} className="my-2.5 space-y-1.5">
          {currentListGroup.map((item, idx) =>
            renderListItemNode(
              item,
              idx,
              typography,
              checkedItems[item.id || ''],
              toggleCheckItem
            )
          )}
        </div>
      );
      currentListGroup = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if it's a list item
    const listItem = classifyListItem(line, i);
    if (listItem) {
      flushParagraph();
      currentListGroup.push(listItem);
      continue;
    }

    // Blank line (paragraph boundary)
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    // Regular line in blockquote
    flushList();
    currentParagraph.push(line);
  }

  // Flush remaining
  flushList();
  flushParagraph();

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

// Helper to clean trailing sentence punctuation from URLs while preserving balanced parentheses
function cleanTrailingPunctuation(rawUrl: string): { cleanUrl: string; trailing: string } {
  let cleanUrl = rawUrl;
  let trailing = '';
  while (cleanUrl.length > 0 && /[.,;:!?)}'"]$/.test(cleanUrl)) {
    if (cleanUrl.endsWith(')')) {
      const openCount = (cleanUrl.match(/\(/g) || []).length;
      const closeCount = (cleanUrl.match(/\)/g) || []).length;
      if (closeCount <= openCount) break;
    }
    trailing = cleanUrl.slice(-1) + trailing;
    cleanUrl = cleanUrl.slice(0, -1);
  }
  return { cleanUrl, trailing };
}

// Strict regex pattern for recognized URL/socket/tel/mail protocols and valid email formats
const PROTOCOL_AUTOLINK_REGEX = /(https?:\/\/[^\s<>"']+|wss?:\/\/[^\s<>"']+|ftps?:\/\/[^\s<>"']+|tel:[+\d()-]+|mailto:[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}|mail:[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s<>"']*|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;

// Sub-tokenizer for unformatted text that strictly detects valid protocol URLs, sockets, tel, mailto, www domains, and email addresses
function renderPlainWithAutolinks(text: string, baseKey: string | number): React.ReactNode {
  if (!text) return null;
  const parts = text.split(PROTOCOL_AUTOLINK_REGEX);
  if (parts.length === 1) return text;

  return parts.map((segment, idx) => {
    if (!segment) return null;

    const isHttp = /^https?:\/\//i.test(segment);
    const isWs = /^wss?:\/\//i.test(segment);
    const isFtp = /^ftps?:\/\//i.test(segment);
    const isTel = /^tel:[+\d()-]+/i.test(segment);
    const isMailtoPrefix = /^(mailto|mail):[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(segment);
    const isWww = /^www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(segment);
    const isEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(segment);

    if (isHttp || isWs || isFtp || isTel || isMailtoPrefix || isWww || isEmail) {
      const { cleanUrl, trailing } = cleanTrailingPunctuation(segment);
      if (!cleanUrl) return segment;

      let href = cleanUrl;
      let isExternal = true;

      if (cleanUrl.toLowerCase().startsWith('www.')) {
        href = `https://${cleanUrl}`;
      } else if (cleanUrl.toLowerCase().startsWith('mail:')) {
        href = `mailto:${cleanUrl.slice(5)}`;
        isExternal = false;
      } else if (cleanUrl.toLowerCase().startsWith('mailto:') || cleanUrl.toLowerCase().startsWith('tel:')) {
        isExternal = false;
      } else if (isEmail) {
        href = `mailto:${cleanUrl}`;
        isExternal = false;
      }

      return (
        <React.Fragment key={`${baseKey}-autolink-${idx}`}>
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5 break-all cursor-pointer"
          >
            <span>{cleanUrl}</span>
            {isExternal && <ExternalLink className="w-3 h-3 inline ml-0.5 shrink-0 opacity-70" />}
          </a>
          {trailing && <span>{trailing}</span>}
        </React.Fragment>
      );
    }
    return <React.Fragment key={`${baseKey}-txt-${idx}`}>{segment}</React.Fragment>;
  });
}

// Enhanced inline formatting renderer supporting code, kbd, bold, italic, bold-italic, strike, highlight, sup/sub, links & autolinks
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Split by markdown formatting syntax & bracketed autolinks with valid protocol/email (<https://...>, <ws://...>, <tel:...>, <user@email.com>)
  const pattern = /(`[^`]+`|<kbd>[^<]+<\/kbd>|<(?:(?:https?|wss?|ftps?):\/\/[^\s>]+|tel:[+\d()-]+|(?:mailto|mail):[^\s>]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}|www\.[^\s>]+)>|~~[^~]+~~|==[^=]+==|\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\^[^^]+\^|\[[^\]]+\]\([^)]+\))/gi;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[0.88em] font-medium border border-slate-200/60 dark:border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Keyboard Key: <kbd>key</kbd>
    if (part.toLowerCase().startsWith('<kbd>') && part.toLowerCase().endsWith('</kbd>')) {
      return (
        <kbd
          key={index}
          className="px-1.5 py-0.5 text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-xs text-slate-800 dark:text-slate-200"
        >
          {part.slice(5, -6)}
        </kbd>
      );
    }

    // Bracketed Autolinks with strict protocol validation: <https://...>, <ws://...>, <tel:...>, <user@example.com>, <mailto:...>
    if (part.startsWith('<') && part.endsWith('>') && part.length >= 3) {
      const inner = part.slice(1, -1).trim();
      const isEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(inner);
      const isHttpOrWsOrFtp = /^(https?:\/\/|wss?:\/\/|ftps?:\/\/)/i.test(inner);
      const isMailto = /^(mailto|mail):/i.test(inner) || isEmail;
      const isTel = /^tel:/i.test(inner);
      const isWww = /^www\./i.test(inner);

      if (isHttpOrWsOrFtp || isMailto || isTel || isWww) {
        let href = inner;
        let isExternal = true;

        if (isEmail) {
          href = `mailto:${inner}`;
          isExternal = false;
        } else if (inner.toLowerCase().startsWith('mail:')) {
          href = `mailto:${inner.slice(5)}`;
          isExternal = false;
        } else if (isTel || inner.toLowerCase().startsWith('mailto:')) {
          isExternal = false;
        } else if (isWww) {
          href = `https://${inner}`;
        }

        return (
          <a
            key={index}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5 break-all cursor-pointer"
          >
            <span>{inner}</span>
            {isExternal && <ExternalLink className="w-3 h-3 inline ml-0.5 shrink-0 opacity-70" />}
          </a>
        );
      }

      // If bracketed string is not a valid protocol URI (e.g. <T>, <Component>), render as normal text
      return renderPlainWithAutolinks(part, index);
    }

    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={index} className="line-through text-slate-400 dark:text-slate-500">
          {renderInlineFormatting(part.slice(2, -2))}
        </del>
      );
    }

    // Highlight: ==text==
    if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
      return (
        <mark
          key={index}
          className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded-md font-medium"
        >
          {renderInlineFormatting(part.slice(2, -2))}
        </mark>
      );
    }

    // Bold Italic: ***text*** or ___text___
    if ((part.startsWith('***') && part.endsWith('***') && part.length >= 6) ||
        (part.startsWith('___') && part.endsWith('___') && part.length >= 6)) {
      return (
        <strong key={index} className="font-bold italic text-slate-900 dark:text-white">
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Superscript: ^text^
    if (part.startsWith('^') && part.endsWith('^') && part.length >= 2) {
      return (
        <sup key={index} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {part.slice(1, -1)}
        </sup>
      );
    }

    // Markdown Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkHref = linkMatch[2];
      const isMailto = linkHref.startsWith('mailto:');
      return (
        <a
          key={index}
          href={linkHref}
          target={isMailto ? undefined : '_blank'}
          rel={isMailto ? undefined : 'noopener noreferrer'}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer"
        >
          <span>{linkMatch[1]}</span>
          {!isMailto && <ExternalLink className="w-3 h-3 inline ml-0.5 shrink-0 opacity-70" />}
        </a>
      );
    }

    // Unformatted text segment: run bare URL & email autolinker
    return renderPlainWithAutolinks(part, index);
  });
}
