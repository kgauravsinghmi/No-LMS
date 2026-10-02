import { Topic, Course, EditorInfo } from '../../types';
import { ConflictDetectionResult, DiffChunk, MergeStrategy } from '../../types/conflict';

export class ConflictService {
  /**
   * Computes a fast deterministic 32-bit hash checksum string from text or entity state
   */
  public generateHash(input: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return `rev_${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  /**
   * Generates a deterministic content revision hash for a topic
   */
  public generateTopicRevisionHash(topic: Partial<Topic>): string {
    const rawContent = [
      topic.title || '',
      topic.summary || '',
      topic.content || '',
      (topic.keyTakeaways || []).join('::'),
      (topic.quiz || []).map((q) => `${q.question}_${q.correctAnswer}`).join('::')
    ].join('|||');

    return this.generateHash(rawContent);
  }

  /**
   * Generates a deterministic revision hash for a course entity
   */
  public generateCourseRevisionHash(course: Partial<Course>): string {
    const rawContent = [
      course.title || '',
      course.description || '',
      course.category || '',
      course.level || '',
      (course.tags || []).join(','),
      (course.modules || [])
        .map((m) => `${m.id}_${(m.topics || []).map((t) => t.id).join('_')}`)
        .join('::')
    ].join('|||');

    return this.generateHash(rawContent);
  }

  /**
   * Line-by-line diff comparison between two text blocks
   */
  public calculateDiffChunks(localText: string = '', remoteText: string = ''): DiffChunk[] {
    const localLines = localText.split('\n');
    const remoteLines = remoteText.split('\n');
    const maxLines = Math.max(localLines.length, remoteLines.length);
    const chunks: DiffChunk[] = [];

    for (let i = 0; i < maxLines; i++) {
      const localLine = localLines[i];
      const remoteLine = remoteLines[i];

      if (localLine === undefined) {
        // Line added in remote version
        chunks.push({
          type: 'added',
          lineNumber: i + 1,
          localContent: '',
          remoteContent: remoteLine,
          mergedContent: remoteLine
        });
      } else if (remoteLine === undefined) {
        // Line removed in remote version (present locally)
        chunks.push({
          type: 'removed',
          lineNumber: i + 1,
          localContent: localLine,
          remoteContent: '',
          mergedContent: localLine
        });
      } else if (localLine === remoteLine) {
        // Line unchanged
        chunks.push({
          type: 'unchanged',
          lineNumber: i + 1,
          localContent: localLine,
          remoteContent: remoteLine,
          mergedContent: localLine
        });
      } else {
        // Line modified
        chunks.push({
          type: 'modified',
          lineNumber: i + 1,
          localContent: localLine,
          remoteContent: remoteLine,
          mergedContent: localLine
        });
      }
    }

    return chunks;
  }

  /**
   * Detects optimistic locking conflicts between local state and latest server snapshot
   */
  public detectTopicConflict(
    localTopic: Topic,
    remoteTopic: Topic | null | undefined,
    currentUserId?: string
  ): ConflictDetectionResult<Topic> {
    if (!remoteTopic) {
      return {
        hasConflict: false,
        localEntity: localTopic,
        remoteEntity: localTopic,
        localRevision: this.generateTopicRevisionHash(localTopic),
        remoteRevision: this.generateTopicRevisionHash(localTopic),
        conflictDetectedAt: new Date().toISOString(),
        conflictingFields: []
      };
    }

    const localRev = localTopic.revisionHash || this.generateTopicRevisionHash(localTopic);
    const remoteRev = remoteTopic.revisionHash || this.generateTopicRevisionHash(remoteTopic);

    // If revision hashes match, there is no conflict
    if (localRev === remoteRev) {
      return {
        hasConflict: false,
        localEntity: localTopic,
        remoteEntity: remoteTopic,
        localRevision: localRev,
        remoteRevision: remoteRev,
        conflictDetectedAt: new Date().toISOString(),
        conflictingFields: []
      };
    }

    // Check if remote version was modified by someone else
    const isRemoteModifiedByOther =
      remoteTopic.lastEditedBy?.id &&
      currentUserId &&
      remoteTopic.lastEditedBy.id !== currentUserId;

    const isVersionMismatch =
      (remoteTopic.version !== undefined && localTopic.version !== undefined && remoteTopic.version > localTopic.version);

    const conflictingFields: string[] = [];
    if (localTopic.title !== remoteTopic.title) conflictingFields.push('title');
    if (localTopic.summary !== remoteTopic.summary) conflictingFields.push('summary');
    if (localTopic.content !== remoteTopic.content) conflictingFields.push('content');
    if (JSON.stringify(localTopic.keyTakeaways) !== JSON.stringify(remoteTopic.keyTakeaways)) {
      conflictingFields.push('keyTakeaways');
    }
    if (JSON.stringify(localTopic.quiz) !== JSON.stringify(remoteTopic.quiz)) {
      conflictingFields.push('quiz');
    }

    const diffChunks = this.calculateDiffChunks(localTopic.content, remoteTopic.content);

    const hasConflict = isRemoteModifiedByOther || isVersionMismatch || conflictingFields.length > 0;

    return {
      hasConflict,
      localEntity: localTopic,
      remoteEntity: remoteTopic,
      localRevision: localRev,
      remoteRevision: remoteRev,
      lastEditedBy: remoteTopic.lastEditedBy,
      conflictDetectedAt: new Date().toISOString(),
      diffChunks,
      conflictingFields
    };
  }

  /**
   * Resolves a topic conflict based on selected merge strategy
   */
  public resolveTopicMerge(
    localTopic: Topic,
    remoteTopic: Topic,
    strategy: MergeStrategy,
    manualContent?: string,
    editor?: EditorInfo
  ): Topic {
    const nextVersion = Math.max(localTopic.version || 1, remoteTopic.version || 1) + 1;
    const now = new Date().toISOString();

    if (strategy === 'keep-local') {
      const merged: Topic = {
        ...localTopic,
        version: nextVersion,
        lastEditedBy: editor || localTopic.lastEditedBy,
        updatedAt: now
      };
      merged.revisionHash = this.generateTopicRevisionHash(merged);
      return merged;
    }

    if (strategy === 'keep-remote') {
      const merged: Topic = {
        ...remoteTopic,
        version: nextVersion,
        lastEditedBy: editor || remoteTopic.lastEditedBy,
        updatedAt: now
      };
      merged.revisionHash = this.generateTopicRevisionHash(merged);
      return merged;
    }

    // Manual / 3-Way Merge
    const mergedContent = manualContent !== undefined ? manualContent : localTopic.content;
    const merged: Topic = {
      ...localTopic,
      content: mergedContent,
      version: nextVersion,
      lastEditedBy: editor || localTopic.lastEditedBy,
      updatedAt: now
    };
    merged.revisionHash = this.generateTopicRevisionHash(merged);
    return merged;
  }
}

export const conflictService = new ConflictService();
