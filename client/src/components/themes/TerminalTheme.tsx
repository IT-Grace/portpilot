import { useState, useEffect } from "react";
import type { PortfolioModel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TerminalTheme({ data }: { data: PortfolioModel }) {
  const [typedText, setTypedText] = useState("");
  const fullText = `> Initializing portfolio for ${data.user.name}...\n> Loading ${data.projects.length} projects...\n> Ready.`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 md:p-8">
      {/* Terminal Window */}
      <div className="max-w-6xl mx-auto">
        {/* Window Title Bar */}
        <div className="bg-gray-800 rounded-t-lg px-4 py-2 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-sm ml-4">
            {data.user.handle}@portpilot:~
          </span>
        </div>

        {/* Terminal Content */}
        <div className="bg-gray-900 rounded-b-lg p-6 md:p-8 min-h-[600px]">
          {/* Typing Animation */}
          <div className="mb-8 whitespace-pre-wrap">
            {typedText}
            <span className="animate-pulse">_</span>
          </div>

          {/* User Info */}
          <div className="mb-8 space-y-2">
            <div className="text-white">
              <span className="text-green-400">$</span> cat ~/.portfolio/user.txt
            </div>
            <div className="pl-4 space-y-1">
              <div>NAME: {data.user.name}</div>
              <div>HANDLE: @{data.user.handle}</div>
              {data.user.location && <div>LOCATION: {data.user.location}</div>}
              {data.user.website && (
                <div>
                  WEBSITE: <a href={data.user.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{data.user.website}</a>
                </div>
              )}
              {data.user.bio && (
                <div className="mt-2">
                  BIO: {data.user.bio}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {data.layout.showStats && (
            <div className="mb-8 space-y-2">
              <div className="text-white">
                <span className="text-green-400">$</span> git stats --summary
              </div>
              <div className="pl-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-white font-bold text-2xl">{data.projects.length}</div>
                  <div className="text-sm">Projects</div>
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {data.projects.reduce((sum, p) => sum + p.stars, 0)}
                  </div>
                  <div className="text-sm">Stars</div>
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {data.projects.reduce((sum, p) => sum + p.forks, 0)}
                  </div>
                  <div className="text-sm">Forks</div>
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {Object.keys(
                      data.projects.reduce((acc, p) => ({ ...acc, ...p.languages }), {})
                    ).length}
                  </div>
                  <div className="text-sm">Languages</div>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="mb-8 space-y-2">
            <div className="text-white">
              <span className="text-green-400">$</span> ls -la ~/projects/
            </div>
            <div className="pl-4">
              <div className="mb-2 text-gray-500">
                total {data.projects.length}
              </div>
              {data.projects.map((project, index) => (
                <div key={project.id} className="mb-1">
                  drwxr-xr-x {index + 1} user staff{" "}
                  {project.lastUpdated
                    ? formatDistanceToNow(project.lastUpdated, { addSuffix: true })
                    : "unknown"}{" "}
                  <span className="text-cyan-400">{project.name}/</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          {data.projects.map((project, index) => {
            const topLanguages = Object.entries(project.languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([lang]) => lang);

            return (
              <div key={project.id} className="mb-12">
                <div className="text-white mb-4">
                  <span className="text-green-400">$</span> cat ~/projects/{project.name}/README.md
                </div>
                <div className="pl-4 space-y-4">
                  {/* Project Header */}
                  <div className="border border-green-400 p-4 rounded bg-black/50">
                    <h3 className="text-white text-xl font-bold mb-2">{project.name}</h3>
                    <p className="text-gray-300 mb-4">{project.description}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      {topLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="bg-transparent border-green-400 text-green-400"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    {/* Features */}
                    {project.features.length > 0 && (
                      <div className="mb-4">
                        <div className="text-white mb-2">## Features</div>
                        <ul className="space-y-1">
                          {project.features.map((feature, i) => (
                            <li key={i}>- {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Topics */}
                    {project.topics.length > 0 && (
                      <div className="mb-4">
                        <div className="text-white mb-2">## Topics</div>
                        <div className="flex flex-wrap gap-2">
                          {project.topics.map((topic) => (
                            <span key={topic} className="text-cyan-400">#{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {data.layout.showStats && (
                      <div className="flex gap-6 text-sm mb-4">
                        <div>★ {project.stars} stars</div>
                        <div>⎇ {project.forks} forks</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => window.open(project.repoUrl, "_blank")}
                        className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
                        data-testid={`button-repo-${index}`}
                      >
                        <Github className="inline h-4 w-4 mr-2" />
                        View Repository
                      </button>
                      {project.homepage && (
                        <button
                          onClick={() => window.open(project.homepage!, "_blank")}
                          className="px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors rounded"
                          data-testid={`button-demo-${index}`}
                        >
                          <ExternalLink className="inline h-4 w-4 mr-2" />
                          Live Demo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Social Links */}
          <div className="mt-12 space-y-2">
            <div className="text-white">
              <span className="text-green-400">$</span> cat ~/.social
            </div>
            <div className="pl-4 space-y-1">
              {data.social.github && (
                <div>
                  GITHUB:{" "}
                  <a
                    href={data.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                    data-testid="social-github"
                  >
                    {data.social.github}
                  </a>
                </div>
              )}
              {data.social.x && (
                <div>
                  X:{" "}
                  <a
                    href={data.social.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                    data-testid="social-x"
                  >
                    {data.social.x}
                  </a>
                </div>
              )}
              {data.social.linkedin && (
                <div>
                  LINKEDIN:{" "}
                  <a
                    href={data.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                    data-testid="social-linkedin"
                  >
                    {data.social.linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-green-400/30">
            <div className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} {data.user.name} | Powered by PortPilot
            </div>
            <div className="text-center mt-4">
              <span className="text-green-400 animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
