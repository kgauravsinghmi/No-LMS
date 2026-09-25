import React from 'react';
import {
  Cpu,
  Server,
  Sparkles,
  Layers,
  Terminal,
  BookOpen,
  Compass,
  Code,
  Zap,
  Database,
  ShieldCheck,
  Workflow,
  Lightbulb,
  Flame,
  Feather,
  Box,
  Brain,
  Rocket
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Cpu', label: 'Processor / Core', component: Cpu },
  { name: 'Server', label: 'Backend / Server', component: Server },
  { name: 'Sparkles', label: 'UI / Design', component: Sparkles },
  { name: 'Layers', label: 'Architecture', component: Layers },
  { name: 'Terminal', label: 'CLI / System', component: Terminal },
  { name: 'BookOpen', label: 'Knowledge', component: BookOpen },
  { name: 'Compass', label: 'Guide / Basics', component: Compass },
  { name: 'Code', label: 'Coding / JS', component: Code },
  { name: 'Zap', label: 'Performance', component: Zap },
  { name: 'Database', label: 'Database & SQL', component: Database },
  { name: 'ShieldCheck', label: 'Security & Auth', component: ShieldCheck },
  { name: 'Workflow', label: 'DevOps / Pipeline', component: Workflow },
  { name: 'Brain', label: 'AI & Mental Models', component: Brain },
  { name: 'Rocket', label: 'Startup / Production', component: Rocket },
  { name: 'Feather', label: 'Minimalist Writing', component: Feather },
  { name: 'Flame', label: 'High Priority', component: Flame },
  { name: 'Lightbulb', label: 'Ideas & Innovation', component: Lightbulb },
  { name: 'Box', label: 'Components / Modular', component: Box }
];

export const COURSE_ICON_MAP = AVAILABLE_ICONS;

export function getCourseIcon(iconName?: string, className: string = 'w-6 h-6'): React.ReactNode {
  const match = AVAILABLE_ICONS.find(i => i.name.toLowerCase() === (iconName || '').toLowerCase());
  const IconComp = match ? match.component : BookOpen;
  return <IconComp className={className} />;
}
