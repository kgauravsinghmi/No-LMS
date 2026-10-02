import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MindmapViewer, parseMindmapContent } from '../MindmapViewer';

describe('MindmapViewer & Tree Parsing', () => {
  describe('parseMindmapContent', () => {
    it('parses Markdown heading hierarchy (#, ##, ###) into nested mindmap nodes', () => {
      const markdownHierarchy = `
# System Design
## Networking
### TCP/IP
### WebSockets
## Storage
### SQL
### NoSQL
      `.trim();

      const root = parseMindmapContent(markdownHierarchy);
      expect(root).not.toBeNull();
      expect(root?.title).toBe('System Design');
      expect(root?.children.length).toBe(2);
      expect(root?.children[0].title).toBe('Networking');
      expect(root?.children[0].children.length).toBe(2);
      expect(root?.children[0].children[0].title).toBe('TCP/IP');
    });

    it('parses Mermaid syntax (mindmap root((Title))) correctly', () => {
      const mermaidMindmap = `
mindmap
  root((Full Stack))
    Frontend
      React
      Tailwind
    Backend
      Node.js
      PostgreSQL
      `.trim();

      const root = parseMindmapContent(mermaidMindmap);
      expect(root).not.toBeNull();
      expect(root?.title).toBe('Full Stack');
      expect(root?.children.length).toBe(2);
    });

    it('returns null for empty input', () => {
      expect(parseMindmapContent('')).toBeNull();
      expect(parseMindmapContent('   \n  ')).toBeNull();
    });
  });

  describe('MindmapViewer component rendering', () => {
    it('renders the interactive Mindmap node cards and title', () => {
      const content = `
# Cloud Architecture
## Compute
### Serverless
## Database
### Managed Redis
      `.trim();

      render(<MindmapViewer content={content} title="Cloud Overview" />);

      expect(screen.getByText('Cloud Overview')).toBeInTheDocument();
      expect(screen.getByText('Cloud Architecture')).toBeInTheDocument();
      expect(screen.getByText('Compute')).toBeInTheDocument();
      expect(screen.getByText('Serverless')).toBeInTheDocument();
    });
  });
});
