import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mediaStorageService } from '../mediaStorageService';

describe('MediaStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Asset registry management', () => {
    it('initializes with an empty asset registry', () => {
      const assets = mediaStorageService.getMediaAssets();
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBe(0);
    });

    it('records and retrieves uploaded assets in localStorage', () => {
      mediaStorageService.recordAsset({
        url: 'data:image/webp;base64,sample123',
        cdnUrl: 'https://cdn.luminary.internal/storage/v1/object/public/courses-media/diag1.webp',
        fileName: 'architecture_diagram.webp',
        sizeKb: 42,
        originalSizeKb: 180,
        dimensions: '1200 × 800 px',
        type: 'image/webp',
        isSvg: false,
        storageProvider: 'local_base64',
        uploadedAt: new Date().toISOString()
      });

      const assets = mediaStorageService.getMediaAssets();
      expect(assets.length).toBe(1);
      expect(assets[0].name).toBe('architecture_diagram.webp');
      expect(assets[0].sizeKb).toBe(42);
    });

    it('deletes an asset from the local registry', () => {
      mediaStorageService.recordAsset({
        url: 'data:image/svg+xml;base64,sampleSvg',
        cdnUrl: 'https://cdn.luminary.internal/storage/v1/object/public/courses-media/vector.svg',
        fileName: 'system_flow.svg',
        sizeKb: 15,
        originalSizeKb: 15,
        type: 'image/svg+xml',
        isSvg: true,
        storageProvider: 'local_base64',
        uploadedAt: new Date().toISOString()
      });

      const assetsBefore = mediaStorageService.getMediaAssets();
      expect(assetsBefore.length).toBe(1);

      mediaStorageService.deleteAsset(assetsBefore[0].id);
      const assetsAfter = mediaStorageService.getMediaAssets();
      expect(assetsAfter.length).toBe(0);
    });
  });

  describe('uploadAsset fallback', () => {
    it('handles SVG uploads without raster compression', async () => {
      const svgContent = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>';
      const svgFile = new File([svgContent], 'circle.svg', { type: 'image/svg+xml' });

      const result = await mediaStorageService.uploadAsset(svgFile);

      expect(result.isSvg).toBe(true);
      expect(result.fileName).toBe('circle.svg');
      expect(result.storageProvider).toBe('local_base64');
      expect(result.url).toContain('data:image/svg+xml');
    });
  });
});
