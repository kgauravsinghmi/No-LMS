import { describe, it, expect } from 'vitest';
import { conflictService } from '../conflictService';
import { Topic } from '../../../types';

describe('ConflictService', () => {
  const baseTopic: Topic = {
    id: 'top-1',
    title: 'Distributed Systems Architecture',
    slug: 'distributed-systems-architecture',
    summary: 'An introductory guide to consensus and replication.',
    readingTimeMinutes: 10,
    order: 1,
    isPublished: true,
    content: 'Line 1: Overview\nLine 2: Raft Consensus\nLine 3: Paxos Comparison',
    keyTakeaways: ['Raft is simpler', 'Leader election requires quorum'],
    updatedAt: new Date().toISOString(),
    quiz: [
      {
        id: 'q-1',
        question: 'What is quorum in a 5-node cluster?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
        explanation: 'A majority quorum for 5 nodes is 3.'
      }
    ],
    version: 1,
    lastEditedBy: {
      id: 'author-alice',
      name: 'Alice Designer',
      role: 'instructor'
    }
  };

  describe('generateHash & generateTopicRevisionHash', () => {
    it('produces a deterministic hash for identical content', () => {
      const hash1 = conflictService.generateTopicRevisionHash(baseTopic);
      const hash2 = conflictService.generateTopicRevisionHash({ ...baseTopic });
      expect(hash1).toBe(hash2);
      expect(hash1.startsWith('rev_')).toBe(true);
    });

    it('changes revision hash when content or title changes', () => {
      const hashBefore = conflictService.generateTopicRevisionHash(baseTopic);
      const modifiedTopic: Topic = {
        ...baseTopic,
        content: 'Line 1: Overview\nLine 2: Byzantine Fault Tolerance'
      };
      const hashAfter = conflictService.generateTopicRevisionHash(modifiedTopic);
      expect(hashBefore).not.toBe(hashAfter);
    });
  });

  describe('calculateDiffChunks', () => {
    it('accurately identifies unchanged, added, removed, and modified lines', () => {
      const local = 'Line A\nLine B\nLine C';
      const remote = 'Line A\nLine B Modified\nLine C\nLine D';

      const chunks = conflictService.calculateDiffChunks(local, remote);
      expect(chunks.length).toBe(4);

      // Line 1: Line A (unchanged)
      expect(chunks[0].type).toBe('unchanged');
      expect(chunks[0].localContent).toBe('Line A');
      expect(chunks[0].remoteContent).toBe('Line A');

      // Line 2: Line B vs Line B Modified (modified)
      expect(chunks[1].type).toBe('modified');
      expect(chunks[1].localContent).toBe('Line B');
      expect(chunks[1].remoteContent).toBe('Line B Modified');

      // Line 3: Line C (unchanged)
      expect(chunks[2].type).toBe('unchanged');

      // Line 4: Line D added in remote
      expect(chunks[3].type).toBe('added');
      expect(chunks[3].remoteContent).toBe('Line D');
    });
  });

  describe('detectTopicConflict', () => {
    it('detects no conflict when revision hashes match', () => {
      const result = conflictService.detectTopicConflict(baseTopic, baseTopic, 'author-alice');
      expect(result.hasConflict).toBe(false);
      expect(result.conflictingFields.length).toBe(0);
    });

    it('detects a conflict when another author updated the remote topic', () => {
      const remoteEditedTopic: Topic = {
        ...baseTopic,
        title: 'Distributed Systems & Byzantine Faults',
        version: 2,
        lastEditedBy: {
          id: 'author-bob',
          name: 'Bob Reviewer',
          role: 'admin'
        }
      };
      remoteEditedTopic.revisionHash = conflictService.generateTopicRevisionHash(remoteEditedTopic);

      const localCandidate: Topic = {
        ...baseTopic,
        content: 'Updated local draft with new code snippets.'
      };
      localCandidate.revisionHash = conflictService.generateTopicRevisionHash(localCandidate);

      const result = conflictService.detectTopicConflict(localCandidate, remoteEditedTopic, 'author-alice');
      expect(result.hasConflict).toBe(true);
      expect(result.conflictingFields).toContain('title');
      expect(result.conflictingFields).toContain('content');
    });
  });

  describe('resolveTopicMerge', () => {
    const remoteTopic: Topic = {
      ...baseTopic,
      title: 'Server Title',
      content: 'Server Content Body',
      version: 3,
      lastEditedBy: { id: 'remote-user', name: 'Server Author', role: 'admin' }
    };

    it('resolves using keep-local strategy', () => {
      const resolved = conflictService.resolveTopicMerge(baseTopic, remoteTopic, 'keep-local');
      expect(resolved.title).toBe(baseTopic.title);
      expect(resolved.content).toBe(baseTopic.content);
      expect(resolved.version).toBe(4);
    });

    it('resolves using keep-remote strategy', () => {
      const resolved = conflictService.resolveTopicMerge(baseTopic, remoteTopic, 'keep-remote');
      expect(resolved.title).toBe(remoteTopic.title);
      expect(resolved.content).toBe(remoteTopic.content);
      expect(resolved.version).toBe(4);
    });

    it('resolves using manual-merge strategy with synthesized content', () => {
      const manualText = 'Synthesized Chapter 1 with both author notes.';
      const resolved = conflictService.resolveTopicMerge(
        baseTopic,
        remoteTopic,
        'manual-merge',
        manualText,
        { id: 'cur-user', name: 'Resolving Instructor', role: 'instructor' }
      );
      expect(resolved.content).toBe(manualText);
      expect(resolved.lastEditedBy?.name).toBe('Resolving Instructor');
      expect(resolved.version).toBe(4);
    });
  });
});
