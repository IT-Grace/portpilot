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
  Globe,
} from "lucide-react";
import { SiX, SiLinkedin } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

export function SleekTheme({ data }: { data: PortfolioModel }) {
  const totalStars = data.projects.reduce((sum, p) => sum + p.stars, 0);
  const totalLanguages = Object.keys(
    data.projects.reduce((acc, p) => ({ ...acc, ...p.languages }), {})
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
          style={{
            background: data.layout.accentColor
              ? `linear-gradient(to bottom right, ${data.layout.accentColor}15, hsl(var(--background)), hsl(var(--background)))`
              : undefined,
          }}
        />

        <div className="relative">
          {/* Navigation */}
          <nav className="border-b border-border backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">{data.user.name}</span>
              </div>
              <ThemeToggle />
            </div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                <AvatarImage src={data.user.avatarUrl || undefined} alt={data.user.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-5xl font-semibold">
                  {data.user.name?.[0] || data.user.handle?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left space-y-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">{data.user.name}</h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    {data.user.bio}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground justify-center md:justify-start">
                  {data.user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{data.user.location}</span>
                    </div>
                  )}
                  {data.user.website && (
                    <a
                      href={data.user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </div>

                {data.layout.showStats && (
                  <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                    <div>
                      <div className="text-3xl font-bold">{data.projects.length}</div>
                      <div className="text-sm text-muted-foreground">Projects</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{totalStars}</div>
                      <div className="text-sm text-muted-foreground">Total Stars</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{totalLanguages.length}</div>
                      <div className="text-sm text-muted-foreground">Languages</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  {data.social.github && (
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => window.open(data.social.github, "_blank")}
                      data-testid="button-github"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  )}
                  {data.social.x && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(data.social.x, "_blank")}
                      data-testid="button-x"
                    >
                      <SiX className="h-4 w-4" />
                    </Button>
                  )}
                  {data.social.linkedin && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(data.social.linkedin, "_blank")}
                      data-testid="button-linkedin"
                    >
                      <SiLinkedin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold mb-12">Featured Projects</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.projects.map((project) => {
            const topLanguage = Object.entries(project.languages).sort(
              ([, a], [, b]) => b - a
            )[0];

            return (
              <Card key={project.id} className="overflow-hidden hover-elevate transition-all group">
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
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {project.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  {data.layout.showStats && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      {topLanguage && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span>{topLanguage[0]}</span>
                        </div>
                      )}
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
                      data-testid={`button-code-${project.id}`}
                    >
                      <Github className="h-4 w-4" />
                      Code
                    </Button>
                    {project.homepage && (
                      <Button
                        variant="default"
                        className="flex-1 gap-2"
                        onClick={() => window.open(project.homepage!, "_blank")}
                        data-testid={`button-demo-${project.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Demo
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
      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {data.user.name}. Powered by PortPilot.
            </div>
            <div className="flex items-center gap-4">
              {data.social.github && (
                <a
                  href={data.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-github"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {data.social.x && (
                <a
                  href={data.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-x"
                >
                  <SiX className="h-5 w-5" />
                </a>
              )}
              {data.social.linkedin && (
                <a
                  href={data.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-linkedin"
                >
                  <SiLinkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
