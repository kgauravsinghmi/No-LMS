import { dbClient } from '../db/supabaseClient';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  url: string;
  cdnUrl: string;
  fileName: string;
  sizeKb: number;
  originalSizeKb: number;
  dimensions?: string;
  type: string;
  isSvg: boolean;
  storageProvider: 'supabase' | 's3' | 'local_base64';
  uploadedAt: string;
}

export interface StoredMediaAsset {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
  type: string;
  uploadedAt: string;
  dimensions?: string;
}

const MEDIA_ASSETS_KEY = 'luminary_media_assets_v1';
const DEFAULT_BUCKET = 'courses-media';

export class MediaStorageService {
  private bucket: string = DEFAULT_BUCKET;

  /**
   * Compresses a raster image (PNG, JPG, WebP) using off-screen HTML5 Canvas
   * Converts to efficient WebP while preserving SVG vector precision.
   */
  public async compressImage(
    file: File,
    options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
  ): Promise<{ dataUrl: string; sizeKb: number; width: number; height: number }> {
    const isSvg = file.type === 'image/svg+xml';
    const maxWidth = options.maxWidth || 1920;
    const maxHeight = options.maxHeight || 1080;
    const quality = options.quality ?? 0.85;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;

        if (isSvg) {
          resolve({
            dataUrl: rawDataUrl,
            sizeKb: Math.round(file.size / 1024),
            width: 800,
            height: 600
          });
          return;
        }

        const img = new Image();
        img.onload = () => {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              sizeKb: Math.round(file.size / 1024),
              width,
              height
            });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/webp', quality);
          const sizeKb = Math.round((compressed.length * 3) / 4 / 1024);

          resolve({
            dataUrl: compressed,
            sizeKb,
            width,
            height
          });
        };

        img.onerror = () => {
          resolve({
            dataUrl: rawDataUrl,
            sizeKb: Math.round(file.size / 1024),
            width: 800,
            height: 600
          });
        };

        img.src = rawDataUrl;
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads an asset directly to cloud storage (Supabase Storage bucket)
   * With automatic fallback to Base64 data URLs for offline or demo environments.
   */
  public async uploadAsset(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const bucket = options.bucket || this.bucket;
    const folder = options.folder || 'diagrams';
    const originalSizeKb = Math.round(file.size / 1024);
    const isSvg = file.type === 'image/svg+xml';

    options.onProgress?.(15);

    // 1. Perform canvas compression if enabled
    let uploadDataUrl: string;
    let finalSizeKb: number = originalSizeKb;
    let dimensions = '800 × 600 px';

    if (options.compress !== false && !isSvg) {
      const compressed = await this.compressImage(file, {
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        quality: options.quality
      });
      uploadDataUrl = compressed.dataUrl;
      finalSizeKb = compressed.sizeKb;
      dimensions = `${compressed.width} × ${compressed.height} px`;
    } else {
      uploadDataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target?.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    }

    options.onProgress?.(50);

    // 2. Cloud Storage upload if remote database is configured
    if (dbClient.isLiveDatabaseEnabled()) {
      try {
        const config = dbClient.getConfig();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${folder}/${Date.now()}_${cleanName}`;

        // Convert DataURL to Blob for standard multipart upload
        const response = await fetch(uploadDataUrl);
        const blob = await response.blob();

        options.onProgress?.(70);

        const uploadUrl = `${config.supabaseUrl}/storage/v1/object/${bucket}/${uniqueFileName}`;
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            apikey: config.supabaseAnonKey!,
            Authorization: `Bearer ${config.supabaseAnonKey}`,
            'Content-Type': isSvg ? 'image/svg+xml' : 'image/webp',
            'x-upsert': 'true'
          },
          body: blob
        });

        if (res.ok) {
          const publicCdnUrl = `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueFileName}`;
          options.onProgress?.(100);

          const result: UploadResult = {
            url: publicCdnUrl,
            cdnUrl: publicCdnUrl,
            fileName: file.name,
            sizeKb: finalSizeKb,
            originalSizeKb,
            dimensions,
            type: isSvg ? 'image/svg+xml' : 'image/webp',
            isSvg,
            storageProvider: 'supabase',
            uploadedAt: new Date().toISOString()
          };

          this.recordAsset(result);
          return result;
        }
      } catch (err) {
        console.warn('Remote cloud upload failed, using local Base64 fallback:', err);
      }
    }

    options.onProgress?.(100);

    // 3. Fallback: Base64 self-contained DataURL
    const fallbackResult: UploadResult = {
      url: uploadDataUrl,
      cdnUrl: uploadDataUrl,
      fileName: file.name,
      sizeKb: finalSizeKb,
      originalSizeKb,
      dimensions,
      type: isSvg ? 'image/svg+xml' : 'image/webp',
      isSvg,
      storageProvider: 'local_base64',
      uploadedAt: new Date().toISOString()
    };

    this.recordAsset(fallbackResult);
    return fallbackResult;
  }

  /**
   * Retrieves all historically uploaded media assets from client registry
   */
  public getMediaAssets(): StoredMediaAsset[] {
    try {
      const raw = localStorage.getItem(MEDIA_ASSETS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Records an asset in the media registry
   */
  public recordAsset(asset: UploadResult): void {
    try {
      const assets = this.getMediaAssets();
      const newEntry: StoredMediaAsset = {
        id: `asset-${Date.now()}`,
        name: asset.fileName,
        url: asset.url,
        sizeKb: asset.sizeKb,
        type: asset.type,
        dimensions: asset.dimensions,
        uploadedAt: asset.uploadedAt
      };
      const updated = [newEntry, ...assets.filter((a) => a.url !== asset.url)].slice(0, 50);
      localStorage.setItem(MEDIA_ASSETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to record media asset:', e);
    }
  }

  /**
   * Deletes an asset from the media registry
   */
  public deleteAsset(assetId: string): void {
    try {
      const assets = this.getMediaAssets();
      const filtered = assets.filter((a) => a.id !== assetId);
      localStorage.setItem(MEDIA_ASSETS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete media asset:', e);
    }
  }
}

export const mediaStorageService = new MediaStorageService();
