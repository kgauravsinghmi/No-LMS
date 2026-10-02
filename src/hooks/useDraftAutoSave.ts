import { useState, useEffect, useRef, useCallback } from 'react';
import { Topic } from '../types';
import { draftStorageService, EditorDraft } from '../services/draftStorage';

export type AutoSaveStatus = 'synced' | 'saving' | 'unsaved_draft' | 'recovered' | 'error';

interface UseDraftAutoSaveProps {
  courseId: string;
  moduleId: string;
  topic: Topic | null;
  currentData: {
    title: string;
    slug: string;
    readingTimeMinutes: number;
    summary: string;
    content: string;
    keyTakeaways: string[];
    quiz?: Topic['quiz'];
  };
  onRestoreDraft?: (restoredData: EditorDraft['topicData']) => void;
}

export function useDraftAutoSave({
  courseId,
  moduleId,
  topic,
  currentData,
  onRestoreDraft,
}: UseDraftAutoSaveProps) {
  const [status, setStatus] = useState<AutoSaveStatus>('synced');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [recoverableDraft, setRecoverableDraft] = useState<EditorDraft | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  // Topic identifier
  const topicId = topic?.id || '';

  // Check for existing recoverable offline draft on topic change
  useEffect(() => {
    if (!courseId || !moduleId || !topicId) {
      setRecoverableDraft(null);
      return;
    }

    const draft = draftStorageService.getDraftSync(courseId, moduleId, topicId);
    if (draft && topic) {
      const topicTime = new Date(topic.updatedAt || 0).getTime();
      const hasContentDifference =
        draft.topicData.content !== topic.content ||
        draft.topicData.title !== topic.title ||
        draft.topicData.summary !== topic.summary;

      if (draft.savedAt > topicTime && hasContentDifference) {
        setRecoverableDraft(draft);
      } else {
        setRecoverableDraft(null);
      }
    } else {
      setRecoverableDraft(null);
    }
    isInitialMountRef.current = true;
  }, [courseId, moduleId, topicId, topic]);

  // Debounced Auto-Save
  useEffect(() => {
    if (!courseId || !moduleId || !topicId || !topic) return;

    // Skip the initial mount/sync to avoid overwriting clean topic
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Check if currentData differs from topic
    const hasChanged =
      currentData.title !== topic.title ||
      currentData.content !== topic.content ||
      currentData.summary !== topic.summary ||
      currentData.readingTimeMinutes !== topic.readingTimeMinutes ||
      JSON.stringify(currentData.keyTakeaways) !== JSON.stringify(topic.keyTakeaways) ||
      JSON.stringify(currentData.quiz) !== JSON.stringify(topic.quiz);

    if (!hasChanged) {
      setStatus('synced');
      return;
    }

    setStatus('unsaved_draft');

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        setStatus('saving');
        const draft: EditorDraft = {
          courseId,
          moduleId,
          topicId,
          topicData: currentData,
          savedAt: Date.now(),
        };

        await draftStorageService.saveDraft(draft);
        setStatus('synced');
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed', err);
        setStatus('error');
      }
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [courseId, moduleId, topicId, topic, currentData]);

  // Actions
  const restoreDraft = useCallback(() => {
    if (recoverableDraft && onRestoreDraft) {
      onRestoreDraft(recoverableDraft.topicData);
      setRecoverableDraft(null);
      setStatus('recovered');
      setLastSaved(new Date(recoverableDraft.savedAt));
    }
  }, [recoverableDraft, onRestoreDraft]);

  const discardDraft = useCallback(async () => {
    if (courseId && moduleId && topicId) {
      await draftStorageService.clearDraft(courseId, moduleId, topicId);
      setRecoverableDraft(null);
      setStatus('synced');
    }
  }, [courseId, moduleId, topicId]);

  const markPublished = useCallback(async () => {
    if (courseId && moduleId && topicId) {
      await draftStorageService.clearDraft(courseId, moduleId, topicId);
      setRecoverableDraft(null);
      setStatus('synced');
      setLastSaved(new Date());
    }
  }, [courseId, moduleId, topicId]);

  return {
    status,
    lastSaved,
    recoverableDraft,
    restoreDraft,
    discardDraft,
    markPublished,
  };
}
