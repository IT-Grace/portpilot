import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectGallery from "@/components/ui/ProjectGallery";
import { ExternalLink, GitFork, Github, Star } from "lucide-react";

interface ProjectDetailModalProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    summary?: string | null;
    detailedDescription?: string | null;
    features?: string[];
    images?: Array<{ url: string; alt: string }>;
    languages: Record<string, number>;
    topics: string[];
    stars: number;
    forks: number;
    repoUrl?: string;
    homepage?: string | null;
    stack?: any;
  };
  children: React.ReactNode;
}

export function ProjectDetailModal({
  project,
  children,
}: ProjectDetailModalProps) {
  const topLanguages = Object.entries(project.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatDescription = (text?: string) => {
    if (!text) return null;
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {project.name}
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{project.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{project.forks}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            {project.summary ||
              project.description ||
              "No description available"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Images Gallery */}
          {project.images && project.images.length > 0 && (
            <ProjectGallery
              images={project.images}
              projectName={project.name}
              maxPreview={4}
            />
          )}

          {/* Detailed Description */}
          {project.detailedDescription && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Overview</h3>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
                {formatDescription(project.detailedDescription)}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            {topLanguages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Technologies</h3>
                <div className="space-y-2">
                  {topLanguages.map(([language, bytes]) => {
                    const percentage = Math.round(
                      (bytes /
                        Object.values(project.languages).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                        100
                    );
                    return (
                      <div
                        key={language}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{language}</span>
                        <span className="text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stack Details */}
            {project.stack && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Technical Stack</h3>
                <div className="space-y-2 text-sm">
                  {project.stack.framework && (
                    <div>
                      <span className="font-medium">Framework:</span>{" "}
                      {project.stack.framework}
                    </div>
                  )}
                  {project.stack.runtime && (
                    <div>
                      <span className="font-medium">Runtime:</span>{" "}
                      {project.stack.runtime}
                    </div>
                  )}
                  {project.stack.packageManager && (
                    <div>
                      <span className="font-medium">Package Manager:</span>{" "}
                      {project.stack.packageManager}
                    </div>
                  )}
                  {project.stack.database && (
                    <div>
                      <span className="font-medium">Database:</span>{" "}
                      {project.stack.database}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Topics */}
          {project.topics.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {project.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {project.repoUrl && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open(project.repoUrl, "_blank")}
              >
                <Github className="h-4 w-4" />
                View Code
              </Button>
            )}
            {project.homepage && (
              <Button
                className="gap-2"
                onClick={() => window.open(project.homepage!, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
