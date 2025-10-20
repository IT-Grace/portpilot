import { useEffect, useRef, useState } from "react";

interface ProjectImage {
  url: string;
  alt: string;
  filename?: string;
}

interface HoverImageSliderProps {
  images: ProjectImage[];
  className?: string;
  intervalMs?: number;
  aspectRatio?: string;
  onClick?: () => void;
}

export default function HoverImageSlider({
  images,
  className = "",
  intervalMs = 2000,
  aspectRatio = "aspect-video",
  onClick,
}: HoverImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Only show slider if we have multiple images
  if (!images || images.length <= 1) {
    const singleImage = images?.[0];
    return (
      <div
        className={`${aspectRatio} overflow-hidden bg-muted ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
        onClick={onClick}
      >
        {singleImage ? (
          <img
            src={singleImage.url}
            alt={singleImage.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDAgNzVMMTYwIDk1TDE4MCA3NVYxMDVIMTQwVjc1WiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iODUiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTYwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==";
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No image</div>
          </div>
        )}
      </div>
    );
  }

  // Auto-advance images on hover
  useEffect(() => {
    if (isHovering) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to first image when not hovering
      setCurrentIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, images.length, intervalMs]);

  return (
    <div
      className={`${aspectRatio} overflow-hidden bg-muted relative ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      {/* Main image */}
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt}
        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDAgNzVMMTYwIDk1TDE4MCA3NVYxMDVIMTQwVjc1WiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iODUiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTYwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==";
        }}
      />

      {/* Progress indicators */}
      {isHovering && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-white" : "w-1 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image count badge */}
      {!isHovering && images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full transition-opacity duration-300">
          {images.length} photos
        </div>
      )}

      {/* Hover instruction (subtle) */}
      {!isHovering && images.length > 1 && onClick && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            Hover to preview • Click for details
          </div>
        </div>
      )}
    </div>
  );
}
