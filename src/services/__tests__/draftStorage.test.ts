import { describe, it, expect, beforeEach } from 'vitest';
import { draftStorageService, EditorDraft } from '../draftStorage';

describe('draftStorageService (Dual-Tier Auto-Save Engine)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves offline drafts synchronously and asynchronously', async () => {
    const draft: EditorDraft = {
      courseId: 'course-1',
      moduleId: 'mod-1',
      topicId: 'topic-1',
      topicData: {
        title: 'Draft in Progress',
        slug: 'draft-in-progress',
        readingTimeMinutes: 8,
        summary: 'A summary of the draft',
        content: '# Deep Dive Content\nDrafting ongoing...',
        keyTakeaways: ['Takeaway 1', 'Takeaway 2'],
      },
      savedAt: Date.now(),
    };

    await draftStorageService.saveDraft(draft);

    // Test synchronous fast-cache read
    const syncDraft = draftStorageService.getDraftSync('course-1', 'mod-1', 'topic-1');
    expect(syncDraft).toBeDefined();
    expect(syncDraft?.topicData.title).toBe('Draft in Progress');
    expect(syncDraft?.topicData.content).toContain('Deep Dive Content');

    // Test async read
    const asyncDraft = await draftStorageService.getDraft('course-1', 'mod-1', 'topic-1');
    expect(asyncDraft).toBeDefined();
    expect(asyncDraft?.topicData.slug).toBe('draft-in-progress');
  });

  it('clears draft after publishing or discarding', async () => {
    const draft: EditorDraft = {
      courseId: 'course-1',
      moduleId: 'mod-1',
      topicId: 'topic-2',
      topicData: {
        title: 'Temporary draft',
        slug: 'temp',
        readingTimeMinutes: 3,
        summary: '',
        content: 'temp content',
        keyTakeaways: [],
      },
      savedAt: Date.now(),
    };

    await draftStorageService.saveDraft(draft);
    expect(draftStorageService.getDraftSync('course-1', 'mod-1', 'topic-2')).toBeDefined();

    await draftStorageService.clearDraft('course-1', 'mod-1', 'topic-2');
    expect(draftStorageService.getDraftSync('course-1', 'mod-1', 'topic-2')).toBeNull();
  });
});
