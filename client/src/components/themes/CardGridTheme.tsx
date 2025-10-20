import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HoverImageSlider from "@/components/ui/HoverImageSlider";
import ProjectGallery from "@/components/ui/ProjectGallery";
import type { PortfolioModel } from "@shared/schema";
import {
  ExternalLink,
  GitFork,
  Github,
  Link as LinkIcon,
  MapPin,
  Star,
} from "lucide-react";
import { useState } from "react";
import { SiLinkedin, SiX } from "react-icons/si";

export function CardGridTheme({ data }: { data: PortfolioModel }) {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const formatDescription = (text?: string) => {
    if (!text) return null;
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage
                  src={data.user.avatarUrl || undefined}
                  alt={data.user.name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {data.user.name?.[0] || data.user.handle?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{data.user.name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  {data.user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{data.user.location}</span>
                    </div>
                  )}
                  {data.user.website && (
                    <a
                      href={data.user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {data.social.github && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(data.social.github, "_blank")}
                  data-testid="header-github"
                >
                  <Github className="h-4 w-4" />
                </Button>
              )}
              {data.social.x && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(data.social.x, "_blank")}
                  data-testid="header-x"
                >
                  <SiX className="h-4 w-4" />
                </Button>
              )}
              {data.social.linkedin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(data.social.linkedin, "_blank")}
                  data-testid="header-linkedin"
                >
                  <SiLinkedin className="h-4 w-4" />
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {data.user.bio && (
            <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">
              {data.user.bio}
            </p>
          )}
        </div>
      </header>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.projects.map((project) => {
            const languageEntries = Object.entries(project.languages).sort(
              ([, a], [, b]) => b - a
            );
            const totalBytes = languageEntries.reduce(
              (sum, [, bytes]) => sum + bytes,
              0
            );

            return (
              <Card
                key={project.id}
                className="break-inside-avoid hover-elevate transition-all group overflow-hidden"
              >
                {/* Project Image Slider */}
                {project.images && project.images.length > 0 && (
                  <HoverImageSlider
                    images={project.images}
                    intervalMs={2500}
                    aspectRatio="aspect-video"
                    onClick={() => setSelectedProject(project)}
                  />
                )}

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">
                      {project.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.summary || project.description}
                    </p>
                  </div>

                  {/* Features */}
                  {project.features && project.features.length > 0 && (
                    <ul className="space-y-1.5 text-sm">
                      {project.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {project.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Language Breakdown */}
                  {data.layout.showStats && languageEntries.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        {languageEntries.slice(0, 3).map(([lang, bytes]) => (
                          <div
                            key={lang}
                            className="bg-primary"
                            style={{
                              width: `${(bytes / totalBytes) * 100}%`,
                              opacity: 0.6 + (bytes / totalBytes) * 0.4,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {languageEntries.slice(0, 3).map(([lang, bytes]) => (
                          <div key={lang} className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span>{lang}</span>
                            <span>
                              {Math.round((bytes / totalBytes) * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {data.layout.showStats && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-4 w-4" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => window.open(project.repoUrl, "_blank")}
                      data-testid={`button-view-${project.id}`}
                    >
                      <Github className="h-4 w-4" />
                      View Code
                    </Button>
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => setSelectedProject(project)}
                      data-testid={`button-details-${project.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {data.user.name}. Powered by PortPilot.
          </p>
        </div>
      </footer>

      {/* Project Detail Modal */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">
                  {selectedProject.name}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProject.topics?.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {selectedProject.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <div className="prose prose-sm max-w-none">
                      {formatDescription(selectedProject.description)}
                    </div>
                  </div>
                )}

                {selectedProject.features &&
                  selectedProject.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Key Features
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedProject.features.map(
                          (feature: string, index: number) => (
                            <li key={index} className="text-sm">
                              {feature}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedProject.technologies &&
                  selectedProject.technologies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech: string) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedProject.images &&
                  selectedProject.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Gallery</h3>
                      <ProjectGallery images={selectedProject.images} />
                    </div>
                  )}

                <div className="flex gap-4 pt-4">
                  {selectedProject.repoUrl && (
                    <Button asChild variant="outline">
                      <a
                        href={selectedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View Source
                      </a>
                    </Button>
                  )}
                  {selectedProject.liveUrl && (
                    <Button asChild>
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
