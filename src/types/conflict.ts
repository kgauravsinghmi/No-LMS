import { Topic, Course, EditorInfo } from './index';

export type MergeStrategy = 'keep-local' | 'keep-remote' | 'manual-merge';

export interface DiffChunk {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  lineNumber: number;
  localContent?: string;
  remoteContent?: string;
  mergedContent?: string;
}

export interface ConflictDetectionResult<T = Topic> {
  hasConflict: boolean;
  localEntity: T;
  remoteEntity: T;
  localRevision: string;
  remoteRevision: string;
  lastEditedBy?: EditorInfo;
  conflictDetectedAt: string;
  diffChunks?: DiffChunk[];
  conflictingFields: string[];
}

export interface DraftRevision {
  id: string;
  entityId: string;
  entityType: 'topic' | 'module' | 'course';
  version: number;
  revisionHash: string;
  title: string;
  summary: string;
  content: string;
  keyTakeaways?: string[];
  lastEditedBy: EditorInfo;
  createdAt: string;
}

export interface ConflictResolutionState {
  isOpen: boolean;
  courseId: string;
  moduleId: string;
  topicId: string;
  conflictData: ConflictDetectionResult<Topic> | null;
  selectedStrategy: MergeStrategy;
  manualMergedContent?: string;
}
