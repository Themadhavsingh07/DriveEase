import React, { useState, useEffect } from 'react';
import { CarImage } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Camera,
  Sparkles,
} from 'lucide-react';

interface VehicleGalleryProps {
  images: CarImage[];
  carTitle: string;
}

export const VehicleGallery: React.FC<VehicleGalleryProps> = ({
  images,
  carTitle,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'fallback',
            url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
            isPrimary: true,
            caption: carTitle,
          },
        ];

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, safeImages.length]);

  return (
    <div className="space-y-3">
      {/* Main Image Stage */}
      <div className="relative h-[340px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md group">
        <img
          src={currentImage.url}
          alt={currentImage.caption || carTitle}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102"
        />

        {/* Gradient Overlay on Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Caption & Counter Badge */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-medium">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[200px] sm:max-w-md">
              {currentImage.caption || carTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
              {selectedIndex + 1} / {safeImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/90 text-white transition-colors cursor-pointer"
              title="Expand Fullscreen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Left & Right Arrow Navigation */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 z-10"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 z-10"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {safeImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-24 sm:w-28 h-16 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? 'border-[#2563EB] ring-2 ring-blue-500/30 scale-[1.02]'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.caption || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-base font-bold">{carTitle}</h4>
              <p className="text-xs text-slate-400">
                Photo {selectedIndex + 1} of {safeImages.length} •{' '}
                {currentImage.caption}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Image with Nav Buttons */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-6xl mx-auto my-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <img
              src={currentImage.url}
              alt={currentImage.caption || carTitle}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
            />

            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="flex justify-center gap-2 overflow-x-auto py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {safeImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? 'border-blue-500 scale-105'
                    : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
