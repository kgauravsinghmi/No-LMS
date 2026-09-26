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
  RotateCcw
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

  // Comprehensive font size & typography scaling for all elements
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
          quizQuestion: 'text-base sm:text-lg',
          quizOption: 'text-xs sm:text-sm'
        };
    }
  }, [fontSize]);

  // Extract headings list for TOC
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
        const match = line.match(/^(#{1,4})\s+(.+)$/);
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
    let tableRows: string[][] = [];
    let tableIndex = 0;

    let inBlockquote = false;
    let blockquoteType: 'note' | 'tip' | 'warning' | 'important' | 'quote' = 'quote';
    let blockquoteLines: string[] = [];
    let blockquoteIndex = 0;

    let inList: 'ul' | 'ol' | null = null;
    let listItems: { text: string; num?: number }[] = [];
    let listStartIndex = 1;
    let listIndex = 0;

    const flushList = () => {
      if (inList && listItems.length > 0) {
        const key = `list-${listIndex++}`;
        if (inList === 'ul') {
          nodes.push(
            <ul
              key={key}
              className={`my-4 ml-6 space-y-2 list-disc text-slate-700 dark:text-slate-300 marker:text-indigo-500 ${typography.list}`}
            >
              {listItems.map((item, idx) => (
                <li key={`ul-item-${idx}`} className="pl-1">
                  {renderInlineFormatting(item.text)}
                </li>
              ))}
            </ul>
          );
        } else if (inList === 'ol') {
          nodes.push(
            <ol
              key={key}
              start={listStartIndex}
              className={`my-4 ml-6 space-y-2 list-decimal text-slate-700 dark:text-slate-300 marker:text-indigo-600 dark:marker:text-indigo-400 font-medium ${typography.list}`}
            >
              {listItems.map((item, idx) => (
                <li key={`ol-item-${idx}`} value={item.num} className="pl-1">
                  <span className="font-normal">{renderInlineFormatting(item.text)}</span>
                </li>
              ))}
            </ol>
          );
        }
        inList = null;
        listItems = [];
        listStartIndex = 1;
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

        // Parse bullet points within blockquote content
        const blockquoteNodes = parseBlockquoteContent(fullText, typography);

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
            <table className={`w-full text-left ${typography.table}`}>
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {renderInlineFormatting(header.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-600 dark:text-slate-300">
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
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
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
          flushList();
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
        flushList();
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
        flushList();
        const cells = line.trim().split('|').slice(1, -1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          continue;
        } else {
          // Check if it's separator row (e.g. |---|---|)
          if (cells.every(c => /^[\s:-]+$/.test(c))) {
            continue;
          }
          tableRows.push(cells);
          continue;
        }
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith('#')) {
        flushList();
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          headings.push({ id: slug, text, level });

          if (level === 1) {
            nodes.push(
              <h1 key={`h1-${i}`} id={slug} className={`${typography.h1} font-extrabold tracking-tight text-slate-900 dark:text-white mt-10 mb-4 font-display scroll-mt-20`}>
                {renderInlineFormatting(text)}
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
              <h3 key={`h3-${i}`} id={slug} className={`${typography.h3} font-bold text-slate-800 dark:text-slate-100 mt-7 mb-2.5 font-display scroll-mt-20`}>
                {renderInlineFormatting(text)}
              </h3>
            );
          } else {
            nodes.push(
              <h4 key={`h4-${i}`} id={slug} className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-5 mb-2 scroll-mt-20">
                {renderInlineFormatting(text)}
              </h4>
            );
          }
          continue;
        }
      }

      // Standalone Image Line Match: ![alt](url "optional caption") or ![alt](url)
      const imgBlockMatch = line.trim().match(/^!\[(.*?)\]\((\S+?)(?:\s+["'](.*?)["'])?\)$/);
      if (imgBlockMatch) {
        flushList();
        flushBlockquote();
        flushTable();
        nodes.push(
          <ImageViewer
            key={`img-${i}`}
            src={imgBlockMatch[2]}
            alt={imgBlockMatch[1]}
            caption={imgBlockMatch[3] || imgBlockMatch[1]}
          />
        );
        continue;
      }

      // Horizontal rule / Divider
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        flushList();
        nodes.push(
          <div key={`hr-${i}`} className="my-8 flex items-center justify-center gap-2">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50"></span>
            <span className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></span>
          </div>
        );
        continue;
      }

      // Checklists (e.g. - [ ] or - [x])
      const checkMatch = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.+)$/);
      if (checkMatch) {
        flushList();
        const isDefaultChecked = checkMatch[2].toLowerCase() === 'x';
        const itemText = checkMatch[3];
        const checkId = `check-${i}-${itemText.slice(0, 10)}`;
        const isCurrentChecked = checkedItems[checkId] !== undefined ? checkedItems[checkId] : isDefaultChecked;

        nodes.push(
          <div
            key={checkId}
            onClick={() => toggleCheckItem(checkId, isDefaultChecked)}
            className="flex items-start gap-3 my-2 cursor-pointer group py-1 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              isCurrentChecked
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-700 group-hover:border-indigo-400 bg-white dark:bg-slate-900'
            }`}>
              {isCurrentChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className={`${typography.checkItem} transition-colors ${
              isCurrentChecked
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {renderInlineFormatting(itemText)}
            </span>
          </div>
        );
        continue;
      }

      // Unordered Lists (*, -, +)
      const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      if (listMatch) {
        flushBlockquote();
        flushTable();
        if (inList === 'ol') {
          flushList();
        }
        if (!inList) {
          inList = 'ul';
        }
        listItems.push({ text: listMatch[2].trim() });
        continue;
      }

      // Ordered / Numbered Lists (1., 2., 1), 2), etc.)
      const olMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
      if (olMatch) {
        flushBlockquote();
        flushTable();
        if (inList === 'ul') {
          flushList();
        }
        const itemNum = parseInt(olMatch[2], 10) || 1;
        if (!inList) {
          inList = 'ol';
          listStartIndex = itemNum;
        }
        listItems.push({ text: olMatch[3].trim(), num: itemNum });
        continue;
      }

      // Empty line
      if (!line.trim()) {
        flushList();
        continue;
      }

      // Regular Paragraph
      flushList();
      nodes.push(
        <p key={`p-${i}`} className={`my-4 text-slate-700 dark:text-slate-300 ${typography.paragraph}`}>
          {renderInlineFormatting(line)}
        </p>
      );
    }

    // Flush any remaining blocks
    flushList();
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
                            className={`w-full text-left p-3.5 rounded-xl border ${typography.quizOption} transition-all flex items-center justify-between gap-3 ${optionStyle}`}
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

// Parse blockquote content into proper React nodes with bullet list support
function parseBlockquoteContent(text: string, typography: any): React.ReactNode {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join('\n').trim();
      if (paraText) {
        nodes.push(
          <p key={`bq-p-${nodes.length}`} className={`${typography.blockquote}`}>
            {renderInlineFormatting(paraText)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  let inList = false;
  let listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet list item
    if (trimmed.match(/^[-*+]\s+(.+)$/)) {
      flushParagraph();
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(trimmed.replace(/^[-*+]\s+/, ''));
      continue;
    }

    // Numbered list item
    if (trimmed.match(/^\d+[.)]\s+(.+)$/)) {
      flushParagraph();
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      continue;
    }

    // Empty line (blank line) - creates paragraph break
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Regular content - but if we're in a list, flush first
    if (inList) {
      flushParagraph();
      nodes.push(
        <ul key={`bq-ul-${nodes.length}`} className={`ml-4 my-2 space-y-1.5 list-disc marker:text-indigo-500 ${typography.list}`}>
          {listItems.map((item, idx) => (
            <li key={`bq-li-${idx}`} className="pl-1">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      inList = false;
      listItems = [];
    }

    currentParagraph.push(line);
  }

  // Flush any remaining
  if (inList && listItems.length > 0) {
    flushParagraph();
    nodes.push(
      <ul key={`bq-ul-${nodes.length}`} className={`ml-4 my-2 space-y-1.5 list-disc marker:text-indigo-500 ${typography.list}`}>
        {listItems.map((item, idx) => (
          <li key={`bq-li-${idx}`} className="pl-1">
            {renderInlineFormatting(item)}
          </li>
        ))}
      </ul>
    );
  } else {
    flushParagraph();
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

// Helper function to render bold, italic, inline code, and links
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex to split by `code`, **bold**, *italic*, [link](url)
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[0.88em] font-medium border border-slate-200/60 dark:border-slate-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    return part;
  });
}
