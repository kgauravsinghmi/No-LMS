import { GradientTheme } from '../types';

export interface GradientStyle {
  id: GradientTheme;
  name: string;
  badge: string;
  pill: string;
  hero: string;
  borderGlow: string;
  accentText: string;
  activeBg: string;
  activeBorder: string;
  darkActiveBg: string;
  cardHeader: string;
  buttonGradient: string;
  progressBar: string;
}

export const GRADIENT_THEMES: Record<GradientTheme, GradientStyle> = {
  'indigo-violet': {
    id: 'indigo-violet',
    name: 'Indigo Aurora',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/40',
    pill: 'from-indigo-500 to-violet-600',
    hero: 'from-indigo-50/80 via-purple-50/40 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-indigo-300/80 hover:shadow-indigo-500/10 dark:hover:border-indigo-500/40',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
    activeBorder: 'border-l-indigo-600 text-indigo-900 dark:text-indigo-200',
    darkActiveBg: 'dark:bg-indigo-950/50',
    cardHeader: 'from-indigo-100/60 via-purple-50/40 to-transparent dark:from-indigo-950/60 dark:via-purple-900/20',
    buttonGradient: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-indigo-500 to-violet-500'
  },
  'violet-fuchsia': {
    id: 'violet-fuchsia',
    name: 'Violet Blossom',
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800/40',
    pill: 'from-violet-500 to-fuchsia-600',
    hero: 'from-violet-50/80 via-fuchsia-50/40 to-pink-50/30 dark:from-violet-950/40 dark:via-fuchsia-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-fuchsia-300/80 hover:shadow-fuchsia-500/10 dark:hover:border-fuchsia-500/40',
    accentText: 'text-fuchsia-600 dark:text-fuchsia-400',
    activeBg: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/40',
    activeBorder: 'border-l-fuchsia-600 text-fuchsia-900 dark:text-fuchsia-200',
    darkActiveBg: 'dark:bg-fuchsia-950/50',
    cardHeader: 'from-violet-100/60 via-fuchsia-50/40 to-transparent dark:from-violet-950/60 dark:via-fuchsia-900/20',
    buttonGradient: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-sm shadow-fuchsia-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
  },
  'cyan-blue': {
    id: 'cyan-blue',
    name: 'Glacier Blue',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/40',
    pill: 'from-cyan-500 to-blue-600',
    hero: 'from-cyan-50/80 via-sky-50/40 to-blue-50/30 dark:from-cyan-950/40 dark:via-sky-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-cyan-300/80 hover:shadow-cyan-500/10 dark:hover:border-cyan-500/40',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/40',
    activeBorder: 'border-l-cyan-600 text-cyan-900 dark:text-cyan-200',
    darkActiveBg: 'dark:bg-cyan-950/50',
    cardHeader: 'from-cyan-100/60 via-blue-50/40 to-transparent dark:from-cyan-950/60 dark:via-blue-900/20',
    buttonGradient: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm shadow-cyan-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-cyan-500 to-blue-500'
  },
  'emerald-teal': {
    id: 'emerald-teal',
    name: 'Jade Emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40',
    pill: 'from-emerald-500 to-teal-600',
    hero: 'from-emerald-50/80 via-teal-50/40 to-cyan-50/30 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-emerald-300/80 hover:shadow-emerald-500/10 dark:hover:border-emerald-500/40',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    activeBorder: 'border-l-emerald-600 text-emerald-900 dark:text-emerald-200',
    darkActiveBg: 'dark:bg-emerald-950/50',
    cardHeader: 'from-emerald-100/60 via-teal-50/40 to-transparent dark:from-emerald-950/60 dark:via-teal-900/20',
    buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500'
  },
  'amber-orange': {
    id: 'amber-orange',
    name: 'Sunset Amber',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/40',
    pill: 'from-amber-500 to-orange-600',
    hero: 'from-amber-50/80 via-orange-50/40 to-yellow-50/30 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-amber-300/80 hover:shadow-amber-500/10 dark:hover:border-amber-500/40',
    accentText: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50/80 dark:bg-amber-950/40',
    activeBorder: 'border-l-amber-600 text-amber-900 dark:text-amber-200',
    darkActiveBg: 'dark:bg-amber-950/50',
    cardHeader: 'from-amber-100/60 via-orange-50/40 to-transparent dark:from-amber-950/60 dark:via-orange-900/20',
    buttonGradient: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-sm shadow-amber-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-amber-500 to-orange-500'
  },
  'rose-pink': {
    id: 'rose-pink',
    name: 'Velvet Rose',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/40',
    pill: 'from-rose-500 to-pink-600',
    hero: 'from-rose-50/80 via-pink-50/40 to-red-50/30 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900/40',
    borderGlow: 'hover:border-rose-300/80 hover:shadow-rose-500/10 dark:hover:border-rose-500/40',
    accentText: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-rose-50/80 dark:bg-rose-950/40',
    activeBorder: 'border-l-rose-600 text-rose-900 dark:text-rose-200',
    darkActiveBg: 'dark:bg-rose-950/50',
    cardHeader: 'from-rose-100/60 via-pink-50/40 to-transparent dark:from-rose-950/60 dark:via-pink-900/20',
    buttonGradient: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-sm shadow-rose-200/50 dark:shadow-none',
    progressBar: 'bg-gradient-to-r from-rose-500 to-pink-500'
  },
  'slate-zinc': {
    id: 'slate-zinc',
    name: 'Minimal Platinum',
    badge: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    pill: 'from-slate-700 to-zinc-900',
    hero: 'from-slate-100/90 via-zinc-50/50 to-gray-50/30 dark:from-slate-900/60 dark:via-zinc-900/30 dark:to-slate-950/60',
    borderGlow: 'hover:border-slate-400 hover:shadow-slate-500/10 dark:hover:border-slate-500',
    accentText: 'text-slate-800 dark:text-slate-200',
    activeBg: 'bg-slate-100/80 dark:bg-slate-800/60',
    activeBorder: 'border-l-slate-800 text-slate-900 dark:text-slate-100',
    darkActiveBg: 'dark:bg-slate-800/80',
    cardHeader: 'from-slate-200/60 via-zinc-100/30 to-transparent dark:from-slate-800/60 dark:via-zinc-800/20',
    buttonGradient: 'bg-gradient-to-r from-slate-800 to-zinc-900 hover:from-slate-700 hover:to-zinc-800 text-white shadow-sm',
    progressBar: 'bg-gradient-to-r from-slate-600 to-zinc-800'
  }
};
