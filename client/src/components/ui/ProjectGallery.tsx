import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { Expand, Eye, Images } from "lucide-react";
import { useState } from "react";

interface ProjectImage {
  url: string;
  alt: string;
  filename?: string;
}

interface ProjectGalleryProps {
  images: ProjectImage[];
  projectName?: string;
  className?: string;
  showCount?: boolean;
  maxPreview?: number;
}

export default function ProjectGallery({
  images,
  projectName = "Project",
  className = "",
  showCount = true,
  maxPreview = 6,
}: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Card className={`p-8 text-center border-dashed ${className}`}>
        <Images className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">No images available</p>
      </Card>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const previewImages = images.slice(0, maxPreview);
  const remainingCount = Math.max(0, images.length - maxPreview);

  return (
    <>
      <div className={className}>
        {/* Header */}
        {showCount && (
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Images className="h-4 w-4" />
              Screenshots
            </h4>
            <Badge variant="secondary">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previewImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDAgNzVMMTYwIDk1TDE4MCA3NVYxMDVIMTQwVjc1WiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iODUiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTYwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>

              {/* Image number badge */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge
                  variant="secondary"
                  className="text-xs bg-black/60 text-white border-0"
                >
                  {index + 1}
                </Badge>
              </div>
            </div>
          ))}

          {/* Show more button if there are remaining images */}
          {remainingCount > 0 && (
            <div
              className="aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2"
              onClick={() => openLightbox(maxPreview)}
            >
              <Expand className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                +{remainingCount} more
              </span>
            </div>
          )}
        </div>

        {/* View all button for single row */}
        {images.length > 3 && (
          <Button
            variant="outline"
            onClick={() => openLightbox(0)}
            className="w-full mt-3 gap-2"
          >
            <Images className="h-4 w-4" />
            View All {images.length} Screenshots
          </Button>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
