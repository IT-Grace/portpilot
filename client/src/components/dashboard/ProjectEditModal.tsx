import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Code, Save, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import ImageUpload from "./ImageUpload";

interface ProjectEditModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: any) => void;
}

export default function ProjectEditModal({
  project,
  isOpen,
  onClose,
  onUpdate,
}: ProjectEditModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    detailedDescription: "",
    features: [] as string[],
    technologies: [] as string[],
    images: [] as Array<{ url: string; alt: string }>,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newTechnology, setNewTechnology] = useState("");

  // Check if project has been analyzed
  const isAnalyzed = project?.analyzed || false;

  // Check if project needs re-analysis
  const needsReAnalysis = () => {
    if (!isAnalyzed || !project?.lastAnalyzed) return false;

    const lastAnalyzed =
      project.lastAnalyzed instanceof Date
        ? project.lastAnalyzed
        : new Date(project.lastAnalyzed);
    const lastUpdated =
      project.lastUpdated instanceof Date
        ? project.lastUpdated
        : new Date(project.lastUpdated);

    // Needs re-analysis if repo was updated after it was analyzed
    return lastUpdated > lastAnalyzed;
  };

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        detailedDescription: project.detailedDescription || "",
        features: project.features || [],
        technologies: project.technologies || [],
        images: project.images || [],
      });
    }
  }, [project]);

  const handleAnalyze = async () => {
    if (!project?.id) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/analyze`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze project");
      }

      const data = await response.json();
      if (data.project) {
        setFormData((prev) => ({
          ...prev,
          description: data.project.description || prev.description,
          detailedDescription:
            data.project.detailedDescription || prev.detailedDescription,
          features: data.project.features || prev.features,
          technologies: data.project.technologies || prev.technologies,
        }));
      }
    } catch (error) {
      console.error("Error analyzing project:", error);
      alert("Failed to analyze project. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!project?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          detailedDescription: formData.detailedDescription,
          features: formData.features,
          technologies: formData.technologies,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const data = await response.json();
      onUpdate(data.project);
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addTechnology = () => {
    if (
      newTechnology.trim() &&
      !formData.technologies.includes(newTechnology.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()],
      }));
      setNewTechnology("");
    }
  };

  const removeTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const handleImagesChange = (
    newImages: Array<{ url: string; alt: string }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Edit Project: {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {needsReAnalysis() && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Repository Updated:</strong> This project has been
                updated since the last AI analysis. Consider re-enhancing to get
                the latest insights and features.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (isAnalyzed && !needsReAnalysis())}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing
                ? "Analyzing..."
                : needsReAnalysis()
                ? "Re-enhance"
                : isAnalyzed
                ? "AI Enhanced"
                : "AI Enhance"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Features & Tech</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Project Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Short Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your project"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Detailed Description
                </label>
                <Textarea
                  value={formData.detailedDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detailedDescription: e.target.value,
                    }))
                  }
                  placeholder="Comprehensive project description with technical details"
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === "Enter" && addFeature()}
                    />
                    <Button onClick={addFeature} variant="outline">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {feature}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeFeature(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technologies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      placeholder="Add a technology"
                      onKeyPress={(e) => e.key === "Enter" && addTechnology()}
                    />
                    <Button onClick={addTechnology} variant="outline">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {tech}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTechnology(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery">
              <ImageUpload
                projectId={project.id}
                images={formData.images}
                onImagesChange={handleImagesChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
