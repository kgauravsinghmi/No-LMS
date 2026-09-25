import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  ExternalLink,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  AlertCircle
} from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, caption, className }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const handleOpen = () => {
    setZoom(1);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setZoom(1);
  };

  return (
    <figure className={`my-8 group relative ${className || ''}`}>
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-2 sm:p-3 shadow-md transition-all hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 overflow-hidden">

        {/* Top Header Bar with Actions */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
              {caption || alt || 'Diagram Reference'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleOpen}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title="Inspect in Fullscreen Lightbox"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Image Container with Fallback */}
        <div
          onClick={handleOpen}
          className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[550px] cursor-zoom-in group/img"
        >
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/60 animate-pulse text-slate-400">
              <ImageIcon className="w-8 h-8 opacity-40" />
              <span className="text-xs font-mono">Loading reference visual...</span>
            </div>
          )}

          {hasError ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-8 h-8 text-amber-500 opacity-80" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {alt || 'Visual Diagram Reference'}
              </p>
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                {src}
              </span>
            </div>
          ) : (
            <img
              src={src}
              alt={alt || caption || 'Diagram Image'}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-auto max-h-[520px] object-contain rounded-xl transition-all duration-300 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
              } group-hover/img:scale-[1.01]`}
              loading="lazy"
            />
          )}

          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-lg">
              <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom & Inspect
            </span>
          </div>
        </div>

      </div>

      {/* Caption footer */}
      {(caption || alt) && (
        <figcaption className="mt-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>{caption || alt}</span>
        </figcaption>
      )}

      {/* LIGHTBOX MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in">

          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold truncate max-w-md font-display">
                {caption || alt || 'Diagram Reference Inspection'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 py-0.5 bg-white/10 rounded-md">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition-colors ml-2 cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Zoomed Image Canvas */}
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
            className="flex-1 w-full flex items-center justify-center p-4 overflow-auto cursor-zoom-out"
          >
            <img
              src={src}
              alt={alt || caption || 'Diagram preview'}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200 cursor-default"
            />
          </div>

          {/* Bottom Bar Info */}
          <div className="text-center text-xs text-slate-400 py-1">
            <span>Scroll or use zoom controls to inspect high-resolution architecture details &bull; Press Esc or click outside to exit</span>
          </div>

        </div>
      )}

    </figure>
  );
};
