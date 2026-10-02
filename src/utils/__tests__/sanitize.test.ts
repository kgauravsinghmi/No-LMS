import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeSvg, sanitizeUrl } from '../sanitize';

describe('Sanitization & XSS Prevention Engine', () => {
  describe('sanitizeUrl', () => {
    it('allows valid HTTPS and HTTP URLs', () => {
      expect(sanitizeUrl('https://luminary.dev/docs')).toBe('https://luminary.dev/docs');
      expect(sanitizeUrl('http://example.com/asset.png')).toBe('http://example.com/asset.png');
    });

    it('allows valid mailto and relative paths', () => {
      expect(sanitizeUrl('mailto:learner@luminary.dev')).toBe('mailto:learner@luminary.dev');
      expect(sanitizeUrl('/courses/react-architecture')).toBe('/courses/react-architecture');
      expect(sanitizeUrl('./overview')).toBe('./overview');
      expect(sanitizeUrl('#section-2')).toBe('#section-2');
    });

    it('allows safe base64 image data URIs', () => {
      const safeDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(sanitizeUrl(safeDataUri)).toBe(safeDataUri);
    });

    it('blocks dangerous javascript: pseudo-protocols', () => {
      expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('#');
      expect(sanitizeUrl('JAVASCRIPT:console.log(1)')).toBe('#');
      expect(sanitizeUrl('javascript :alert(1)')).toBe('#');
    });

    it('blocks dangerous data: text/html and executable schemes', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('#');
      expect(sanitizeUrl('vbscript:msgbox("hello")')).toBe('#');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    it('handles null, undefined, and empty inputs with fallback', () => {
      expect(sanitizeUrl(null)).toBe('#');
      expect(sanitizeUrl(undefined)).toBe('#');
      expect(sanitizeUrl('', '/fallback')).toBe('/fallback');
    });
  });

  describe('sanitizeHtml', () => {
    it('preserves legitimate formatting tags and callout elements', () => {
      const input = '<div class="callout callout-info"><p><strong>Note:</strong> Check <a href="https://example.com">documentation</a>.</p></div>';
      const output = sanitizeHtml(input);
      expect(output).toContain('div class="callout callout-info"');
      expect(output).toContain('<strong>Note:</strong>');
      expect(output).toContain('href="https://example.com"');
    });

    it('strips dangerous <script> tags and executable handlers', () => {
      const dirty = '<div>Hello <script>alert("hacked")</script><img src="x" onerror="alert(1)" /></div>';
      const output = sanitizeHtml(dirty);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert("hacked")');
      expect(output).not.toContain('onerror');
    });

    it('strips <iframe> and <object> embed elements', () => {
      const dirty = '<p>Normal text</p><iframe src="https://evil.site"></iframe><object data="bad.swf"></object>';
      const output = sanitizeHtml(dirty);
      expect(output).toContain('Normal text');
      expect(output).not.toContain('iframe');
      expect(output).not.toContain('object');
    });
  });

  describe('sanitizeSvg', () => {
    it('retains valid SVG geometry, paths, text and filters', () => {
      const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1"><stop offset="0%" stop-color="#4f46e5"/></linearGradient>
          </defs>
          <g transform="translate(10,10)">
            <rect x="0" y="0" width="80" height="40" fill="url(#grad1)" rx="4" />
            <text x="40" y="25" text-anchor="middle" fill="#ffffff">Architecture</text>
          </g>
        </svg>
      `;
      const clean = sanitizeSvg(svg);
      expect(clean).toContain('<svg');
      expect(clean).toContain('rect');
      expect(clean).toContain('text-anchor="middle"');
      expect(clean).toContain('Architecture');
    });

    it('strips embedded <script> tags inside SVG markup', () => {
      const dirtySvg = `
        <svg viewBox="0 0 100 100">
          <script>alert("SVG-XSS")</script>
          <circle cx="50" cy="50" r="40" fill="red" />
        </svg>
      `;
      const clean = sanitizeSvg(dirtySvg);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('SVG-XSS');
      expect(clean).toContain('<circle');
    });

    it('strips onload, onclick, and malicious event handlers from SVG elements', () => {
      const dirtySvg = '<svg><rect width="10" height="10" onclick="alert(1)" onload="fetch(\'/steal\')" /></svg>';
      const clean = sanitizeSvg(dirtySvg);
      expect(clean).not.toContain('onclick');
      expect(clean).not.toContain('onload');
      expect(clean).not.toContain('steal');
    });
  });
});
