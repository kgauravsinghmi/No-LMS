import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

describe('MarkdownRenderer component', () => {
  it('renders standard Markdown headings correctly', () => {
    const markdown = `# Main Title\n## Secondary Section\n### Sub-heading`;
    render(<MarkdownRenderer content={markdown} />);

    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Secondary Section')).toBeInTheDocument();
    expect(screen.getByText('Sub-heading')).toBeInTheDocument();
  });

  describe('Callout Blockquotes', () => {
    it('renders [!NOTE] callouts with Note label and styling', () => {
      const markdown = `> [!NOTE]\n> This is an informative callout notice.`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('Note')).toBeInTheDocument();
      expect(screen.getByText(/This is an informative callout notice/i)).toBeInTheDocument();
    });

    it('renders [!TIP] callouts with Pro Tip label', () => {
      const markdown = `> [!TIP]\n> Use Redis for sub-millisecond caching responses.`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('Pro Tip')).toBeInTheDocument();
      expect(screen.getByText(/Use Redis for sub-millisecond caching responses/i)).toBeInTheDocument();
    });

    it('renders [!WARNING] callouts with Caution label', () => {
      const markdown = `> [!WARNING]\n> Never expose raw database credentials in client code.`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('Caution')).toBeInTheDocument();
      expect(screen.getByText(/Never expose raw database credentials in client code/i)).toBeInTheDocument();
    });

    it('renders [!IMPORTANT] callouts with Important label', () => {
      const markdown = `> [!IMPORTANT]\n> Ensure atomic transactions when debiting accounts.`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText(/Ensure atomic transactions when debiting accounts/i)).toBeInTheDocument();
    });
  });

  describe('Lists & Task Checklists', () => {
    it('renders interactive task checklists and allows toggle interaction', () => {
      const markdown = `- [ ] Implement auth middleware\n- [x] Configure PostgreSQL pool`;
      render(<MarkdownRenderer content={markdown} />);

      const uncompletedItem = screen.getByText('Implement auth middleware');
      const completedItem = screen.getByText('Configure PostgreSQL pool');

      expect(uncompletedItem).toBeInTheDocument();
      expect(completedItem).toBeInTheDocument();

      // Pre-checked item should have line-through styling class
      expect(completedItem.className).toContain('line-through');

      // Click the uncompleted item to toggle it
      fireEvent.click(uncompletedItem);
      expect(uncompletedItem.className).toContain('line-through');
    });

    it('renders numbered and bulleted lists', () => {
      const markdown = `1. Step One\n2. Step Two\n\n- Feature Alpha\n- Feature Beta`;
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('Step One')).toBeInTheDocument();
      expect(screen.getByText('Step Two')).toBeInTheDocument();
      expect(screen.getByText('Feature Alpha')).toBeInTheDocument();
      expect(screen.getByText('Feature Beta')).toBeInTheDocument();
    });
  });

  describe('Code blocks & Copying', () => {
    it('renders syntax-highlighted code blocks with language badge and copy action', () => {
      const markdown = "```typescript\nconst message: string = 'Hello TypeScript';\nconsole.log(message);\n```";
      render(<MarkdownRenderer content={markdown} />);

      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText(/const message: string = 'Hello TypeScript'/i)).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /copy/i });
      expect(copyBtn).toBeInTheDocument();
      fireEvent.click(copyBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Interactive Quiz Assessment', () => {
    it('renders quiz questions, enables answer selection, and checks score', () => {
      const onQuizSubmit = vi.fn();
      const sampleQuiz = [
        {
          id: 'q1',
          question: 'What is the primary benefit of an inverted index in search engines?',
          options: [
            'O(1) lookups for word-to-document postings',
            'Lower memory footprint than flat arrays',
            'Built-in relational foreign keys'
          ],
          correctAnswer: 0,
          explanation: 'Inverted indexes map terms directly to document lists for instant retrieval.'
        }
      ];

      render(
        <MarkdownRenderer
          content="## Search Engine Architecture\nLesson content here."
          quiz={sampleQuiz}
          topicId="topic-search-101"
          onQuizSubmit={onQuizSubmit}
        />
      );

      expect(screen.getByText(/What is the primary benefit of an inverted index/i)).toBeInTheDocument();

      const option = screen.getByText('O(1) lookups for word-to-document postings');
      fireEvent.click(option);

      const submitBtn = screen.getByRole('button', { name: /submit answers/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Inverted indexes map terms directly/i)).toBeInTheDocument();
      expect(screen.getByText(/Score: 1 \/ 1/i)).toBeInTheDocument();
      expect(onQuizSubmit).toHaveBeenCalledWith(1, 1);
    });
  });
});
