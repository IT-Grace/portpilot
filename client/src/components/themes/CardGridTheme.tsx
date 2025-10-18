import type { PortfolioModel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Github,
  ExternalLink,
  Star,
  GitFork,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import { SiX, SiLinkedin } from "react-icons/si";

export function CardGridTheme({ data }: { data: PortfolioModel }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage src={data.user.avatarUrl || undefined} alt={data.user.name || "User"} />
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
            const totalBytes = languageEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

            return (
              <Card
                key={project.id}
                className="break-inside-avoid hover-elevate transition-all group overflow-hidden"
              >
                {/* Project Image */}
                {project.images[0] && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={project.images[0].url}
                      alt={project.images[0].alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{project.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Summary */}
                  {project.summary && (
                    <p className="text-sm leading-relaxed">{project.summary}</p>
                  )}

                  {/* Features */}
                  {project.features.length > 0 && (
                    <ul className="space-y-1.5 text-sm">
                      {project.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {project.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
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
                    {project.homepage && (
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => window.open(project.homepage!, "_blank")}
                        data-testid={`button-live-${project.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
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
    </div>
  );
}
