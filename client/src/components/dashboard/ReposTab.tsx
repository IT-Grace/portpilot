import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Filter,
  GitFork,
  Github,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

type Repo = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: Date;
  repoUrl?: string;
  homepage?: string;
  topics?: string[];
  selected?: boolean;
};

export function ReposTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRepos(
          data.projects.map((project: any) => ({
            ...project,
            selected: true, // Default to selected for existing projects
            lastUpdated: project.lastUpdated 
              ? new Date(project.lastUpdated) 
              : new Date(), // Fallback to current date if null/undefined
          }))
        );
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lastSync = new Date(Date.now() - 1000 * 60 * 60 * 2);
  const selectedCount = repos.filter((r) => r.selected).length;
  const maxProjects = 6; // TODO: Get from user plan

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Sync completed:", result);
        // Refresh the dashboard data after sync
        await fetchDashboardData();
      } else {
        console.error("Sync failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error syncing repositories:", error);
    } finally {
      setSyncing(false);
    }
  };

  const toggleRepo = (id: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const languages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  );

  const filteredRepos = repos
    .filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((r) => languageFilter === "all" || r.language === languageFilter)
    .sort((a, b) => {
      if (sortBy === "stars") return b.stars - a.stars;
      if (sortBy === "updated")
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-muted-foreground">Loading repositories...</div>
      </div>
    );
  }

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
              Last synced {lastSync && !isNaN(lastSync.getTime())
                ? formatDistanceToNow(lastSync, { addSuffix: true })
                : "recently"}
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
            <Badge
              variant={selectedCount <= maxProjects ? "default" : "destructive"}
            >
              {selectedCount} / {maxProjects} selected
            </Badge>
            {selectedCount > maxProjects && (
              <span className="text-destructive text-sm">
                Remove {selectedCount - maxProjects} project
                {selectedCount - maxProjects > 1 ? "s" : ""} or upgrade to Pro
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
              <SelectTrigger
                className="w-full md:w-48"
                data-testid="select-language-filter"
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang!}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="w-full md:w-48"
                data-testid="select-sort-by"
              >
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
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
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
                      <span>
                        Updated{" "}
                        {repo.lastUpdated && !isNaN(repo.lastUpdated.getTime())
                          ? formatDistanceToNow(repo.lastUpdated, {
                              addSuffix: true,
                            })
                          : "recently"}
                      </span>
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
              <h3 className="font-semibold text-lg mb-2">
                No repositories found
              </h3>
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
