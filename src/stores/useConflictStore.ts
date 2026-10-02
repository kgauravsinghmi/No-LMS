import { create } from 'zustand';
import { Topic, EditorInfo } from '../types';
import { ConflictDetectionResult, MergeStrategy } from '../types/conflict';
import { conflictService } from '../services/conflict/conflictService';

interface ConflictState {
  isOpen: boolean;
  courseId: string | null;
  moduleId: string | null;
  topicId: string | null;
  conflictData: ConflictDetectionResult<Topic> | null;
  selectedStrategy: MergeStrategy;
  manualMergedContent: string;
  onResolveCallback: ((resolvedTopic: Topic) => void) | null;

  // Actions
  openConflictModal: (
    courseId: string,
    moduleId: string,
    topicId: string,
    conflictData: ConflictDetectionResult<Topic>,
    onResolve: (resolvedTopic: Topic) => void
  ) => void;
  closeConflictModal: () => void;
  setSelectedStrategy: (strategy: MergeStrategy) => void;
  setManualMergedContent: (content: string) => void;
  resolveConflict: (editor?: EditorInfo) => void;
}

export const useConflictStore = create<ConflictState>((set, get) => ({
  isOpen: false,
  courseId: null,
  moduleId: null,
  topicId: null,
  conflictData: null,
  selectedStrategy: 'keep-local',
  manualMergedContent: '',
  onResolveCallback: null,

  openConflictModal: (courseId, moduleId, topicId, conflictData, onResolve) => {
    set({
      isOpen: true,
      courseId,
      moduleId,
      topicId,
      conflictData,
      selectedStrategy: 'manual-merge',
      manualMergedContent: conflictData.localEntity.content || '',
      onResolveCallback: onResolve
    });
  },

  closeConflictModal: () => {
    set({
      isOpen: false,
      conflictData: null,
      onResolveCallback: null
    });
  },

  setSelectedStrategy: (strategy: MergeStrategy) => {
    set({ selectedStrategy: strategy });
  },

  setManualMergedContent: (content: string) => {
    set({ manualMergedContent: content });
  },

  resolveConflict: (editor?: EditorInfo) => {
    const { conflictData, selectedStrategy, manualMergedContent, onResolveCallback } = get();
    if (!conflictData || !onResolveCallback) return;

    const resolved = conflictService.resolveTopicMerge(
      conflictData.localEntity,
      conflictData.remoteEntity,
      selectedStrategy,
      manualMergedContent,
      editor
    );

    onResolveCallback(resolved);
    set({
      isOpen: false,
      conflictData: null,
      onResolveCallback: null
    });
  }
}));
