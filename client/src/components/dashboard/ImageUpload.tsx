import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileImage, Image, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface ProjectImage {
  url: string;
  alt: string;
  filename?: string;
}

interface ImageUploadProps {
  projectId: string;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
}

export default function ImageUpload({
  projectId,
  images,
  onImagesChange,
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)"
        );
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setAltText(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for default alt text
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("alt", altText.trim() || selectedFile.name);

      const response = await fetch(`/api/projects/${projectId}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      onImagesChange(data.project.images || []);
      setSelectedFile(null);
      setAltText("");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/images/${index}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove image");
      }

      const data = await response.json();
      onImagesChange(data.project.images || []);
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Project Gallery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload new image */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Select Image File
              <span className="text-xs text-muted-foreground ml-1">
                (Max 5MB)
              </span>
            </label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {selectedFile && (
            <>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <FileImage className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Alt text (optional)
                </label>
                <Input
                  placeholder="Describe the image"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
            </>
          )}

          <Button
            onClick={handleUploadImage}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        {/* Existing images */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Current Images
              <Badge variant="secondary">{images.length}</Badge>
            </h4>
            <div className="grid gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMS4zMzMzIDI2LjY2NjdMMzIgMzcuMzMzM0w0Mi42NjY3IDI2LjY2NjdWNDIuNjY2N0gyMS4zMzMzVjI2LjY2NjdaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIyNi42NjY3IiBjeT0iMzIiIHI9IjIuNjY2NjciIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {image.alt || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {image.url}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No images added yet</p>
            <p className="text-sm">
              Add image URLs to create a project gallery
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
