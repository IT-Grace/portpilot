import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProjectImage {
  url: string;
  alt: string;
  filename?: string;
}

interface ImageLightboxProps {
  images: ProjectImage[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({
  images,
  isOpen,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "z":
        case "Z":
          e.preventDefault();
          setIsZoomed(!isZoomed);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, isZoomed]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const currentImage = images[currentIndex];
    if (currentImage.url.startsWith("/uploads/")) {
      // For uploaded files, trigger download
      const link = document.createElement("a");
      link.href = currentImage.url;
      link.download = currentImage.filename || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For external URLs, open in new tab
      window.open(currentImage.url, "_blank");
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-white/20"
          >
            {currentIndex + 1} of {images.length}
          </Badge>
          {currentImage.alt && (
            <span className="text-white text-sm font-medium max-w-md truncate">
              {currentImage.alt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsZoomed(!isZoomed)}
            className="text-white hover:bg-white/20"
          >
            {isZoomed ? (
              <ZoomOut className="h-4 w-4" />
            ) : (
              <ZoomIn className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            isZoomed
              ? "cursor-zoom-out scale-150 md:scale-200"
              : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1TDIwMCAxNTBMMjI1IDEyNVYxNzVIMTc1VjEyNVoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE4NSIgY3k9IjE0MCIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPHN2Zz4=";
          }}
        />
      </div>

      {/* Thumbnail strip at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2 p-2 bg-black/40 rounded-lg backdrop-blur-sm max-w-[80vw] overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                  index === currentIndex
                    ? "border-white scale-110"
                    : "border-white/30 hover:border-white/60"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 text-white/60 text-xs text-center hidden md:block">
        <p>Use arrow keys to navigate • Z to zoom • ESC to close</p>
      </div>
    </div>
  );
}
