import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Github,
  Search,
  RefreshCw,
  Star,
  GitFork,
  Clock,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type MockRepo = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: Date;
  selected: boolean;
};

export function ReposTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);

  // TODO: Fetch from API
  const [repos, setRepos] = useState<MockRepo[]>([
    {
      id: "1",
      name: "awesome-react-dashboard",
      description: "A modern, feature-rich dashboard built with React and TypeScript",
      language: "TypeScript",
      stars: 24,
      forks: 5,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      selected: true,
    },
    {
      id: "2",
      name: "ecommerce-mobile-app",
      description: "Full-stack mobile e-commerce application with payment integration",
      language: "JavaScript",
      stars: 12,
      forks: 3,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      selected: true,
    },
    {
      id: "3",
      name: "cli-tools-collection",
      description: "Collection of useful command-line tools for developers",
      language: "Python",
      stars: 6,
      forks: 1,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      selected: true,
    },
    {
      id: "4",
      name: "portfolio-website",
      description: "My personal portfolio website",
      language: "HTML",
      stars: 3,
      forks: 0,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      selected: false,
    },
  ]);

  const lastSync = new Date(Date.now() - 1000 * 60 * 60 * 2);
  const selectedCount = repos.filter(r => r.selected).length;
  const maxProjects = 6; // TODO: Get from user plan

  const handleSync = async () => {
    setSyncing(true);
    // TODO: Call API to sync repos
    setTimeout(() => setSyncing(false), 2000);
  };

  const toggleRepo = (id: string) => {
    setRepos(prev =>
      prev.map(r =>
        r.id === id ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));

  const filteredRepos = repos
    .filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(r => languageFilter === "all" || r.language === languageFilter)
    .sort((a, b) => {
      if (sortBy === "stars") return b.stars - a.stars;
      if (sortBy === "updated") return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      return a.name.localeCompare(b.name);
    });

  const getLanguageColor = (lang: string | null) => {
    const colors: Record<string, string> = {
      TypeScript: "hsl(var(--chart-1))",
      JavaScript: "hsl(var(--chart-4))",
      Python: "hsl(var(--chart-2))",
      HTML: "hsl(var(--chart-5))",
    };
    return colors[lang || ""] || "hsl(var(--muted-foreground))";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Repositories</h1>
        <p className="text-muted-foreground text-lg">
          Select which repositories to feature in your portfolio
        </p>
      </div>

      {/* Sync Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>GitHub Sync</CardTitle>
            <CardDescription>
              Last synced {formatDistanceToNow(lastSync, { addSuffix: true })}
            </CardDescription>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="gap-2"
            data-testid="button-sync-repos"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={selectedCount <= maxProjects ? "default" : "destructive"}>
              {selectedCount} / {maxProjects} selected
            </Badge>
            {selectedCount > maxProjects && (
              <span className="text-destructive text-sm">
                Remove {selectedCount - maxProjects} project{selectedCount - maxProjects > 1 ? "s" : ""} or upgrade to Pro
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-repos"
              />
            </div>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-language-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang!}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="stars">Most stars</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repos List */}
      <div className="space-y-4">
        {filteredRepos.map((repo) => (
          <Card key={repo.id} className="hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{repo.name}</h3>
                      </div>
                      {repo.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={repo.selected}
                      onCheckedChange={() => toggleRepo(repo.id)}
                      data-testid={`switch-repo-${repo.id}`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{repo.forks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {formatDistanceToNow(repo.lastUpdated, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRepos.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No repositories found</h3>
              <p className="text-muted-foreground">
                {searchQuery || languageFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Sync your GitHub account to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
