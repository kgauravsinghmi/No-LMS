import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore (Zustand Global State)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset to defaults
    useUIStore.setState({
      isZenMode: false,
      editorOutlineCollapsed: false,
      editorPreviewCollapsed: false,
      editorOutlineWidth: 260,
      editorPreviewDevice: 'desktop',
      editorSyncScroll: true,
      readerZoom: 100,
      readerFontSize: 'base',
      activeReaderTab: 'content',
      isDarkMode: false,
      activeModal: null,
    });
  });

  describe('Zen Mode', () => {
    it('toggles zen mode correctly', () => {
      expect(useUIStore.getState().isZenMode).toBe(false);
      useUIStore.getState().toggleZenMode();
      expect(useUIStore.getState().isZenMode).toBe(true);
      useUIStore.getState().toggleZenMode();
      expect(useUIStore.getState().isZenMode).toBe(false);
    });

    it('sets zen mode explicitly', () => {
      useUIStore.getState().setZenMode(true);
      expect(useUIStore.getState().isZenMode).toBe(true);
      useUIStore.getState().setZenMode(false);
      expect(useUIStore.getState().isZenMode).toBe(false);
    });
  });

  describe('Editor Layout & Device Simulation', () => {
    it('toggles editor outline and preview collapse states', () => {
      useUIStore.getState().toggleEditorOutline();
      expect(useUIStore.getState().editorOutlineCollapsed).toBe(true);

      useUIStore.getState().toggleEditorPreview();
      expect(useUIStore.getState().editorPreviewCollapsed).toBe(true);
    });

    it('clamps outline width between 180 and 420', () => {
      useUIStore.getState().setEditorOutlineWidth(100);
      expect(useUIStore.getState().editorOutlineWidth).toBe(180);

      useUIStore.getState().setEditorOutlineWidth(500);
      expect(useUIStore.getState().editorOutlineWidth).toBe(420);

      useUIStore.getState().setEditorOutlineWidth(320);
      expect(useUIStore.getState().editorOutlineWidth).toBe(320);
    });

    it('switches preview device between desktop, tablet, and mobile', () => {
      useUIStore.getState().setEditorPreviewDevice('tablet');
      expect(useUIStore.getState().editorPreviewDevice).toBe('tablet');

      useUIStore.getState().setEditorPreviewDevice('mobile');
      expect(useUIStore.getState().editorPreviewDevice).toBe('mobile');

      useUIStore.getState().setEditorPreviewDevice('desktop');
      expect(useUIStore.getState().editorPreviewDevice).toBe('desktop');
    });

    it('toggles editor sync scroll', () => {
      useUIStore.getState().setEditorSyncScroll(false);
      expect(useUIStore.getState().editorSyncScroll).toBe(false);
    });
  });

  describe('Reader Zoom & Font Scaling', () => {
    it('zooms in and out with bounds [75, 150]', () => {
      useUIStore.getState().resetZoom();
      expect(useUIStore.getState().readerZoom).toBe(100);

      useUIStore.getState().zoomIn();
      expect(useUIStore.getState().readerZoom).toBe(110);

      useUIStore.getState().setReaderZoom(160);
      expect(useUIStore.getState().readerZoom).toBe(150);

      useUIStore.getState().setReaderZoom(50);
      expect(useUIStore.getState().readerZoom).toBe(75);

      useUIStore.getState().resetZoom();
      expect(useUIStore.getState().readerZoom).toBe(100);
    });

    it('changes reader font size', () => {
      useUIStore.getState().setReaderFontSize('lg');
      expect(useUIStore.getState().readerFontSize).toBe('lg');

      useUIStore.getState().setReaderFontSize('xl');
      expect(useUIStore.getState().readerFontSize).toBe('xl');
    });
  });

  describe('Modal & Dark Mode State', () => {
    it('opens and closes modals', () => {
      useUIStore.getState().openModal('course-settings');
      expect(useUIStore.getState().activeModal).toBe('course-settings');

      useUIStore.getState().closeModal();
      expect(useUIStore.getState().activeModal).toBeNull();
    });

    it('toggles dark mode', () => {
      useUIStore.getState().toggleDarkMode();
      expect(useUIStore.getState().isDarkMode).toBe(true);

      useUIStore.getState().setDarkMode(false);
      expect(useUIStore.getState().isDarkMode).toBe(false);
    });
  });
});
