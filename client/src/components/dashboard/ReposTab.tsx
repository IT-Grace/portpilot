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
  Brain,
  Clock,
  Edit,
  Filter,
  GitFork,
  Github,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import ProjectEditModal from "./ProjectEditModal";

type Repo = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastUpdated: Date;
  lastAnalyzed?: Date | null;
  repoUrl?: string;
  homepage?: string;
  topics?: string[];
  selected?: boolean;
  analyzing?: boolean;
  analyzed?: boolean;
  detailedDescription?: string;
  features?: string[];
  technologies?: string[];
  images?: Array<{ url: string; alt: string; filename?: string }>;
};

export function ReposTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [editingProject, setEditingProject] = useState<Repo | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const mergeRepoData = (newProjects: any[], preserveStates = false) => {
    if (!preserveStates) {
      // Initial load - use default states
      return newProjects.map((project: any) => ({
        ...project,
        selected: project.selected !== false,
        analyzing: false,
        analyzed: project.analyzed || false,
        lastUpdated: project.lastUpdated
          ? new Date(project.lastUpdated)
          : new Date(),
        lastAnalyzed: project.lastAnalyzed
          ? new Date(project.lastAnalyzed)
          : null,
      }));
    }

    // Preserve existing states for sync operations
    const currentRepoStates = new Map();
    repos.forEach((repo) => {
      currentRepoStates.set(repo.id, {
        selected: repo.selected,
        analyzing: repo.analyzing,
        analyzed: repo.analyzed,
      });
    });

    return newProjects.map((project: any) => {
      const currentState = currentRepoStates.get(project.id);
      return {
        ...project,
        selected: currentState
          ? currentState.selected
          : project.selected !== false,
        analyzing: currentState ? currentState.analyzing : false,
        analyzed: project.analyzed || false,
        lastUpdated: project.lastUpdated
          ? new Date(project.lastUpdated)
          : new Date(),
        lastAnalyzed: project.lastAnalyzed
          ? new Date(project.lastAnalyzed)
          : null,
      };
    });
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const mergedRepos = mergeRepoData(data.projects, false);
        setRepos(mergedRepos);
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

  // Helper function to check if a project needs re-analysis
  const needsReAnalysis = (repo: Repo) => {
    if (!repo.analyzed || !repo.lastAnalyzed) {
      console.log(
        `${repo.name}: No re-analysis needed - analyzed: ${repo.analyzed}, lastAnalyzed: ${repo.lastAnalyzed}`
      );
      return false;
    }

    const lastAnalyzed =
      repo.lastAnalyzed instanceof Date
        ? repo.lastAnalyzed
        : new Date(repo.lastAnalyzed);
    const lastUpdated =
      repo.lastUpdated instanceof Date
        ? repo.lastUpdated
        : new Date(repo.lastUpdated);

    const needsReanalysis = lastUpdated > lastAnalyzed;
    console.log(
      `${
        repo.name
      }: lastUpdated: ${lastUpdated.toISOString()}, lastAnalyzed: ${lastAnalyzed.toISOString()}, needs reanalysis: ${needsReanalysis}`
    );

    // Needs re-analysis if repo was updated after it was analyzed
    return needsReanalysis;
  };

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

        // Show sync results to user
        const { syncedCount = 0, updatedCount = 0, removedCount = 0 } = result;
        if (syncedCount > 0 || updatedCount > 0 || removedCount > 0) {
          const parts = [];
          if (syncedCount > 0)
            parts.push(`Added ${syncedCount} new repositories`);
          if (updatedCount > 0)
            parts.push(`Updated ${updatedCount} repositories`);
          if (removedCount > 0)
            parts.push(`Removed ${removedCount} repositories`);

          const message = parts.join(", ") + ".";
          if (updatedCount > 0) {
            alert(
              `Sync completed! ${message}\n\nNote: Updated repositories may need re-analysis to refresh AI-generated content.`
            );
          } else {
            alert(`Sync completed! ${message}`);
          }
        } else {
          alert("Sync completed! All repositories are up to date.");
        }

        // Fetch updated data and merge with existing state
        const dashboardResponse = await fetch("/api/dashboard", {
          credentials: "include",
        });

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          console.log("Dashboard data after sync:", data.projects);
          const mergedRepos = mergeRepoData(data.projects, true);
          console.log("Merged repos:", mergedRepos);
          setRepos(mergedRepos);
        }
      } else {
        console.error("Sync failed:", response.statusText);
        alert("Sync failed. Please try again.");
      }
    } catch (error) {
      console.error("Error syncing repositories:", error);
      alert(
        "Error syncing repositories. Please check your connection and try again."
      );
    } finally {
      setSyncing(false);
    }
  };

  const toggleRepo = async (id: string) => {
    const repo = repos.find((r) => r.id === id);
    const newSelected = !repo?.selected;

    // Update local state immediately
    setRepos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: newSelected } : r))
    );

    // Update selection on server
    try {
      await fetch("/api/portfolio/projects/selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          projectId: id,
          selected: newSelected,
        }),
      });
    } catch (error) {
      console.error("Error updating project selection:", error);
      // Revert on error
      setRepos((prev) =>
        prev.map((r) => (r.id === id ? { ...r, selected: !newSelected } : r))
      );
    }
  };

  const analyzeProject = async (projectId: string) => {
    // Set loading state for this specific project
    setRepos((prev) =>
      prev.map((r) => (r.id === projectId ? { ...r, analyzing: true } : r))
    );

    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Project analysis completed:", result);

        // Update the project in local state with analysis results
        const updatedRepo = {
          ...repos.find((r) => r.id === projectId)!,
          ...result.project,
          analyzing: false,
          analyzed: true,
          // Ensure date fields are always Date objects
          lastUpdated: result.project.lastUpdated
            ? new Date(result.project.lastUpdated)
            : repos.find((r) => r.id === projectId)?.lastUpdated || new Date(),
          lastAnalyzed: result.project.lastAnalyzed
            ? new Date(result.project.lastAnalyzed)
            : new Date(),
        };

        setRepos((prev) =>
          prev.map((r) => (r.id === projectId ? updatedRepo : r))
        );

        // Automatically open edit modal after successful analysis
        setEditingProject(updatedRepo);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        console.error("Analysis failed:", errorData);
        alert(`Analysis failed: ${errorData.error || response.statusText}`);

        // Remove loading state
        setRepos((prev) =>
          prev.map((r) => (r.id === projectId ? { ...r, analyzing: false } : r))
        );
      }
    } catch (error) {
      console.error("Error analyzing project:", error);
      alert(
        `Error analyzing project: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Remove loading state
      setRepos((prev) =>
        prev.map((r) => (r.id === projectId ? { ...r, analyzing: false } : r))
      );
    }
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
      if (sortBy === "updated") {
        const aTime = a.lastUpdated
          ? a.lastUpdated instanceof Date
            ? a.lastUpdated.getTime()
            : new Date(a.lastUpdated).getTime()
          : 0;
        const bTime = b.lastUpdated
          ? b.lastUpdated instanceof Date
            ? b.lastUpdated.getTime()
            : new Date(b.lastUpdated).getTime()
          : 0;
        return bTime - aTime;
      }
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
              Last synced{" "}
              {lastSync && !isNaN(lastSync.getTime())
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
                    <div className="flex flex-col items-end gap-2">
                      {needsReAnalysis(repo) && (
                        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          ⚠️ Updated - Consider re-analysis
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzeProject(repo.id)}
                          className="gap-2"
                          data-testid={`button-analyze-${repo.id}`}
                          disabled={
                            repo.analyzing ||
                            (repo.analyzed && !needsReAnalysis(repo))
                          }
                        >
                          {repo.analyzing ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Analyzing...
                            </>
                          ) : needsReAnalysis(repo) ? (
                            <>
                              <Brain className="h-4 w-4" />
                              Re-analyze
                            </>
                          ) : repo.analyzed ? (
                            <>
                              <Brain className="h-4 w-4" />
                              Analyzed
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4" />
                              Analyze
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(repo)}
                          className="gap-2"
                          disabled={!repo.selected}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                      <Switch
                        checked={repo.selected}
                        onCheckedChange={() => toggleRepo(repo.id)}
                        data-testid={`switch-repo-${repo.id}`}
                      />
                    </div>
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
                        {repo.lastUpdated &&
                        repo.lastUpdated instanceof Date &&
                        !isNaN(repo.lastUpdated.getTime())
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

      {/* Project Edit Modal */}
      <ProjectEditModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onUpdate={(updatedProject) => {
          setRepos((prev) =>
            prev.map((repo) =>
              repo.id === updatedProject.id
                ? { ...repo, ...updatedProject }
                : repo
            )
          );
          setEditingProject(null);
        }}
      />
    </div>
  );
}
