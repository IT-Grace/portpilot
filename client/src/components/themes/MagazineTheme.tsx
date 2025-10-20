import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function MagazineTheme({ data }: { data: PortfolioModel }) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const featuredProject = data.projects[0];

  const formatDescription = (description: string) => {
    if (!description) return null;

    return description.split("\n").map((line, index) => {
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow">
              <AvatarImage
                src={data.user.avatarUrl || undefined}
                alt={data.user.name || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {data.user.name?.[0] || data.user.handle?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-serif font-bold text-xl">
                {data.user.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Developer Portfolio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data.social.github && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(data.social.github, "_blank")}
                data-testid="nav-github"
              >
                <Github className="h-4 w-4" />
              </Button>
            )}
            {data.social.x && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(data.social.x, "_blank")}
                data-testid="nav-x"
              >
                <SiX className="h-4 w-4" />
              </Button>
            )}
            {data.social.linkedin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(data.social.linkedin, "_blank")}
                data-testid="nav-linkedin"
              >
                <SiLinkedin className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Featured Hero */}
      {featuredProject && (
        <section className="relative h-[80vh] overflow-hidden">
          {/* Hero Image */}
          {featuredProject.images[0] && (
            <div className="absolute inset-0">
              <img
                src={featuredProject.images[0].url}
                alt={featuredProject.images[0].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              {/* Image count indicator for featured */}
              {featuredProject.images.length > 1 && (
                <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full">
                  {featuredProject.images.length} screenshots
                </div>
              )}
            </div>
          )}

          {/* Hero Content */}
          <div className="relative h-full flex items-end">
            <div className="max-w-4xl mx-auto px-6 pb-16 w-full">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {featuredProject.topics.slice(0, 3).map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="backdrop-blur-sm"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
                <h1 className="font-serif font-bold text-5xl md:text-6xl leading-tight">
                  {featuredProject.name}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                  {featuredProject.summary || featuredProject.description}
                </p>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() =>
                      window.open(featuredProject.repoUrl, "_blank")
                    }
                    data-testid="hero-view-project"
                  >
                    View Project
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {featuredProject.homepage && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 backdrop-blur-sm"
                      onClick={() =>
                        window.open(featuredProject.homepage!, "_blank")
                      }
                      data-testid="hero-live-demo"
                    >
                      Live Demo
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif font-bold text-4xl mb-6">About</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.user.bio}
              </p>
              {(data.user.location || data.user.website) && (
                <div className="mt-6 space-y-2">
                  {data.user.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{data.user.location}</span>
                    </div>
                  )}
                  {data.user.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <a
                        href={data.user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors underline"
                      >
                        {data.user.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {data.layout.showStats && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-serif font-bold mb-2">
                    {data.projects.length}
                  </div>
                  <div className="text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-5xl font-serif font-bold mb-2">
                    {data.projects.reduce((sum, p) => sum + p.stars, 0)}
                  </div>
                  <div className="text-muted-foreground">Total Stars</div>
                </div>
                <div>
                  <div className="text-5xl font-serif font-bold mb-2">
                    {
                      Object.keys(
                        data.projects.reduce(
                          (acc, p) => ({ ...acc, ...p.languages }),
                          {}
                        )
                      ).length
                    }
                  </div>
                  <div className="text-muted-foreground">Languages</div>
                </div>
                <div>
                  <div className="text-5xl font-serif font-bold mb-2">
                    {data.projects.reduce((sum, p) => sum + p.forks, 0)}
                  </div>
                  <div className="text-muted-foreground">Total Forks</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects - Alternating Layout */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-32">
          {data.projects.slice(1).map((project, index) => {
            const isEven = index % 2 === 0;
            const topLanguages = Object.entries(project.languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3);

            return (
              <article
                key={project.id}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  !isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className={`${!isEven ? "md:order-2" : ""}`}>
                  {project.images && project.images.length > 0 ? (
                    <HoverImageSlider
                      images={project.images}
                      intervalMs={3000}
                      aspectRatio="aspect-[21/9]"
                      className="rounded-lg"
                      onClick={() => setSelectedProject(project)}
                    />
                  ) : (
                    <div className="aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
                      <Github className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`space-y-6 ${!isEven ? "md:order-1" : ""}`}>
                  <div>
                    <h3 className="font-serif font-bold text-3xl md:text-4xl mb-4">
                      {project.name}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {project.summary || project.description}
                    </p>
                  </div>

                  {/* Features as Pull Quote */}
                  {project.features.length > 0 && (
                    <div className="border-l-4 border-primary pl-6 italic text-lg">
                      {project.features[0]}
                    </div>
                  )}

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {project.topics.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  {data.layout.showStats && (
                    <div className="flex flex-wrap gap-6 text-sm">
                      {topLanguages.map(([lang]) => (
                        <div key={lang} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{lang}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GitFork className="h-4 w-4" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => window.open(project.repoUrl, "_blank")}
                      data-testid={`button-code-${index}`}
                    >
                      <Github className="h-4 w-4" />
                      View Code
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      data-testid={`button-details-${index}`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <h3 className="font-serif font-bold text-3xl">Let's Connect</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Interested in collaboration or have a project in mind? Let's build
              something amazing together.
            </p>
            <div className="flex items-center justify-center gap-4">
              {data.social.github && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(data.social.github, "_blank")}
                  data-testid="footer-github"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              )}
              {data.social.linkedin && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(data.social.linkedin, "_blank")}
                  data-testid="footer-linkedin"
                >
                  <SiLinkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              )}
            </div>
            <div className="pt-8 text-sm text-muted-foreground">
              © {new Date().getFullYear()} {data.user.name}. Powered by
              PortPilot.
            </div>
          </div>
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
