import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type ReaderTab = 'content' | 'mindmap' | 'notes';

interface UIState {
  // Zen Mode (Distraction-free Writing & Reading)
  isZenMode: boolean;
  toggleZenMode: () => void;
  setZenMode: (enabled: boolean) => void;

  // Editor Layout State (Three-Column Studio)
  editorOutlineCollapsed: boolean;
  editorPreviewCollapsed: boolean;
  editorOutlineWidth: number;
  editorPreviewDevice: PreviewDevice;
  editorSyncScroll: boolean;
  toggleEditorOutline: () => void;
  toggleEditorPreview: () => void;
  setEditorOutlineWidth: (width: number) => void;
  setEditorPreviewDevice: (device: PreviewDevice) => void;
  setEditorSyncScroll: (enabled: boolean) => void;

  // Reader Preferences & Zoom
  readerZoom: number; // 75 - 150 (%)
  readerFontSize: ReaderFontSize;
  activeReaderTab: ReaderTab;
  setReaderZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setReaderFontSize: (size: ReaderFontSize) => void;
  setActiveReaderTab: (tab: ReaderTab) => void;

  // Theme & Navigation Modals
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Zen Mode
      isZenMode: false,
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      setZenMode: (enabled) => set({ isZenMode: enabled }),

      // Editor Layout
      editorOutlineCollapsed: false,
      editorPreviewCollapsed: false,
      editorOutlineWidth: 260,
      editorPreviewDevice: 'desktop',
      editorSyncScroll: true,
      toggleEditorOutline: () => set((state) => ({ editorOutlineCollapsed: !state.editorOutlineCollapsed })),
      toggleEditorPreview: () => set((state) => ({ editorPreviewCollapsed: !state.editorPreviewCollapsed })),
      setEditorOutlineWidth: (width) => set({ editorOutlineWidth: Math.max(180, Math.min(width, 420)) }),
      setEditorPreviewDevice: (device) => set({ editorPreviewDevice: device }),
      setEditorSyncScroll: (enabled) => set({ editorSyncScroll: enabled }),

      // Reader Preferences
      readerZoom: 100,
      readerFontSize: 'base',
      activeReaderTab: 'content',
      setReaderZoom: (zoom) => set({ readerZoom: Math.max(75, Math.min(zoom, 150)) }),
      zoomIn: () => set((state) => ({ readerZoom: Math.min(state.readerZoom + 10, 150) })),
      zoomOut: () => set((state) => ({ readerZoom: Math.max(state.readerZoom - 10, 75) })),
      resetZoom: () => set({ readerZoom: 100 }),
      setReaderFontSize: (size) => set({ readerFontSize: size }),
      setActiveReaderTab: (tab) => set({ activeReaderTab: tab }),

      // Theme & Modals
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (enabled) => set({ isDarkMode: enabled }),
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'luminary_ui_preferences_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        editorOutlineCollapsed: state.editorOutlineCollapsed,
        editorPreviewCollapsed: state.editorPreviewCollapsed,
        editorOutlineWidth: state.editorOutlineWidth,
        editorPreviewDevice: state.editorPreviewDevice,
        editorSyncScroll: state.editorSyncScroll,
        readerZoom: state.readerZoom,
        readerFontSize: state.readerFontSize,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
